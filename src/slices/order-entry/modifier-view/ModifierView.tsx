// ModifierView - Main container for product configuration

import { useEffect } from 'react'
import {
  useSelectedProduct,
  useSetSelectedModifierTab,
} from '../shared/store/ui-atoms'
import { useResetModifierSelections } from '../shared/store/modifier-atoms'
import { useModifierNavigation } from './useModifierNavigation'
import { ModifierHeader } from './ModifierHeader'
import { ModifierTabs } from './ModifierTabs'
import { SizeSelector } from './SizeSelector'
import { TypeSelector } from './TypeSelector'
import { PortionSelector } from './PortionSelector'
import { ModifierGroupSelector } from './ModifierGroupSelector'
import { ToppingGrid } from './ToppingGrid'

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
  const product = useSelectedProduct()
  const resetSelections = useResetModifierSelections()
  const setTab = useSetSelectedModifierTab()
  const { currentTab, getFirstTab } = useModifierNavigation()

  // Reset selections and set initial tab when product changes
  useEffect(() => {
    if (product) {
      resetSelections()
      const firstTab = getFirstTab()
      setTab(firstTab)
    }
  }, [product?.id])

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No product selected
      </div>
    )
  }

  const handleReset = () => {
    resetSelections()
    const firstTab = getFirstTab()
    setTab(firstTab)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with qty and actions */}
      <ModifierHeader
        onConfirm={onConfirm}
        onCancel={onCancel}
        onReset={handleReset}
        onDelete={onDelete}
      />

      {/* Tab bar */}
      <ModifierTabs />

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {currentTab === 'sizes' && <SizeSelector />}
        {currentTab === 'types' && <TypeSelector />}
        {currentTab === 'portions' && <PortionSelector />}
        {currentTab === 'modifier-groups' && <ModifierGroupSelector />}
        {currentTab === 'modifiers' && <ToppingGrid />}
      </div>
    </div>
  )
}
