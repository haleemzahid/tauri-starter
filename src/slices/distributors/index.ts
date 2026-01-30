// Main component
export { default as ListDistributors } from './list/ListDistributors'

// Types
export type {
  Distributor,
  DistributorWithCompanies,
  CreateDistributorInput,
  UpdateDistributorInput,
} from './shared/types'

// Hooks
export { useListDistributors } from './list/useListDistributors'
export { useCreateDistributor } from './create/useCreateDistributor'
export { useUpdateDistributor } from './update/useUpdateDistributor'
export { useDeleteDistributor } from './delete/useDeleteDistributor'

// Database operations (for use in other slices)
export { getDistributors, getDistributorById, getDistributorCompanies } from './shared/database'
