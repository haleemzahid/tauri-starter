// PortionSelector - Grid of portion buttons (multi-select for half/half)

import {
  useEditingItem,
  useEditingProduct,
  useModifierActions,
} from '../shared/machines'
import type { PortionType } from '../shared/types'

interface PortionSelectorProps {
  onAdvance: () => void
}

export function PortionSelector({ onAdvance }: PortionSelectorProps) {
  const product = useEditingProduct()
  const item = useEditingItem()
  const { setPortions } = useModifierActions()

  const portions = product?.portionTypes ?? []

  if (portions.length === 0) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No portions available
      </div>
    )
  }

  const handleSelect = (portion: PortionType) => {
    // Always add a new portion - allow multiple of same type
    const currentPortions = (item?.portions ?? []).map((p) => p.portionType)
    const newPortions = [...currentPortions, portion]
    setPortions(newPortions)
    onAdvance()
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {portions.map((portion) => (
          <button
            key={portion.id}
            onClick={() => handleSelect(portion)}
            className="btn btn-neutral text-neutral-content h-16 text-lg"
          >
            {portion.name}
            {portion.price > 0 && (
              <span className="ml-2 text-sm opacity-70">
                +${portion.price.toFixed(2)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
