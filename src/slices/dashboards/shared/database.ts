import { getDatabase } from '@/core/database/client'
import type {
  MyDashboardData,
  MyDashboardRow,
  SolDashboardData,
  SolDashboardSale,
  Period,
  MyGrowthData,
  GrowthComparisonRow,
  SolGrowthData,
  SolGrowthCompanyData,
} from './types'

/**
 * Get date range for a period
 */
function getDateRange(period: Period): { startDate: string; endDate: string } {
  const { type, year, month, quarter } = period

  if (type === 'annual') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    }
  }

  if (type === 'quarterly' && quarter) {
    const startMonth = (quarter - 1) * 3 + 1
    const endMonth = quarter * 3
    return {
      startDate: `${year}-${String(startMonth).padStart(2, '0')}-01`,
      endDate: `${year}-${String(endMonth).padStart(2, '0')}-31`,
    }
  }

  // Monthly
  return {
    startDate: `${year}-${String(month || 1).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month || 1).padStart(2, '0')}-31`,
  }
}

/**
 * Get My Dashboard data - all SOLs with their monthly or annual totals
 */
export async function getMyDashboardData(
  year: number,
  month: number,
  isAnnual = false
): Promise<MyDashboardData> {
  const database = await getDatabase()

  let startDate: string
  let endDate: string

  if (isAnnual) {
    startDate = `${year}-01-01`
    endDate = `${year}-12-31`
  } else {
    startDate = `${year}-${String(month).padStart(2, '0')}-01`
    endDate = `${year}-${String(month).padStart(2, '0')}-31`
  }

  // Get all SOLs with their totals split by main/sub
  const rows = await database.select<MyDashboardRow[]>(`
    SELECT
      sol.id as sol_id,
      sol.name as sol_name,
      sol.city,
      d.name as main_distributor_name,
      COALESCE(SUM(s.amount), 0) as total_amount,
      COALESCE(SUM(CASE WHEN s.distributor_type = 'main' THEN s.amount ELSE 0 END), 0) as main_amount,
      COALESCE(SUM(CASE WHEN s.distributor_type = 'sub' THEN s.amount ELSE 0 END), 0) as sub_amount
    FROM sols sol
    JOIN distributors d ON sol.main_distributor_id = d.id
    LEFT JOIN sales s ON s.sol_id = sol.id
      AND s.date >= $1 AND s.date <= $2
    GROUP BY sol.id, sol.name, sol.city, d.name
    ORDER BY sol.name ASC
  `, [startDate, endDate])

  // Get personal target(s)
  let target = 0
  if (isAnnual) {
    const targets = await database.select<{ total: number }[]>(`
      SELECT COALESCE(SUM(target_amount), 0) as total FROM personal_targets
      WHERE year = $1
    `, [year])
    target = targets[0]?.total || 0
  } else {
    const targets = await database.select<{ target_amount: number }[]>(`
      SELECT target_amount FROM personal_targets
      WHERE year = $1 AND month = $2
    `, [year, month])
    target = targets[0]?.target_amount || 0
  }

  const total = rows.reduce((sum, r) => sum + r.total_amount, 0)
  const main_total = rows.reduce((sum, r) => sum + r.main_amount, 0)
  const sub_total = rows.reduce((sum, r) => sum + r.sub_amount, 0)
  const percentage = target > 0 ? parseFloat(((total / target) * 100).toFixed(2)) : 0

  return {
    rows,
    total,
    main_total,
    sub_total,
    target,
    percentage,
    month,
    year,
    isAnnual,
  }
}

/**
 * Get SOL Dashboard data - sales grouped by company with main/sub breakdown
 */
