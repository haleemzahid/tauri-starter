// UI State Atoms

import { atom, useAtomValue, useSetAtom } from 'jotai'
import type { Menu, MenuCategory, Product, ToppingCategory } from '../types'

// === View State ===

export type OrderEntryView =
  | 'menu' // Menu browsing (default)
  | 'modifiers' // Product configuration
  | 'discount' // Discount selection
  | 'payment' // Payment processing
  | 'hold-invoices' // Hold invoices list

export const currentViewAtom = atom<OrderEntryView>('menu')

// === Menu Selection State ===

export const selectedMenuAtom = atom<Menu | null>(null)
export const selectedCategoryAtom = atom<MenuCategory | null>(null)
export const selectedProductAtom = atom<Product | null>(null)

// === Modifier Configuration State ===

export type ModifierTab =
  | 'sizes'
  | 'types'
  | 'portions'
  | 'modifier-groups'
  | 'modifiers'

export const selectedModifierTabAtom = atom<ModifierTab>('sizes')
export const selectedToppingCategoryAtom = atom<ToppingCategory | null>(null)
export const selectedPortionIndexAtom = atom<number>(0) // Which portion is being configured

// === Derived: Available Tabs ===

export const availableTabsAtom = atom<ModifierTab[]>((get) => {
  const product = get(selectedProductAtom)
  if (!product) return []

  const tabs: ModifierTab[] = []

  if (product.assignedSizes && product.assignedSizes.length > 0) {
    tabs.push('sizes')
  }
  if (product.productTypes && product.productTypes.length > 0) {
    tabs.push('types')
  }
  if (product.portionTypes && product.portionTypes.length > 0) {
    tabs.push('portions')
  }
  if (product.toppingCategories && product.toppingCategories.length > 1) {
    tabs.push('modifier-groups')
  }
  if (product.toppingCategories && product.toppingCategories.length > 0) {
    tabs.push('modifiers')
  }

  return tabs
})

// === UI Flags ===

export const isLoadingAtom = atom<boolean>(false)
export const showCustomerDialogAtom = atom<boolean>(false)
export const showPinDialogAtom = atom<boolean>(false)

// === Hooks ===

export const useCurrentView = () => useAtomValue(currentViewAtom)
export const useSetCurrentView = () => useSetAtom(currentViewAtom)

export const useSelectedMenu = () => useAtomValue(selectedMenuAtom)
export const useSetSelectedMenu = () => useSetAtom(selectedMenuAtom)

export const useSelectedCategory = () => useAtomValue(selectedCategoryAtom)
export const useSetSelectedCategory = () => useSetAtom(selectedCategoryAtom)

export const useSelectedProduct = () => useAtomValue(selectedProductAtom)
export const useSetSelectedProduct = () => useSetAtom(selectedProductAtom)

export const useSelectedModifierTab = () =>
  useAtomValue(selectedModifierTabAtom)
export const useSetSelectedModifierTab = () =>
  useSetAtom(selectedModifierTabAtom)

export const useAvailableTabs = () => useAtomValue(availableTabsAtom)

export const useSelectedToppingCategory = () =>
  useAtomValue(selectedToppingCategoryAtom)
export const useSetSelectedToppingCategory = () =>
  useSetAtom(selectedToppingCategoryAtom)

export const useIsLoading = () => useAtomValue(isLoadingAtom)
export const useSetIsLoading = () => useSetAtom(isLoadingAtom)
