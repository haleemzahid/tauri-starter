import { createFileRoute } from '@tanstack/react-router'
import { ListSales } from '@/slices/sales'

export const Route = createFileRoute('/sales')({
  component: ListSales,
} as const)