export async function getSolDashboardData(
  solId: number,
  year: number,
  month: number,
  isAnnual = false
): Promise<SolDashboardData | null> {
  const database = await getDatabase()

  // Get SOL info with main distributor
  const sols = await database.select<{
    id: number
    name: string
    city: string
    main_distributor_id: number
    main_distributor_name: string
  }[]>(`
    SELECT s.id, s.name, s.city, s.main_distributor_id, d.name as main_distributor_name
    FROM sols s
    JOIN distributors d ON s.main_distributor_id = d.id
    WHERE s.id = $1
  `, [solId])

  if (!sols[0]) return null

  let startDate: string
  let endDate: string

  if (isAnnual) {
    startDate = `${year}-01-01`
    endDate = `${year}-12-31`
  } else {
    startDate = `${year}-${String(month).padStart(2, '0')}-01`
    endDate = `${year}-${String(month).padStart(2, '0')}-31`
  }

  // Get all companies (we'll show all companies for this SOL)
  const companies = await database.select<{ id: number; name: string }[]>(`
    SELECT id, name FROM companies ORDER BY name ASC
  `)

  // Get sales and targets for each company
  const companiesData = await Promise.all(
    companies.map(async (company) => {
      // Get sales with distributor info
      const sales = await database.select<SolDashboardSale[]>(`
        SELECT s.id, s.date, s.note, s.bank_details, s.amount,
               d.name as distributor_name, s.distributor_type
        FROM sales s
        JOIN distributors d ON s.distributor_id = d.id
        WHERE s.sol_id = $1 AND s.company_id = $2
          AND s.date >= $3 AND s.date <= $4
        ORDER BY s.date ASC
      `, [solId, company.id, startDate, endDate])

      // Get SOL target for this company
      let target = 0
      let main_target = 0
      let sub_target = 0
      if (isAnnual) {
        const targets = await database.select<{
          total: number
          main: number
          sub: number
        }[]>(`
          SELECT
            COALESCE(SUM(total_target), 0) as total,
            COALESCE(SUM(main_target), 0) as main,
            COALESCE(SUM(sub_target), 0) as sub
          FROM sol_targets
          WHERE sol_id = $1 AND company_id = $2 AND year = $3
        `, [solId, company.id, year])
        target = targets[0]?.total || 0
        main_target = targets[0]?.main || 0
        sub_target = targets[0]?.sub || 0
      } else {
        const targets = await database.select<{
          total_target: number
          main_target: number
          sub_target: number
        }[]>(`
          SELECT total_target, main_target, sub_target FROM sol_targets
          WHERE sol_id = $1 AND company_id = $2 AND year = $3 AND month = $4
        `, [solId, company.id, year, month])
        target = targets[0]?.total_target || 0
        main_target = targets[0]?.main_target || 0
        sub_target = targets[0]?.sub_target || 0
      }

      const total = sales.reduce((sum, s) => sum + s.amount, 0)
      const main_total = sales
        .filter((s) => s.distributor_type === 'main')
        .reduce((sum, s) => sum + s.amount, 0)
      const sub_total = sales
        .filter((s) => s.distributor_type === 'sub')
        .reduce((sum, s) => sum + s.amount, 0)

      const percentage = target > 0 ? parseFloat(((total / target) * 100).toFixed(2)) : 0
      const main_percentage = main_target > 0 ? parseFloat(((main_total / main_target) * 100).toFixed(2)) : 0
      const sub_percentage = sub_target > 0 ? parseFloat(((sub_total / sub_target) * 100).toFixed(2)) : 0

      return {
        company_id: company.id,
        company_name: company.name,
        sales,
        total,
        main_total,
        sub_total,
        target,
        main_target,
        sub_target,
        percentage,
        main_percentage,
        sub_percentage,
      }
    })
  )

  // Filter out companies with no sales and no targets
  const filteredCompanies = companiesData.filter(
    (c) => c.sales.length > 0 || c.target > 0
  )

  const overall_total = filteredCompanies.reduce((sum, c) => sum + c.total, 0)
  const overall_main_total = filteredCompanies.reduce((sum, c) => sum + c.main_total, 0)
  const overall_sub_total = filteredCompanies.reduce((sum, c) => sum + c.sub_total, 0)

  return {
    sol: sols[0],
    companies: filteredCompanies,
    overall_total,
    overall_main_total,
    overall_sub_total,
    month,
    year,
    isAnnual,
  }
}

/**
 * Get My Growth comparison data - compare two periods
 */
