// ModifierTabs - Tab bar for Size/Type/Portion/ModifierGroups/Modifiers

import { cn } from '@/slices/shared/utils/cn'
import type { ModifierTab } from './ModifierView'

const TAB_LABELS: Record<ModifierTab, string> = {
  sizes: 'Sizes',
  types: 'Types',
  portions: 'Portions',
  'modifier-groups': 'Modifier Groups',
  modifiers: 'Modifiers',
}

interface ModifierTabsProps {
  availableTabs: ModifierTab[]
  currentTab: ModifierTab
  onTabChange: (tab: ModifierTab) => void
}

export function ModifierTabs({
  availableTabs,
  currentTab,
  onTabChange,
}: ModifierTabsProps) {
  if (availableTabs.length === 0) return null

  return (
    <div className="border-base-300 bg-base-100 flex gap-2 border-b px-4 py-2">
      {availableTabs.map((tab) => {
        const isActive = tab === currentTab

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn('btn btn-sm', isActive ? 'btn-primary' : 'btn-ghost')}
          >
            {TAB_LABELS[tab]}
          </button>
        )
      })}
    </div>
  )
}
