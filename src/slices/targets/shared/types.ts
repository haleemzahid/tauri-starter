export interface SolTarget {
  id: number
  sol_id: number
  company_id: number
  year: number
  month: number
  total_target: number
  main_target: number
  sub_target: number
  created_at: string
  updated_at: string
}

export interface SolTargetWithDetails extends SolTarget {
  sol_name: string
  sol_city: string
  main_distributor_name: string
  company_name: string
}

export interface PersonalTarget {
  id: number
  year: number
  month: number
  target_amount: number
  created_at: string
  updated_at: string
}

export interface SetSolTargetInput {
  sol_id: number
  company_id: number
  year: number
  month: number
  total_target: number
  main_target: number
}

export interface SetPersonalTargetInput {
  year: number
  month: number
  target_amount: number
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || ''
}
