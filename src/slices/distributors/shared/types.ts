export interface Distributor {
  id: number
  name: string
  city: string
  created_at: string
  updated_at: string
}

export interface DistributorWithCompanies extends Distributor {
  company_ids: number[]
  company_names: string[]
}

export interface CreateDistributorInput {
  name: string
  city: string
  company_ids: number[]
}

export interface UpdateDistributorInput {
  name?: string
  city?: string
  company_ids?: number[]
}
