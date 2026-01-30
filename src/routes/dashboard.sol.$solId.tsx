import { createFileRoute } from '@tanstack/react-router'
import { SolDashboard } from '@/slices/dashboards'

export const Route = createFileRoute('/dashboard/sol/$solId')({
  component: SolDashboard,
})
