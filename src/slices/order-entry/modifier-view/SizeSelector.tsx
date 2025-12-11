// SizeSelector - Grid of size buttons

import { cn } from '@/slices/shared/utils/cn'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import {
  useModifierSelections,
  useSetSelectedSize,
} from '../shared/store/modifier-atoms'
import { useModifierNavigation } from './useModifierNavigation'
import type { AssignedSize } from '../shared/types'

export function SizeSelector() {
  const product = useSelectedProduct()
  const { sizeId } = useModifierSelections()
  const setSize = useSetSelectedSize()
  const { advanceAfterSize } = useModifierNavigation()

  const sizes = product?.assignedSizes?.filter((s) => s.isAssigned) ?? []

  if (sizes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No sizes available
      </div>
    )
  }

  const handleSelect = (size: AssignedSize) => {
    setSize(size)
    advanceAfterSize()
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => {
          const isSelected = sizeId === size.id

          return (
            <button
              key={size.id}
              onClick={() => handleSelect(size)}
              className={cn(
                'btn h-16 text-lg',
                isSelected
                  ? 'btn-info text-info-content'
                  : 'btn-neutral text-neutral-content'
              )}
            >
              {size.size?.name ?? 'Size'}
              {Number(size.price) > 0 && (
                <span className="ml-2 text-sm opacity-70">
                  ${Number(size.price).toFixed(2)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
