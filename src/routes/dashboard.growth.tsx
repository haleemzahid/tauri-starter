import { createFileRoute } from '@tanstack/react-router'
import { MyGrowthDashboard } from '@/slices/dashboards'

export const Route = createFileRoute('/dashboard/growth')({
  component: MyGrowthDashboard,
} as const)
