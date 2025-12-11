// TypeSelector - Grid of type buttons

import { cn } from '@/slices/shared/utils/cn'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import {
  useModifierSelections,
  useSetSelectedType,
} from '../shared/store/modifier-atoms'
import { useModifierNavigation } from './useModifierNavigation'
import type { ProductType } from '../shared/types'

export function TypeSelector() {
  const product = useSelectedProduct()
  const { typeId } = useModifierSelections()
  const setType = useSetSelectedType()
  const { advanceAfterType } = useModifierNavigation()

  const types = product?.productTypes ?? []

  if (types.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-base-content/50">
        No types available
      </div>
    )
  }

  const handleSelect = (type: ProductType) => {
    setType(type)
    advanceAfterType()
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {types.map((type) => {
          const isSelected = typeId === type.id

          return (
            <button
              key={type.id}
              onClick={() => handleSelect(type)}
              className={cn(
                'btn h-16 text-lg',
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'btn-neutral text-neutral-content'
              )}
            >
              {type.name}
              {type.price > 0 && (
                <span className="ml-2 text-sm opacity-70">
                  +${type.price.toFixed(2)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
