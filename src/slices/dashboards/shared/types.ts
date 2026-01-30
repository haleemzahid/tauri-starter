export interface MyDashboardRow {
  sol_id: number
  sol_name: string
  city: string
  main_distributor_name: string
  total_amount: number
  main_amount: number
  sub_amount: number
}

export interface MyDashboardData {
  rows: MyDashboardRow[]
  total: number
  main_total: number
  sub_total: number
  target: number
  percentage: number
  month: number
  year: number
  isAnnual?: boolean
}

export interface SolDashboardSale {
  id: number
  date: string
  note: string | null
  bank_details: string | null
  amount: number
  distributor_name: string
  distributor_type: 'main' | 'sub'
}

export interface SolDashboardCompanyData {
  company_id: number
  company_name: string
  sales: SolDashboardSale[]
  total: number
  main_total: number
  sub_total: number
  target: number
  main_target: number
  sub_target: number
  percentage: number
  main_percentage: number
  sub_percentage: number
}

export interface SolDashboardData {
  sol: {
    id: number
    name: string
    city: string
    main_distributor_id: number
    main_distributor_name: string
  }
  companies: SolDashboardCompanyData[]
  overall_total: number
  overall_main_total: number
  overall_sub_total: number
  month: number
  year: number
  isAnnual?: boolean
}

// Growth Comparison Types
export type PeriodType = 'monthly' | 'quarterly' | 'annual'

export interface Period {
  type: PeriodType
  year: number
  month?: number // 1-12 for monthly
  quarter?: number // 1-4 for quarterly
}

export interface GrowthComparisonRow {
  sol_id: number
  sol_name: string
  city: string
  period1_amount: number
  period2_amount: number
  growth_amount: number
  growth_percentage: number
}

export interface MyGrowthData {
  rows: GrowthComparisonRow[]
  period1_total: number
  period2_total: number
  growth_amount: number
  growth_percentage: number
  period1: Period
  period2: Period
}

export interface SolGrowthCompanyData {
  company_id: number
  company_name: string
  period1_amount: number
  period2_amount: number
  growth_amount: number
  growth_percentage: number
}

export interface SolGrowthData {
  sol: {
    id: number
    name: string
    city: string
  }
  companies: SolGrowthCompanyData[]
  period1_total: number
  period2_total: number
  growth_amount: number
  growth_percentage: number
  period1: Period
  period2: Period
}
