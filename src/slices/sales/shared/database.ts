import { getDatabase } from '@/core/database/client'
import type { SaleWithDetails, CreateSaleInput, UpdateSaleInput, DistributorType } from './types'

/**
 * Get all sales with SOL, distributor and company details
 */
export async function getSales(): Promise<SaleWithDetails[]> {
  const database = await getDatabase()
  const sales = await database.select<SaleWithDetails[]>(`
    SELECT
      s.*,
      sol.name as sol_name,
      sol.city as sol_city,
      d.name as distributor_name,
      c.name as company_name
    FROM sales s
    JOIN sols sol ON s.sol_id = sol.id
    JOIN distributors d ON s.distributor_id = d.id
    JOIN companies c ON s.company_id = c.id
    ORDER BY s.date DESC, s.created_at DESC
  `)
  return sales
}

/**
 * Get sale by ID with details
 */
export async function getSaleById(id: number): Promise<SaleWithDetails | null> {
  const database = await getDatabase()
  const sales = await database.select<SaleWithDetails[]>(`
    SELECT
      s.*,
      sol.name as sol_name,
      sol.city as sol_city,
      d.name as distributor_name,
      c.name as company_name
    FROM sales s
    JOIN sols sol ON s.sol_id = sol.id
    JOIN distributors d ON s.distributor_id = d.id
    JOIN companies c ON s.company_id = c.id
    WHERE s.id = $1
  `, [id])
  return sales[0] || null
}

/**
 * Get sales by SOL and optional filters
 */
export async function getSalesBySol(
  solId: number,
  year?: number,
  month?: number,
  distributorType?: DistributorType
): Promise<SaleWithDetails[]> {
  const database = await getDatabase()

  let query = `
    SELECT
      s.*,
      sol.name as sol_name,
      sol.city as sol_city,
      d.name as distributor_name,
      c.name as company_name
    FROM sales s
    JOIN sols sol ON s.sol_id = sol.id
    JOIN distributors d ON s.distributor_id = d.id
    JOIN companies c ON s.company_id = c.id
    WHERE s.sol_id = $1
  `
  const params: (number | string)[] = [solId]
  let paramIndex = 2

  if (year !== undefined && month !== undefined) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    query += ` AND s.date >= $${paramIndex++} AND s.date <= $${paramIndex++}`
    params.push(startDate, endDate)
  }

  if (distributorType) {
    query += ` AND s.distributor_type = $${paramIndex++}`
    params.push(distributorType)
  }

  query += ` ORDER BY s.date DESC, s.created_at DESC`

  return database.select<SaleWithDetails[]>(query, params)
}

/**
 * Get sales by distributor within a SOL
 */
export async function getSalesByDistributor(
  distributorId: number,
  year?: number,
  month?: number
): Promise<SaleWithDetails[]> {
  const database = await getDatabase()

  let query = `
    SELECT
      s.*,
      sol.name as sol_name,
      sol.city as sol_city,
      d.name as distributor_name,
      c.name as company_name
    FROM sales s
    JOIN sols sol ON s.sol_id = sol.id
    JOIN distributors d ON s.distributor_id = d.id
    JOIN companies c ON s.company_id = c.id
    WHERE s.distributor_id = $1
  `
  const params: (number | string)[] = [distributorId]

  if (year !== undefined && month !== undefined) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    query += ` AND s.date >= $2 AND s.date <= $3`
    params.push(startDate, endDate)
  }

  query += ` ORDER BY s.date DESC, s.created_at DESC`

  return database.select<SaleWithDetails[]>(query, params)
}

/**
 * Create a new sale
 */
export async function createSale(input: CreateSaleInput) {
  const database = await getDatabase()
  const result = await database.execute(
    `INSERT INTO sales (sol_id, distributor_id, distributor_type, company_id, date, note, bank_details, amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.sol_id,
      input.distributor_id,
      input.distributor_type,
      input.company_id,
      input.date,
      input.note ?? null,
      input.bank_details ?? null,
      input.amount,
    ]
  )
  return result
}

/**
 * Update sale
 */
export async function updateSale(id: number, input: UpdateSaleInput) {
  const database = await getDatabase()
  const updates: string[] = []
  const values: (string | number | null)[] = []
  let paramIndex = 1

  if (input.sol_id !== undefined) {
    updates.push(`sol_id = $${paramIndex++}`)
    values.push(input.sol_id)
  }
  if (input.distributor_id !== undefined) {
    updates.push(`distributor_id = $${paramIndex++}`)
    values.push(input.distributor_id)
  }
  if (input.distributor_type !== undefined) {
    updates.push(`distributor_type = $${paramIndex++}`)
    values.push(input.distributor_type)
  }
  if (input.company_id !== undefined) {
    updates.push(`company_id = $${paramIndex++}`)
    values.push(input.company_id)
  }
  if (input.date !== undefined) {
    updates.push(`date = $${paramIndex++}`)
    values.push(input.date)
  }
  if (input.note !== undefined) {
    updates.push(`note = $${paramIndex++}`)
    values.push(input.note || null)
  }
  if (input.bank_details !== undefined) {
    updates.push(`bank_details = $${paramIndex++}`)
    values.push(input.bank_details || null)
  }
  if (input.amount !== undefined) {
    updates.push(`amount = $${paramIndex++}`)
    values.push(input.amount)
  }

  if (updates.length === 0) return null

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await database.execute(
    `UPDATE sales SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
    values
  )
  return result
}

/**
 * Delete sale
 */
export async function deleteSale(id: number) {
  const database = await getDatabase()
  const result = await database.execute('DELETE FROM sales WHERE id = $1', [id])
  return result
}
