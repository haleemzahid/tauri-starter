import { createFileRoute } from '@tanstack/react-router'
import { ListCompanies } from '@/slices/companies'

export const Route = createFileRoute('/companies')({
  component: ListCompanies,
} as const)
