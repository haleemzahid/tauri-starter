import { getDatabase } from '@/core/database/client'
import type { Distributor, DistributorWithCompanies, CreateDistributorInput, UpdateDistributorInput } from './types'

/**
 * Get all distributors with their associated companies
 */
export async function getDistributors(): Promise<DistributorWithCompanies[]> {
  const database = await getDatabase()

  // Get all distributors
  const distributors = await database.select<Distributor[]>(
    'SELECT * FROM distributors ORDER BY name ASC'
  )

  // Get all distributor-company relationships
  const relationships = await database.select<{ distributor_id: number; company_id: number; company_name: string }[]>(`
    SELECT dc.distributor_id, dc.company_id, c.name as company_name
    FROM distributor_companies dc
    JOIN companies c ON dc.company_id = c.id
    ORDER BY c.name ASC
  `)

  // Map relationships to distributors
  return distributors.map(d => ({
    ...d,
    company_ids: relationships.filter(r => r.distributor_id === d.id).map(r => r.company_id),
    company_names: relationships.filter(r => r.distributor_id === d.id).map(r => r.company_name),
  }))
}

/**
 * Get distributor by ID with companies
 */
export async function getDistributorById(id: number): Promise<DistributorWithCompanies | null> {
  const database = await getDatabase()
  const distributors = await database.select<Distributor[]>(
    'SELECT * FROM distributors WHERE id = $1',
    [id]
  )

  if (!distributors[0]) return null

  const relationships = await database.select<{ company_id: number; company_name: string }[]>(`
    SELECT dc.company_id, c.name as company_name
    FROM distributor_companies dc
    JOIN companies c ON dc.company_id = c.id
    WHERE dc.distributor_id = $1
    ORDER BY c.name ASC
  `, [id])

  return {
    ...distributors[0],
    company_ids: relationships.map(r => r.company_id),
    company_names: relationships.map(r => r.company_name),
  }
}

/**
 * Get companies for a specific distributor
 */
export async function getDistributorCompanies(distributorId: number) {
  const database = await getDatabase()
  return database.select<{ id: number; name: string }[]>(`
    SELECT c.id, c.name
    FROM companies c
    JOIN distributor_companies dc ON c.id = dc.company_id
    WHERE dc.distributor_id = $1
    ORDER BY c.name ASC
  `, [distributorId])
}

/**
 * Create a new distributor with company associations
 */
export async function createDistributor(input: CreateDistributorInput) {
  const database = await getDatabase()

  // Insert distributor
  const result = await database.execute(
    `INSERT INTO distributors (name, city) VALUES ($1, $2)`,
    [input.name, input.city]
  )

  const distributorId = result.lastInsertId

  // Insert company relationships
  for (const companyId of input.company_ids) {
    await database.execute(
      `INSERT INTO distributor_companies (distributor_id, company_id) VALUES ($1, $2)`,
      [distributorId, companyId]
    )
  }

  return result
}

/**
 * Update distributor
 */
export async function updateDistributor(id: number, input: UpdateDistributorInput) {
  const database = await getDatabase()
  const updates: string[] = []
  const values: (string | number)[] = []
  let paramIndex = 1

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(input.name)
  }
  if (input.city !== undefined) {
    updates.push(`city = $${paramIndex++}`)
    values.push(input.city)
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    await database.execute(
      `UPDATE distributors SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )
  }

  // Update company relationships if provided
  if (input.company_ids !== undefined) {
    // Delete existing relationships
    await database.execute(
      `DELETE FROM distributor_companies WHERE distributor_id = $1`,
      [id]
    )

    // Insert new relationships
    for (const companyId of input.company_ids) {
      await database.execute(
        `INSERT INTO distributor_companies (distributor_id, company_id) VALUES ($1, $2)`,
        [id, companyId]
      )
    }
  }

  return { success: true }
}

/**
 * Delete distributor
 */
export async function deleteDistributor(id: number) {
  const database = await getDatabase()
  // Junction table entries will be deleted automatically due to CASCADE
  const result = await database.execute('DELETE FROM distributors WHERE id = $1', [id])
  return result
}
