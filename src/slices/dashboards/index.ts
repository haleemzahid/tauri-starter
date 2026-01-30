// Main components
export { default as MyDashboard } from './my-dashboard/MyDashboard'
export { default as SolDashboard } from './sol-dashboard/SolDashboard'
export { default as MyGrowthDashboard } from './growth-dashboard/MyGrowthDashboard'
export { default as SolGrowthDashboard } from './growth-dashboard/SolGrowthDashboard'

// Shared components
export { MonthYearPicker } from './components/MonthYearPicker'
export { PeriodSelector, formatPeriod } from './components/PeriodSelector'

// Types
export type {
  MyDashboardData,
  MyDashboardRow,
  SolDashboardData,
  SolDashboardCompanyData,
  SolDashboardSale,
  Period,
  PeriodType,
  MyGrowthData,
  GrowthComparisonRow,
  SolGrowthData,
  SolGrowthCompanyData,
} from './shared/types'

// Hooks
export { useMyDashboard } from './my-dashboard/useMyDashboard'
export { useSolDashboard } from './sol-dashboard/useSolDashboard'
export { useMyGrowth } from './growth-dashboard/useMyGrowth'
export { useSolGrowth } from './growth-dashboard/useSolGrowth'

// Database operations
export {
  getMyDashboardData,
  getSolDashboardData,
  getMyGrowthData,
  getSolGrowthData,
} from './shared/database'
