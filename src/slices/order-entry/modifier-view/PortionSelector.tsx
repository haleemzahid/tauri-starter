// PortionSelector - Grid of portion buttons (multi-select for half/half)

import { cn } from '@/slices/shared/utils/cn'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import {
  useModifierSelections,
  useTogglePortion,
} from '../shared/store/modifier-atoms'
import { useModifierNavigation } from './useModifierNavigation'
import type { PortionType } from '../shared/types'

export function PortionSelector() {
  const product = useSelectedProduct()
  const { portionIds } = useModifierSelections()
  const togglePortion = useTogglePortion()
  const { advanceAfterPortion } = useModifierNavigation()

  const portions = product?.portionTypes ?? []

  if (portions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No portions available
      </div>
    )
  }

  const handleSelect = (portion: PortionType) => {
    togglePortion(portion)
    // Only auto-advance if this is the first portion selected
    if (!portionIds.includes(portion.id)) {
      advanceAfterPortion()
    }
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {portions.map((portion) => {
          const isSelected = portionIds.includes(portion.id)

          return (
            <button
              key={portion.id}
              onClick={() => handleSelect(portion)}
              className={cn(
                'btn h-16 text-lg',
                isSelected
                  ? 'btn-info text-info-content'
                  : 'btn-neutral text-neutral-content'
              )}
            >
              {portion.name}
              {portion.price > 0 && (
                <span className="ml-2 text-sm opacity-70">
                  +${portion.price.toFixed(2)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
