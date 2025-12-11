// ToppingGrid - Grid of individual topping buttons

import { Check } from 'lucide-react'
import { cn } from '@/slices/shared/utils/cn'
import {
  useActiveToppingCategory,
  useModifierSelections,
  useToggleModifier,
} from '../shared/store/modifier-atoms'

export function ToppingGrid() {
  const activeCategory = useActiveToppingCategory()
  const { modifiersByCategory } = useModifierSelections()
  const toggleModifier = useToggleModifier()

  if (!activeCategory) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        Select a modifier group first
      </div>
    )
  }

  const toppings = activeCategory.toppings ?? []
  const selectedIds =
    modifiersByCategory.get(activeCategory.id)?.map((m) => m.toppingId) ?? []

  if (toppings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No modifiers in this group
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Group name header */}
      <div className="mb-4">
        <span className="rounded bg-base-200 px-3 py-1 text-sm font-medium">
          Selected Group:{' '}
          <span className="font-bold">{activeCategory.name}</span>
        </span>
        {!activeCategory.canAddMultiple && (
          <span className="ml-2 text-xs text-base-content/50">
            (Single select)
          </span>
        )}
      </div>

      {/* Toppings grid */}
      <div className="grid grid-cols-4 gap-3">
        {toppings.map((topping) => {
          const isSelected = selectedIds.includes(topping.id)

          return (
            <button
              key={topping.id}
              onClick={() =>
                toggleModifier({ category: activeCategory, topping })
              }
              className={cn(
                'btn relative h-16',
                isSelected
                  ? 'btn-info text-info-content'
                  : 'btn-neutral text-neutral-content'
              )}
            >
              <span className="flex flex-col items-center">
                <span>{topping.name}</span>
                {Number(topping.price) > 0 && (
                  <span className="text-xs opacity-70">
                    +${Number(topping.price).toFixed(2)}
                  </span>
                )}
              </span>

              {/* Selection indicator */}
              {activeCategory.canAddMultiple ? (
                // Checkbox style for multi-select
                isSelected && (
                  <Check className="absolute right-2 top-2 h-4 w-4" />
                )
              ) : (
                // Radio style for single-select
                <div
                  className={cn(
                    'absolute right-2 top-2 h-3 w-3 rounded-full border-2',
                    isSelected
                      ? 'border-info-content bg-info-content'
                      : 'border-current opacity-30'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
