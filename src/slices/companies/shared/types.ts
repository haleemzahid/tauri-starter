export interface Company {
  id: number
  name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface CreateCompanyInput {
  name: string
  contact_email?: string
  contact_phone?: string
  address?: string
}

export interface UpdateCompanyInput {
  name?: string
  contact_email?: string
  contact_phone?: string
  address?: string
}
