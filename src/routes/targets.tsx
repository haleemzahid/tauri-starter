import { createFileRoute } from '@tanstack/react-router'
import { ListTargets } from '@/slices/targets'

export const Route = createFileRoute('/targets')({
  component: ListTargets,
} as const)
