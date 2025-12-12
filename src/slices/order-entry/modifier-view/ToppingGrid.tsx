// ToppingGrid - Grid of individual topping buttons

import { Check } from 'lucide-react'
import { cn } from '@/slices/shared/utils/cn'
import { useEditingItem, useModifierActions } from '../shared/machines'
import type {
  ToppingCategory,
  Topping,
  CartItemModifier,
} from '../shared/types'

interface ToppingGridProps {
  activeCategory: ToppingCategory | null
}

export function ToppingGrid({ activeCategory }: ToppingGridProps) {
  const item = useEditingItem()
  const { setModifiers } = useModifierActions()

  if (!activeCategory) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        Select a modifier group first
      </div>
    )
  }

  const toppings = activeCategory.toppings ?? []

  // Get selected topping IDs from cart item
  const selectedIds =
    item?.modifiers
      .filter((m) => toppings.some((t) => t.id === m.topping.id))
      .map((m) => m.topping.id) ?? []

  if (toppings.length === 0) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No modifiers in this group
      </div>
    )
  }

  const handleToggle = (topping: Topping) => {
    if (!item) return

    const isSelected = selectedIds.includes(topping.id)
    let newModifiers: CartItemModifier[]

    if (isSelected) {
      // Deselect - remove this topping
      newModifiers = item.modifiers.filter((m) => m.topping.id !== topping.id)
    } else if (activeCategory.canAddMultiple) {
      // Multi-select: add to existing
      const newMod: CartItemModifier = {
        id: crypto.randomUUID(),
        topping,
        quantity: 1,
      }
      newModifiers = [...item.modifiers, newMod]
    } else {
      // Single-select: remove other toppings from this category, add new one
      const categoryToppingIds = new Set(toppings.map((t) => t.id))
      const otherMods = item.modifiers.filter(
        (m) => !categoryToppingIds.has(m.topping.id)
      )
      const newMod: CartItemModifier = {
        id: crypto.randomUUID(),
        topping,
        quantity: 1,
      }
      newModifiers = [...otherMods, newMod]
    }

    setModifiers(newModifiers)
  }

  return (
    <div className="p-4">
      {/* Group name header */}
      <div className="mb-4">
        <span className="bg-base-200 rounded px-3 py-1 text-sm font-medium">
          Selected Group:{' '}
          <span className="font-bold">{activeCategory.name}</span>
        </span>
        {!activeCategory.canAddMultiple && (
          <span className="text-base-content/50 ml-2 text-xs">
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
              onClick={() => handleToggle(topping)}
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
