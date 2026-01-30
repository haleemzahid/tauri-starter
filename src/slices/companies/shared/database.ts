import { getDatabase } from '@/core/database/client'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from './types'

/**
 * Get all companies
 */
export async function getCompanies() {
  const database = await getDatabase()
  const companies = await database.select<Company[]>(
    'SELECT * FROM companies ORDER BY name ASC'
  )
  return companies
}

/**
 * Get company by ID
 */
export async function getCompanyById(id: number) {
  const database = await getDatabase()
  const companies = await database.select<Company[]>(
    'SELECT * FROM companies WHERE id = $1',
    [id]
  )
  return companies[0] || null
}

/**
 * Create a new company
 */
export async function createCompany(input: CreateCompanyInput) {
  const database = await getDatabase()
  const result = await database.execute(
    `INSERT INTO companies (name, contact_email, contact_phone, address)
     VALUES ($1, $2, $3, $4)`,
    [
      input.name,
      input.contact_email ?? null,
      input.contact_phone ?? null,
      input.address ?? null,
    ]
  )
  return result
}

/**
 * Update company
 */
export async function updateCompany(id: number, input: UpdateCompanyInput) {
  const database = await getDatabase()
  const updates: string[] = []
  const values: (string | number | null)[] = []
  let paramIndex = 1

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(input.name)
  }
  if (input.contact_email !== undefined) {
    updates.push(`contact_email = $${paramIndex++}`)
    values.push(input.contact_email || null)
  }
  if (input.contact_phone !== undefined) {
    updates.push(`contact_phone = $${paramIndex++}`)
    values.push(input.contact_phone || null)
  }
  if (input.address !== undefined) {
    updates.push(`address = $${paramIndex++}`)
    values.push(input.address || null)
  }

  if (updates.length === 0) return null

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await database.execute(
    `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
    values
  )
  return result
}

/**
 * Delete company
 */
export async function deleteCompany(id: number) {
  const database = await getDatabase()
  const result = await database.execute('DELETE FROM companies WHERE id = $1', [id])
  return result
}
