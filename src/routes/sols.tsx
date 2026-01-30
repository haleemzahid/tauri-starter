import { createFileRoute } from '@tanstack/react-router'
import { ListSols } from '@/slices/sols'

export const Route = createFileRoute('/sols')({
  component: ListSols,
} as const)