export async function getMyGrowthData(
  period1: Period,
  period2: Period
): Promise<MyGrowthData> {
  const database = await getDatabase()

  const range1 = getDateRange(period1)
  const range2 = getDateRange(period2)

  // Get all SOLs with their totals for both periods
  const rows = await database.select<{
    sol_id: number
    sol_name: string
    city: string
    period1_amount: number
    period2_amount: number
  }[]>(`
    SELECT
      sol.id as sol_id,
      sol.name as sol_name,
      sol.city,
      COALESCE((
        SELECT SUM(s1.amount) FROM sales s1
        WHERE s1.sol_id = sol.id
          AND s1.date >= $1 AND s1.date <= $2
      ), 0) as period1_amount,
      COALESCE((
        SELECT SUM(s2.amount) FROM sales s2
        WHERE s2.sol_id = sol.id
          AND s2.date >= $3 AND s2.date <= $4
      ), 0) as period2_amount
    FROM sols sol
    ORDER BY sol.name ASC
  `, [range1.startDate, range1.endDate, range2.startDate, range2.endDate])

  // Calculate growth for each SOL
  const growthRows: GrowthComparisonRow[] = rows.map((row) => {
    const growthAmount = row.period2_amount - row.period1_amount
    const growthPercentage = row.period1_amount > 0
      ? parseFloat(((growthAmount / row.period1_amount) * 100).toFixed(2))
      : row.period2_amount > 0 ? 100 : 0

    return {
      sol_id: row.sol_id,
      sol_name: row.sol_name,
      city: row.city,
      period1_amount: row.period1_amount,
      period2_amount: row.period2_amount,
      growth_amount: growthAmount,
      growth_percentage: growthPercentage,
    }
  })

  const period1Total = growthRows.reduce((sum, r) => sum + r.period1_amount, 0)
  const period2Total = growthRows.reduce((sum, r) => sum + r.period2_amount, 0)
  const totalGrowthAmount = period2Total - period1Total
  const totalGrowthPercentage = period1Total > 0
    ? parseFloat(((totalGrowthAmount / period1Total) * 100).toFixed(2))
    : period2Total > 0 ? 100 : 0

  return {
    rows: growthRows,
    period1_total: period1Total,
    period2_total: period2Total,
    growth_amount: totalGrowthAmount,
    growth_percentage: totalGrowthPercentage,
    period1,
    period2,
  }
}

/**
 * Get SOL Growth comparison data - compare two periods for a specific SOL
 */
export async function getSolGrowthData(
  solId: number,
  period1: Period,
  period2: Period
): Promise<SolGrowthData | null> {
  const database = await getDatabase()

  // Get SOL info
  const sols = await database.select<{ id: number; name: string; city: string }[]>(
    'SELECT id, name, city FROM sols WHERE id = $1',
    [solId]
  )

  if (!sols[0]) return null

  const range1 = getDateRange(period1)
  const range2 = getDateRange(period2)

  // Get all companies
  const companies = await database.select<{ id: number; name: string }[]>(`
    SELECT id, name FROM companies ORDER BY name ASC
  `)

  // Get comparison data for each company
  const companiesData: SolGrowthCompanyData[] = await Promise.all(
    companies.map(async (company) => {
      // Get period 1 total
      const p1Result = await database.select<{ total: number }[]>(`
        SELECT COALESCE(SUM(amount), 0) as total FROM sales
        WHERE sol_id = $1 AND company_id = $2
          AND date >= $3 AND date <= $4
      `, [solId, company.id, range1.startDate, range1.endDate])

      // Get period 2 total
      const p2Result = await database.select<{ total: number }[]>(`
        SELECT COALESCE(SUM(amount), 0) as total FROM sales
        WHERE sol_id = $1 AND company_id = $2
          AND date >= $3 AND date <= $4
      `, [solId, company.id, range2.startDate, range2.endDate])

      const period1Amount = p1Result[0]?.total || 0
      const period2Amount = p2Result[0]?.total || 0
      const growthAmount = period2Amount - period1Amount
      const growthPercentage = period1Amount > 0
        ? parseFloat(((growthAmount / period1Amount) * 100).toFixed(2))
        : period2Amount > 0 ? 100 : 0

      return {
        company_id: company.id,
        company_name: company.name,
        period1_amount: period1Amount,
        period2_amount: period2Amount,
        growth_amount: growthAmount,
        growth_percentage: growthPercentage,
      }
    })
  )

  // Filter out companies with no data in either period
  const filteredCompanies = companiesData.filter(
    (c) => c.period1_amount > 0 || c.period2_amount > 0
  )

  const period1Total = filteredCompanies.reduce((sum, c) => sum + c.period1_amount, 0)
  const period2Total = filteredCompanies.reduce((sum, c) => sum + c.period2_amount, 0)
  const totalGrowthAmount = period2Total - period1Total
  const totalGrowthPercentage = period1Total > 0
    ? parseFloat(((totalGrowthAmount / period1Total) * 100).toFixed(2))
    : period2Total > 0 ? 100 : 0

  return {
    sol: sols[0],
    companies: filteredCompanies,
    period1_total: period1Total,
    period2_total: period2Total,
    growth_amount: totalGrowthAmount,
    growth_percentage: totalGrowthPercentage,
    period1,
    period2,
  }
}
