export interface Sol {
  id: number
  name: string
  city: string
  main_distributor_id: number
  created_at: string
  updated_at: string
}

export interface SolWithDetails extends Sol {
  main_distributor_name: string
  sub_distributor_ids: number[]
  sub_distributor_names: string[]
}

export interface SubDistributor {
  id: number
  name: string
  city: string
}

export interface CreateSolInput {
  name: string
  city: string
  main_distributor_id: number
  sub_distributor_ids: number[]
}

export interface UpdateSolInput {
  name?: string
  city?: string
  main_distributor_id?: number
  sub_distributor_ids?: number[]
}
