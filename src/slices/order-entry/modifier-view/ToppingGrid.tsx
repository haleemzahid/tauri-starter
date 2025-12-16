// ToppingGrid - Grid of individual topping buttons

import { useMemo, useCallback } from 'react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/slices/shared/utils/cn'
import { useEditingItem, useModifierActions } from '../shared/machines'
import type {
  ToppingCategory,
  Topping,
  CartItemModifier,
  CartItemPortion,
  Affix,
} from '../shared/types'

interface ToppingGridProps {
  activeCategory: ToppingCategory | null
  activePortion?: CartItemPortion | null
  activePortionId?: string | null
  isLocked?: boolean
  lockReason?: string
  onGoToRequired?: () => void
  selectedAffix?: Affix | null
  onAffixUsed?: () => void
}

export function ToppingGrid({
  activeCategory,
  activePortion,
  activePortionId,
  isLocked = false,
  lockReason,
  onGoToRequired,
  selectedAffix,
  onAffixUsed,
}: ToppingGridProps) {
  const item = useEditingItem()
  const { setModifiers, setPortionModifiers } = useModifierActions()

  if (!activeCategory) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        Select a modifier group first
      </div>
    )
  }

  // Show locked overlay when mandatory modifiers not satisfied
  if (isLocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Lock className="h-12 w-12 text-warning" />
        <div className="text-center">
          <p className="text-lg font-semibold">Optional Modifiers Locked</p>
          <p className="text-base-content/70 mt-2">
            Please select a required modifier from{' '}
            <span className="font-bold text-warning">{lockReason}</span> first.
          </p>
        </div>
        <button
          className="btn btn-warning btn-outline mt-4"
          onClick={onGoToRequired}
        >
          Go to Required Modifiers
        </button>
      </div>
    )
  }

  const toppings = activeCategory.toppings ?? []

  // Determine which modifiers to check based on whether we're editing a portion
  const currentModifiers = activePortion?.modifiers ?? item?.modifiers ?? []

  // Get selected topping IDs from current modifiers (memoized with Set for O(1) lookup)
  const selectedIds = useMemo(() => {
    const toppingIds = new Set(toppings.map((t) => t.id))
    return new Set(
      currentModifiers
        .filter((m) => toppingIds.has(m.topping.id))
        .map((m) => m.topping.id)
    )
  }, [currentModifiers, toppings])

  if (toppings.length === 0) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No modifiers in this group
      </div>
    )
  }

  const handleToggle = useCallback(
    (topping: Topping) => {
      if (!item) return

      const isSelected = selectedIds.has(topping.id)
      let newModifiers: CartItemModifier[]

      if (isSelected && !selectedAffix) {
        // Deselect - remove this topping (only if no affix selected)
        newModifiers = currentModifiers.filter((m) => m.topping.id !== topping.id)
      } else if (activeCategory.canAddMultiple) {
        // Multi-select: add to existing (with affix if selected)
        const newMod: CartItemModifier = {
          id: crypto.randomUUID(),
          topping,
          affix: selectedAffix ?? undefined,
          quantity: 1,
        }
        newModifiers = [...currentModifiers, newMod]
        onAffixUsed?.()
      } else {
        // Single-select: remove other toppings from this category, add new one
        const categoryToppingIds = new Set(toppings.map((t) => t.id))
        const otherMods = currentModifiers.filter(
          (m) => !categoryToppingIds.has(m.topping.id)
        )
        const newMod: CartItemModifier = {
          id: crypto.randomUUID(),
          topping,
          affix: selectedAffix ?? undefined,
          quantity: 1,
        }
        newModifiers = [...otherMods, newMod]
        onAffixUsed?.()
      }

      // Update portion modifiers or item modifiers based on context
      if (activePortionId) {
        setPortionModifiers(activePortionId, newModifiers)
      } else {
        setModifiers(newModifiers)
      }
    },
    [
      item,
      currentModifiers,
      selectedIds,
      activeCategory,
      activePortionId,
      toppings,
      selectedAffix,
      onAffixUsed,
      setModifiers,
      setPortionModifiers,
    ]
  )

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
          const isSelected = selectedIds.has(topping.id)

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
