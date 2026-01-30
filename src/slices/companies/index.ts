// Main component
export { default as ListCompanies } from './list/ListCompanies'

// Types
export type { Company, CreateCompanyInput, UpdateCompanyInput } from './shared/types'

// Hooks
export { useListCompanies } from './list/useListCompanies'
export { useCreateCompany } from './create/useCreateCompany'
export { useUpdateCompany } from './update/useUpdateCompany'
export { useDeleteCompany } from './delete/useDeleteCompany'

// Database operations (for use in other slices)
export { getCompanies, getCompanyById } from './shared/database'
