import { getDatabase } from '@/core/database/client'
import type { Sol, SolWithDetails, CreateSolInput, UpdateSolInput, SubDistributor } from './types'

/**
 * Get all SOLs with their main distributor and sub-distributors
 */
export async function getSols(): Promise<SolWithDetails[]> {
  const database = await getDatabase()

  // Get all SOLs with main distributor info
  const sols = await database.select<(Sol & { main_distributor_name: string })[]>(`
    SELECT s.*, d.name as main_distributor_name
    FROM sols s
    JOIN distributors d ON s.main_distributor_id = d.id
    ORDER BY s.name ASC
  `)

  // Get all sub-distributor relationships
  const subDistributors = await database.select<{
    sol_id: number
    distributor_id: number
    distributor_name: string
  }[]>(`
    SELECT ssd.sol_id, ssd.distributor_id, d.name as distributor_name
    FROM sol_sub_distributors ssd
    JOIN distributors d ON ssd.distributor_id = d.id
    ORDER BY d.name ASC
  `)

  // Map sub-distributors to SOLs
  return sols.map((s) => ({
    ...s,
    sub_distributor_ids: subDistributors
      .filter((sd) => sd.sol_id === s.id)
      .map((sd) => sd.distributor_id),
    sub_distributor_names: subDistributors
      .filter((sd) => sd.sol_id === s.id)
      .map((sd) => sd.distributor_name),
  }))
}

/**
 * Get SOL by ID with full details
 */
export async function getSolById(id: number): Promise<SolWithDetails | null> {
  const database = await getDatabase()

  const sols = await database.select<(Sol & { main_distributor_name: string })[]>(`
    SELECT s.*, d.name as main_distributor_name
    FROM sols s
    JOIN distributors d ON s.main_distributor_id = d.id
    WHERE s.id = $1
  `, [id])

  if (!sols[0]) return null

  const subDistributors = await database.select<{
    distributor_id: number
    distributor_name: string
  }[]>(`
    SELECT ssd.distributor_id, d.name as distributor_name
    FROM sol_sub_distributors ssd
    JOIN distributors d ON ssd.distributor_id = d.id
    WHERE ssd.sol_id = $1
    ORDER BY d.name ASC
  `, [id])

  return {
    ...sols[0],
    sub_distributor_ids: subDistributors.map((sd) => sd.distributor_id),
    sub_distributor_names: subDistributors.map((sd) => sd.distributor_name),
  }
}

/**
 * Get sub-distributors for a specific SOL
 */
export async function getSolSubDistributors(solId: number): Promise<SubDistributor[]> {
  const database = await getDatabase()
  return database.select<SubDistributor[]>(`
    SELECT d.id, d.name, d.city
    FROM distributors d
    JOIN sol_sub_distributors ssd ON d.id = ssd.distributor_id
    WHERE ssd.sol_id = $1
    ORDER BY d.name ASC
  `, [solId])
}

/**
 * Get main distributor for a SOL
 */
export async function getSolMainDistributor(solId: number): Promise<SubDistributor | null> {
  const database = await getDatabase()
  const results = await database.select<SubDistributor[]>(`
    SELECT d.id, d.name, d.city
    FROM distributors d
    JOIN sols s ON d.id = s.main_distributor_id
    WHERE s.id = $1
  `, [solId])
  return results[0] ?? null
}

/**
 * Get all distributors for a SOL (main + sub)
 */
export async function getSolAllDistributors(solId: number): Promise<{ distributor: SubDistributor; type: 'main' | 'sub' }[]> {
  const database = await getDatabase()

  // Get main distributor
  const mainResult = await database.select<SubDistributor[]>(`
    SELECT d.id, d.name, d.city
    FROM distributors d
    JOIN sols s ON d.id = s.main_distributor_id
    WHERE s.id = $1
  `, [solId])

  // Get sub distributors
  const subResults = await database.select<SubDistributor[]>(`
    SELECT d.id, d.name, d.city
    FROM distributors d
    JOIN sol_sub_distributors ssd ON d.id = ssd.distributor_id
    WHERE ssd.sol_id = $1
    ORDER BY d.name ASC
  `, [solId])

  const result: { distributor: SubDistributor; type: 'main' | 'sub' }[] = []

  if (mainResult[0]) {
    result.push({ distributor: mainResult[0], type: 'main' })
  }

  for (const sub of subResults) {
    result.push({ distributor: sub, type: 'sub' })
  }

  return result
}

/**
 * Create a new SOL with sub-distributors
 */
export async function createSol(input: CreateSolInput) {
  const database = await getDatabase()

  // Insert SOL
  const result = await database.execute(
    `INSERT INTO sols (name, city, main_distributor_id) VALUES ($1, $2, $3)`,
    [input.name, input.city, input.main_distributor_id]
  )

  const solId = result.lastInsertId

  // Insert sub-distributor relationships
  for (const distributorId of input.sub_distributor_ids) {
    await database.execute(
      `INSERT INTO sol_sub_distributors (sol_id, distributor_id) VALUES ($1, $2)`,
      [solId, distributorId]
    )
  }

  return result
}

/**
 * Update SOL
 */
export async function updateSol(id: number, input: UpdateSolInput) {
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
  if (input.main_distributor_id !== undefined) {
    updates.push(`main_distributor_id = $${paramIndex++}`)
    values.push(input.main_distributor_id)
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    await database.execute(
      `UPDATE sols SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )
  }

  // Update sub-distributor relationships if provided
  if (input.sub_distributor_ids !== undefined) {
    // Delete existing relationships
    await database.execute(
      `DELETE FROM sol_sub_distributors WHERE sol_id = $1`,
      [id]
    )

    // Insert new relationships
    for (const distributorId of input.sub_distributor_ids) {
      await database.execute(
        `INSERT INTO sol_sub_distributors (sol_id, distributor_id) VALUES ($1, $2)`,
        [id, distributorId]
      )
    }
  }

  return { success: true }
}

/**
 * Delete SOL
 */
export async function deleteSol(id: number) {
  const database = await getDatabase()
  // Junction table entries will be deleted automatically due to CASCADE
  const result = await database.execute('DELETE FROM sols WHERE id = $1', [id])
  return result
}
