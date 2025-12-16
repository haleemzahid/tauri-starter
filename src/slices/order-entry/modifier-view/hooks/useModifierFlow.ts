// useModifierFlow - All modifier tab state & logic extracted from ModifierView

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useEditingItem, useEditingProduct } from '../../shared/machines'
import type { ToppingCategory } from '../../shared/types'

export type ModifierTab =
  | 'sizes'
  | 'types'
  | 'portions'
  | 'modifier-groups'
  | 'modifiers'

export function useModifierFlow() {
  const product = useEditingProduct()
  const item = useEditingItem()
  const [currentTab, setCurrentTab] = useState<ModifierTab>('sizes')
  const [activeCategory, setActiveCategory] = useState<ToppingCategory | null>(
    null
  )
  const [activePortionId, setActivePortionId] = useState<string | null>(null)

  // Determine available tabs based on product
  const availableTabs = useMemo(() => {
    const tabs: ModifierTab[] = []
    if (product?.assignedSizes?.length) tabs.push('sizes')
    if (product?.productTypes?.length) tabs.push('types')
    if (product?.portionTypes?.length) tabs.push('portions')
    if ((product?.toppingCategories?.length ?? 0) > 1)
      tabs.push('modifier-groups')
    if (product?.toppingCategories?.length) tabs.push('modifiers')
    return tabs
  }, [product])

  // Get mandatory categories
  const mandatoryCategories = useMemo(() => {
    return product?.toppingCategories?.filter((c) => c.isMandatory) ?? []
  }, [product?.toppingCategories])

  // Check which mandatory categories are unsatisfied
  const unsatisfiedMandatory = useMemo(() => {
    if (!item) return mandatoryCategories
    return mandatoryCategories.filter((category) => {
      const toppingIds = new Set(category.toppings?.map((t) => t.id) ?? [])
      const hasSelection = item.modifiers.some((m) =>
        toppingIds.has(m.topping.id)
      )
      return !hasSelection
    })
  }, [item?.modifiers, mandatoryCategories])

  const firstUnsatisfied = unsatisfiedMandatory[0] ?? null

  // Check if a category is locked (optional when mandatory not satisfied)
  const isCategoryLocked = useCallback(
    (category: ToppingCategory): boolean => {
      if (unsatisfiedMandatory.length === 0) return false
      return !category.isMandatory
    },
    [unsatisfiedMandatory]
  )

  // Is modifiers tab locked due to viewing optional category?
  const isModifiersTabLocked =
    unsatisfiedMandatory.length > 0 &&
    activeCategory &&
    !activeCategory.isMandatory

  // Check if a tab is locked based on sequential requirements
  const isTabLocked = useCallback(
    (tab: ModifierTab): boolean => {
      if (!availableTabs.includes(tab)) return true
      const tabOrder: ModifierTab[] = [
        'sizes',
        'types',
        'portions',
        'modifier-groups',
        'modifiers',
      ]
      const tabIndex = tabOrder.indexOf(tab)

      // Check each prior tab - if required and not satisfied, this tab is locked
      for (let i = 0; i < tabIndex; i++) {
        const priorTab = tabOrder[i]
        if (!availableTabs.includes(priorTab)) continue

        // Check if prior tab selection is satisfied
        if (
          priorTab === 'sizes' &&
          product?.assignedSizes?.length &&
          !item?.size
        )
          return true
        if (
          priorTab === 'types' &&
          product?.productTypes?.length &&
          !item?.type
        )
          return true
        if (
          priorTab === 'portions' &&
          product?.portionTypes?.length &&
          item?.portions.length === 0
        )
          return true
      }
      return false
    },
    [availableTabs, product, item]
  )

  // Set initial tab when product changes
  useEffect(() => {
    if (product && availableTabs.length > 0) {
      setCurrentTab(availableTabs[0])
      if (product.toppingCategories?.length) {
        setActiveCategory(product.toppingCategories[0])
      }
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select last portion when a new portion is added
  const portionsLength = item?.portions.length ?? 0
  useEffect(() => {
    if (portionsLength > 0 && item?.portions) {
      setActivePortionId(item.portions[portionsLength - 1].id)
    } else {
      setActivePortionId(null)
    }
  }, [portionsLength]) // eslint-disable-line react-hooks/exhaustive-deps

  // Switch to valid tab when current tab becomes locked (e.g., after deleting portions)
  useEffect(() => {
    if (isTabLocked(currentTab)) {
      // Find first unlocked tab
      const tabOrder: ModifierTab[] = [
        'sizes',
        'types',
        'portions',
        'modifier-groups',
        'modifiers',
      ]
      for (const tab of tabOrder) {
        if (availableTabs.includes(tab) && !isTabLocked(tab)) {
          setCurrentTab(tab)
          return
        }
      }
    }
  }, [currentTab, isTabLocked, availableTabs])

  // Advance to next tab
  const advanceTab = useCallback(
    (fromTab: ModifierTab) => {
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
          setCurrentTab(tabOrder[i])
          return
        }
      }
    },
    [availableTabs]
  )

  // Select category and go to modifiers tab
  const selectCategory = useCallback((cat: ToppingCategory) => {
    setActiveCategory(cat)
    setCurrentTab('modifiers')
  }, [])

  // Go to first unsatisfied required category
  const goToRequired = useCallback(() => {
    if (firstUnsatisfied) {
      setActiveCategory(firstUnsatisfied)
    }
  }, [firstUnsatisfied])

  // Safe tab change that respects locking
  const safeSetCurrentTab = useCallback(
    (tab: ModifierTab) => {
      if (!isTabLocked(tab)) {
        setCurrentTab(tab)
      }
    },
    [isTabLocked]
  )

  // Select which portion to edit
  const selectPortion = useCallback((portionId: string) => {
    setActivePortionId(portionId)
  }, [])

  // Get active portion object
  const activePortion = useMemo(() => {
    if (!activePortionId || !item?.portions.length) return null
    return item.portions.find((p) => p.id === activePortionId) ?? null
  }, [activePortionId, item?.portions])

  return {
    product,
    item,
    currentTab,
    setCurrentTab: safeSetCurrentTab,
    activeCategory,
    activePortion,
    activePortionId,
    selectPortion,
    availableTabs,
    unsatisfiedMandatory,
    firstUnsatisfied,
    isCategoryLocked,
    isTabLocked,
    isModifiersTabLocked: isModifiersTabLocked ?? false,
    advanceTab,
    selectCategory,
    goToRequired,
  }
}
