import { createFileRoute } from '@tanstack/react-router'
import { SolGrowthDashboard } from '@/slices/dashboards'

export const Route = createFileRoute('/dashboard/growth/$solId')({
  component: SolGrowthDashboard,
})
