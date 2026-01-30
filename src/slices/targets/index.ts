// Main component
export { default as ListTargets } from './list/ListTargets'

// Types
export type {
  SolTarget,
  SolTargetWithDetails,
  PersonalTarget,
  SetSolTargetInput,
  SetPersonalTargetInput,
} from './shared/types'
export { MONTH_NAMES, getMonthName } from './shared/types'

// Hooks
export { useSolTargets, usePersonalTargets } from './list/useListTargets'
export { useSetSolTarget, useDeleteSolTarget } from './set-sol-target/useSetSolTarget'
export { useSetPersonalTarget, useDeletePersonalTarget } from './set-personal-target/useSetPersonalTarget'

// Database operations (for use in other slices)
export {
  getSolTargets,
  getSolTarget,
  setSolTarget,
  getPersonalTargets,
  getPersonalTarget,
  setPersonalTarget,
} from './shared/database'
