// ModifierGroupSelector - Grid of modifier group buttons

import { cn } from '@/slices/shared/utils/cn'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import {
  useModifierSelections,
  useActiveToppingCategory,
} from '../shared/store/modifier-atoms'
import { useModifierNavigation } from './useModifierNavigation'
import { useModifierValidation } from './useModifierValidation'

export function ModifierGroupSelector() {
  const product = useSelectedProduct()
  const { modifiersByCategory } = useModifierSelections()
  const activeCategory = useActiveToppingCategory()
  const { selectModifierGroup } = useModifierNavigation()
  const { unsatisfiedGroupIds } = useModifierValidation()

  const categories = product?.toppingCategories ?? []

  if (categories.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No modifier groups available
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => {
          const isActive = activeCategory?.id === category.id
          const hasSelections =
            (modifiersByCategory.get(category.id)?.length ?? 0) > 0
          const isUnsatisfied = unsatisfiedGroupIds.includes(category.id)

          return (
            <button
              key={category.id}
              onClick={() => selectModifierGroup(category.id)}
              className={cn(
                'btn h-16 text-lg',
                isActive
                  ? 'btn-info text-info-content'
                  : hasSelections
                    ? 'btn-neutral text-neutral-content'
                    : 'bg-base-300 text-base-content/60',
                isUnsatisfied && !isActive && 'ring-2 ring-error'
              )}
            >
              <span className="flex flex-col items-center">
                <span>{category.name}</span>
                {category.isMandatory && !hasSelections && (
                  <span className="text-xs text-error">Required</span>
                )}
                {hasSelections && (
                  <span className="text-xs opacity-70">
                    ({modifiersByCategory.get(category.id)?.length} selected)
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
