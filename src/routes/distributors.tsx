import { createFileRoute } from '@tanstack/react-router'
import { ListDistributors } from '@/slices/distributors'

export const Route = createFileRoute('/distributors')({
  component: ListDistributors,
} as const)
