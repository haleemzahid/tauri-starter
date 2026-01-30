export type DistributorType = 'main' | 'sub'

export interface Sale {
  id: number
  sol_id: number
  distributor_id: number
  distributor_type: DistributorType
  company_id: number
  date: string
  note: string | null
  bank_details: string | null
  amount: number
  created_at: string
  updated_at: string
}

export interface SaleWithDetails extends Sale {
  sol_name: string
  sol_city: string
  distributor_name: string
  company_name: string
}

export interface CreateSaleInput {
  sol_id: number
  distributor_id: number
  distributor_type: DistributorType
  company_id: number
  date: string
  note?: string
  bank_details?: string
  amount: number
}

export interface UpdateSaleInput {
  sol_id?: number
  distributor_id?: number
  distributor_type?: DistributorType
  company_id?: number
  date?: string
  note?: string
  bank_details?: string
  amount?: number
}
