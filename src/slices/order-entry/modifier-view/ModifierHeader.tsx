// ModifierHeader - Quantity controls and action buttons

import { Minus, Plus, RefreshCw, Trash2, X, Check } from 'lucide-react'
import {
  useModifierSelections,
  useSetQuantity,
} from '../shared/store/modifier-atoms'
import { useModifierValidation } from './useModifierValidation'

interface ModifierHeaderProps {
  onConfirm: () => void
  onCancel: () => void
  onReset: () => void
  onDelete: () => void
}

export function ModifierHeader({
  onConfirm,
  onCancel,
  onReset,
  onDelete,
}: ModifierHeaderProps) {
  const { quantity } = useModifierSelections()
  const setQuantity = useSetQuantity()
  const { isValid, isSizeRequired, unsatisfiedGroups } = useModifierValidation()

  // Build validation message
  const getValidationMessage = () => {
    const missing: string[] = []
    if (isSizeRequired) missing.push('Size')
    missing.push(...unsatisfiedGroups)
    return `Select required: ${missing.join(', ')}`
  }

  return (
    <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => setQuantity(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] rounded bg-base-200 px-3 py-1 text-center font-mono">
          {quantity}
        </span>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => setQuantity(quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onReset}
          title="Reset"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <button
          className="btn btn-ghost btn-sm text-error"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onCancel}
          disabled={!isValid}
          title={isValid ? 'Done' : getValidationMessage()}
        >
          <X className="h-5 w-5" />
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onConfirm}
          disabled={!isValid}
          title={isValid ? 'Confirm' : getValidationMessage()}
        >
          <Check className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
