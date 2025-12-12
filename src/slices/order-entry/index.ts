// Order Entry Slice - Public Exports

// Types
export * from './shared/types'

// Machine (XState)
export { OrderMachineProvider } from './shared/machines'
export {
  useOrderView,
  useCart,
  useCartTotals,
  useIsCartEmpty,
  useCartActions,
  useEditingItem,
  useEditingProduct,
  useServiceMethod,
  useInvoiceDiscount,
  useProductActions,
  useModifierActions,
  useNavigationActions,
  useSessionActions,
  useOrderActions,
} from './shared/machines'

// Hooks (data fetching)
export { useMenus } from './browse-menu/useMenus'
export { useCategories } from './browse-menu/useCategories'
export {
  useProductsByCategory,
  useProductsByMenu,
  useDirectProducts,
} from './browse-menu/useProducts'

// Components
export { OrderEntryPage } from './OrderEntryPage'
export * from './components/shared'
export * from './components/menu'
export * from './components/cart'
export { MenuBrowseView } from './browse-menu'
