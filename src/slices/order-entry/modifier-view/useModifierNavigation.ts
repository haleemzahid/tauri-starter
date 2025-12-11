// useModifierNavigation - Handles auto-advance tab logic

import { useCallback } from 'react'
import {
  useSelectedProduct,
  useSelectedModifierTab,
  useSetSelectedModifierTab,
  useAvailableTabs,
  type ModifierTab,
} from '../shared/store/ui-atoms'
import {
  useModifierSelections,
  useSetActiveToppingCategory,
} from '../shared/store/modifier-atoms'

/**
 * Hook for managing modifier tab navigation with auto-advance logic.
 *
 * Auto-advance rules:
 * - Size selected → advance to Types (or next available)
 * - Type selected → advance to Portions (or next available)
 * - Portion selected → advance to Modifier Groups (or Modifiers)
 * - Modifier Group selected → NO auto-advance (user may select multiple)
 */
export function useModifierNavigation() {
  const product = useSelectedProduct()
  const currentTab = useSelectedModifierTab()
  const setTab = useSetSelectedModifierTab()
  const availableTabs = useAvailableTabs()
  const selections = useModifierSelections()
  const setActiveToppingCategory = useSetActiveToppingCategory()

  // Get next tab in sequence
  const getNextTab = useCallback(
    (fromTab: ModifierTab): ModifierTab | null => {
      const tabOrder: ModifierTab[] = [
        'sizes',
        'types',
        'portions',
        'modifier-groups',
        'modifiers',
      ]
      const currentIndex = tabOrder.indexOf(fromTab)

      for (let i = currentIndex + 1; i < tabOrder.length; i++) {
        if (availableTabs.includes(tabOrder[i])) {
          return tabOrder[i]
        }
      }
      return null
    },
    [availableTabs]
  )

  // Auto-advance after size selection
  const advanceAfterSize = useCallback(() => {
    const next = getNextTab('sizes')
    if (next) setTab(next)
  }, [getNextTab, setTab])

  // Auto-advance after type selection
  const advanceAfterType = useCallback(() => {
    const next = getNextTab('types')
    if (next) setTab(next)
  }, [getNextTab, setTab])

  // Auto-advance after portion selection
  const advanceAfterPortion = useCallback(() => {
    const next = getNextTab('portions')
    if (next) setTab(next)
  }, [getNextTab, setTab])

  // When modifier group is selected - go to modifiers tab but DON'T auto-advance further
  const selectModifierGroup = useCallback(
    (categoryId: string) => {
      const category = product?.toppingCategories?.find(
        (c) => c.id === categoryId
      )
      if (category) {
        setActiveToppingCategory(category)
        setTab('modifiers')
      }
    },
    [product, setActiveToppingCategory, setTab]
  )

  // Navigate to specific tab
  const goToTab = useCallback(
    (tab: ModifierTab) => {
      if (availableTabs.includes(tab)) {
        setTab(tab)
      }
    },
    [availableTabs, setTab]
  )

  // Get first available tab (for initial selection)
  const getFirstTab = useCallback((): ModifierTab => {
    return availableTabs[0] || 'modifiers'
  }, [availableTabs])

  // Check if we can proceed to modifiers (size/type selected if required)
  const canAccessModifiers = useCallback((): boolean => {
    if (!product) return false

    // If product has sizes, one must be selected
    if (
      product.assignedSizes?.length &&
      product.assignedSizes.length > 0 &&
      !selections.sizeId
    ) {
      return false
    }

    // If product has types, one must be selected
    if (
      product.productTypes?.length &&
      product.productTypes.length > 0 &&
      !selections.typeId
    ) {
      return false
    }

    return true
  }, [product, selections])

  return {
    currentTab,
    availableTabs,
    goToTab,
    getFirstTab,
    getNextTab,
    advanceAfterSize,
    advanceAfterType,
    advanceAfterPortion,
    selectModifierGroup,
    canAccessModifiers,
  }
}
