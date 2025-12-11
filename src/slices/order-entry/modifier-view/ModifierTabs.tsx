// ModifierTabs - Tab bar for Size/Type/Portion/ModifierGroups/Modifiers

import { cn } from '@/slices/shared/utils/cn'
import { useModifierNavigation } from './useModifierNavigation'
import { useModifierValidation } from './useModifierValidation'
import type { ModifierTab } from '../shared/store/ui-atoms'

const TAB_LABELS: Record<ModifierTab, string> = {
  sizes: 'Sizes',
  types: 'Types',
  portions: 'Portions',
  'modifier-groups': 'Modifier Groups',
  modifiers: 'Modifiers',
}

export function ModifierTabs() {
  const { currentTab, availableTabs, goToTab, canAccessModifiers } =
    useModifierNavigation()
  const { unsatisfiedGroupIds } = useModifierValidation()

  if (availableTabs.length === 0) return null

  return (
    <div className="flex gap-2 border-b border-base-300 bg-base-100 px-4 py-2">
      {availableTabs.map((tab) => {
        const isActive = tab === currentTab
        const isModifierTab = tab === 'modifier-groups' || tab === 'modifiers'
        const isDisabled = isModifierTab && !canAccessModifiers()

        // Show warning on modifier-groups if any mandatory group unsatisfied
        const hasWarning =
          tab === 'modifier-groups' && unsatisfiedGroupIds.length > 0

        return (
          <button
            key={tab}
            onClick={() => !isDisabled && goToTab(tab)}
            disabled={isDisabled}
            className={cn(
              'btn btn-sm',
              isActive ? 'btn-primary' : 'btn-ghost',
              isDisabled && 'btn-disabled opacity-50',
              hasWarning && !isActive && 'ring-2 ring-error'
            )}
          >
            {TAB_LABELS[tab]}
            {hasWarning && !isActive && (
              <span className="badge badge-error badge-xs ml-1">!</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
