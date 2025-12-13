// ModifierView - Main container for product configuration (XState powered)

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useEditingItem, useEditingProduct } from '../shared/machines'
import { ModifierHeader } from './ModifierHeader'
import { ModifierTabs } from './ModifierTabs'
import { SizeSelector } from './SizeSelector'
import { TypeSelector } from './TypeSelector'
import { PortionSelector } from './PortionSelector'
import { ModifierGroupSelector } from './ModifierGroupSelector'
import { ToppingGrid } from './ToppingGrid'
import type { ToppingCategory
} from '../shared/types'

export type ModifierTab =
  | 'sizes'
  | 'types'
  | 'portions'
  | 'modifier-groups'
  | 'modifiers'

interface ModifierViewProps {
  onConfirm: () => void
  onCancel: () => void
  onDelete: () => void
}

export function ModifierView({
  onConfirm,
  onCancel,
  onDelete,
}: ModifierViewProps) {
  const product = useEditingProduct()
  const item = useEditingItem()
  const [currentTab, setCurrentTab] = useState<ModifierTab>('sizes')
  const [activeCategory, setActiveCategory] = useState<ToppingCategory | null>(
    null
  )

  // Determine available tabs based on product (memoized)
  const availableTabs = useMemo(() => {
    const tabs: ModifierTab[] = []
    if (product?.assignedSizes?.length) tabs.push('sizes')
    if (product?.productTypes?.length) tabs.push('types')
    if (product?.portionTypes?.length) tabs.push('portions')
    if ((product?.toppingCategories?.length ?? 0) > 1) tabs.push('modifier-groups')
    if (product?.toppingCategories?.length) tabs.push('modifiers')
    return tabs
  }, [product])

  // Get mandatory categories and check satisfaction status
  const mandatoryCategories = useMemo(() => {
    return product?.toppingCategories?.filter((c) => c.isMandatory) ?? []
  }, [product?.toppingCategories])

  // Check which mandatory categories are unsatisfied
  const unsatisfiedMandatory = useMemo(() => {
    if (!item) return mandatoryCategories
    return mandatoryCategories.filter((category) => {
      const toppingIds = new Set(category.toppings?.map((t) => t.id) ?? [])
      const hasSelection = item.modifiers.some((m) => toppingIds.has(m.topping.id))
      return !hasSelection
    })
  }, [item?.modifiers, mandatoryCategories])

  // First unsatisfied mandatory category (for auto-navigation)
  const firstUnsatisfied = unsatisfiedMandatory[0] ?? null

  // Check if a category is optional (for disabling)
  const isCategoryLocked = useCallback(
    (category: ToppingCategory): boolean => {
      if (unsatisfiedMandatory.length === 0) return false
      return !category.isMandatory
    },
    [unsatisfiedMandatory]
  )

  // Check if modifiers tab should be locked
  const isModifiersTabLocked = unsatisfiedMandatory.length > 0 && activeCategory && !activeCategory.isMandatory

  // Set initial tab when product changes
  useEffect(() => {
    if (product && availableTabs.length > 0) {
      setCurrentTab(availableTabs[0])
      // Set first category as active for modifiers
      if (product.toppingCategories && product.toppingCategories.length > 0) {
        setActiveCategory(product.toppingCategories[0])
      }
    }
  }, [product?.id])

  const getNextTab = (fromTab: ModifierTab): ModifierTab | null => {
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
  }

  const advanceTab = (fromTab: ModifierTab) => {
    const next = getNextTab(fromTab)
    if (next) setCurrentTab(next)
  }

  if (!product || !item) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No product selected
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with qty and actions */}
      <ModifierHeader
        onConfirm={onConfirm}
        onCancel={onCancel}
        onDelete={onDelete}
      />

      {/* Tab bar */}
      <ModifierTabs
        availableTabs={availableTabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unsatisfiedCount={unsatisfiedMandatory.length}
      />

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {currentTab === 'sizes' && (
          <SizeSelector onAdvance={() => advanceTab('sizes')} />
        )}
        {currentTab === 'types' && (
          <TypeSelector onAdvance={() => advanceTab('types')} />
        )}
        {currentTab === 'portions' && (
          <PortionSelector onAdvance={() => advanceTab('portions')} />
        )}
        {currentTab === 'modifier-groups' && (
          <ModifierGroupSelector
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat)
              setCurrentTab('modifiers')
            }}
            isCategoryLocked={isCategoryLocked}
            firstUnsatisfied={firstUnsatisfied}
          />
        )}
        {currentTab === 'modifiers' && (
          <ToppingGrid
            activeCategory={activeCategory}
            isLocked={isModifiersTabLocked}
            lockReason={firstUnsatisfied?.name}
            onGoToRequired={() => {
              if (firstUnsatisfied) {
                setActiveCategory(firstUnsatisfied)
                // Stay on modifiers tab but switch to required category
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
