// Main component
export { default as ListSales } from './list/ListSales'

// Types
export type {
  Sale,
  SaleWithDetails,
  CreateSaleInput,
  UpdateSaleInput,
  DistributorType,
} from './shared/types'

// Hooks
export { useListSales } from './list/useListSales'
export { useCreateSale } from './create/useCreateSale'
export { useUpdateSale } from './update/useUpdateSale'
export { useDeleteSale } from './delete/useDeleteSale'

// Database operations (for use in other slices)
export {
  getSales,
  getSaleById,
  getSalesBySol,
  getSalesByDistributor,
} from './shared/database'
