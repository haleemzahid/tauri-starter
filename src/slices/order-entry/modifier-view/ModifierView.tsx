// ModifierView - Main container for product configuration (XState powered)

import { useState, useEffect } from 'react'
import { useEditingItem, useEditingProduct } from '../shared/machines'
import { ModifierHeader } from './ModifierHeader'
import { ModifierTabs } from './ModifierTabs'
import { SizeSelector } from './SizeSelector'
import { TypeSelector } from './TypeSelector'
import { PortionSelector } from './PortionSelector'
import { ModifierGroupSelector } from './ModifierGroupSelector'
import { ToppingGrid } from './ToppingGrid'
import type { ToppingCategory } from '../shared/types'

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

  // Determine available tabs based on product
  const availableTabs: ModifierTab[] = []
  if (product?.assignedSizes && product.assignedSizes.length > 0) {
    availableTabs.push('sizes')
  }
  if (product?.productTypes && product.productTypes.length > 0) {
    availableTabs.push('types')
  }
  if (product?.portionTypes && product.portionTypes.length > 0) {
    availableTabs.push('portions')
  }
  if (product?.toppingCategories && product.toppingCategories.length > 1) {
    availableTabs.push('modifier-groups')
  }
  if (product?.toppingCategories && product.toppingCategories.length > 0) {
    availableTabs.push('modifiers')
  }

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
          />
        )}
        {currentTab === 'modifiers' && (
          <ToppingGrid activeCategory={activeCategory} />
        )}
      </div>
    </div>
  )
}
