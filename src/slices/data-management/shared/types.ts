export interface ExportData {
  version: string
  exportedAt: string
  data: {
    companies: CompanyExport[]
    distributors: DistributorExport[]
    distributor_companies: DistributorCompanyExport[]
    sales: SaleExport[]
    distributor_targets: DistributorTargetExport[]
    personal_targets: PersonalTargetExport[]
  }
}

export interface CompanyExport {
  id: number
  name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface DistributorExport {
  id: number
  name: string
  city: string
  created_at: string
  updated_at: string
}

export interface DistributorCompanyExport {
  id: number
  distributor_id: number
  company_id: number
  created_at: string
}

export interface SaleExport {
  id: number
  distributor_id: number
  company_id: number
  date: string
  note: string | null
  bank_details: string | null
  amount: number
  created_at: string
  updated_at: string
}

export interface DistributorTargetExport {
  id: number
  distributor_id: number
  company_id: number
  year: number
  month: number
  target_amount: number
  created_at: string
  updated_at: string
}

export interface PersonalTargetExport {
  id: number
  year: number
  month: number
  target_amount: number
  created_at: string
  updated_at: string
}

export const CURRENT_EXPORT_VERSION = '1.0.0'
