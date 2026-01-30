import { getDatabase } from '@/core/database/client'
import type {
  SolTarget,
  SolTargetWithDetails,
  PersonalTarget,
  SetSolTargetInput,
  SetPersonalTargetInput,
} from './types'

/**
 * Get all SOL targets with details
 */
export async function getSolTargets(
  year?: number,
  month?: number
): Promise<SolTargetWithDetails[]> {
  const database = await getDatabase()

  let query = `
    SELECT
      st.*,
      s.name as sol_name,
      s.city as sol_city,
      d.name as main_distributor_name,
      c.name as company_name
    FROM sol_targets st
    JOIN sols s ON st.sol_id = s.id
    JOIN distributors d ON s.main_distributor_id = d.id
    JOIN companies c ON st.company_id = c.id
  `
  const params: number[] = []

  if (year !== undefined && month !== undefined) {
    query += ` WHERE st.year = $1 AND st.month = $2`
    params.push(year, month)
  }

  query += ` ORDER BY s.name ASC, c.name ASC`

  return database.select<SolTargetWithDetails[]>(query, params)
}

/**
 * Get target for a specific SOL + company + month
 */
export async function getSolTarget(
  solId: number,
  companyId: number,
  year: number,
  month: number
): Promise<SolTarget | null> {
  const database = await getDatabase()
  const targets = await database.select<SolTarget[]>(`
    SELECT * FROM sol_targets
    WHERE sol_id = $1 AND company_id = $2 AND year = $3 AND month = $4
  `, [solId, companyId, year, month])
  return targets[0] || null
}

/**
 * Set (create or update) SOL target - uses UPSERT
 * sub_target is automatically calculated as total_target - main_target
 */
export async function setSolTarget(input: SetSolTargetInput) {
  const database = await getDatabase()
  const subTarget = input.total_target - input.main_target

  const result = await database.execute(`
    INSERT INTO sol_targets (sol_id, company_id, year, month, total_target, main_target, sub_target)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT(sol_id, company_id, year, month)
    DO UPDATE SET
      total_target = $5,
      main_target = $6,
      sub_target = $7,
      updated_at = CURRENT_TIMESTAMP
  `, [
    input.sol_id,
    input.company_id,
    input.year,
    input.month,
    input.total_target,
    input.main_target,
    subTarget,
  ])

  return result
}

/**
 * Delete SOL target
 */
export async function deleteSolTarget(id: number) {
  const database = await getDatabase()
  return database.execute('DELETE FROM sol_targets WHERE id = $1', [id])
}

/**
 * Get all personal targets
 */
export async function getPersonalTargets(): Promise<PersonalTarget[]> {
  const database = await getDatabase()
  return database.select<PersonalTarget[]>(`
    SELECT * FROM personal_targets
    ORDER BY year DESC, month DESC
  `)
}

/**
 * Get personal target for a specific month
 */
export async function getPersonalTarget(
  year: number,
  month: number
): Promise<PersonalTarget | null> {
  const database = await getDatabase()
  const targets = await database.select<PersonalTarget[]>(`
    SELECT * FROM personal_targets WHERE year = $1 AND month = $2
  `, [year, month])
  return targets[0] || null
}

/**
 * Set (create or update) personal target - uses UPSERT
 */
export async function setPersonalTarget(input: SetPersonalTargetInput) {
  const database = await getDatabase()

  const result = await database.execute(`
    INSERT INTO personal_targets (year, month, target_amount)
    VALUES ($1, $2, $3)
    ON CONFLICT(year, month)
    DO UPDATE SET target_amount = $3, updated_at = CURRENT_TIMESTAMP
  `, [
    input.year,
    input.month,
    input.target_amount,
  ])

  return result
}

/**
 * Delete personal target
 */
export async function deletePersonalTarget(id: number) {
  const database = await getDatabase()
  return database.execute('DELETE FROM personal_targets WHERE id = $1', [id])
}
