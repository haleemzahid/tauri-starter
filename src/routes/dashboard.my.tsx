import { createFileRoute } from '@tanstack/react-router'
import { MyDashboard } from '@/slices/dashboards'

export const Route = createFileRoute('/dashboard/my')({
  component: MyDashboard,
} as const)
