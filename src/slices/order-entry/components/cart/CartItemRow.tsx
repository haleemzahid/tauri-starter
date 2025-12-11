// CartItemRow - Single cart item display with modifiers

import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, calculateItemLinePrice } from '../../shared/utils'
import type { CartItem } from '../../shared/types'

interface CartItemRowProps {
  item: CartItem
  onEdit: (item: CartItem) => void
  onRemove: (itemId: string) => void
}

export function CartItemRow({ item, onEdit, onRemove }: CartItemRowProps) {
  const hasModifiers =
    item.modifiers.length > 0 ||
    item.portions.some((p) => p.modifiers.length > 0)
  const lineTotal = calculateItemLinePrice(item)

  return (
    <div className="border-base-300 flex flex-col border-b py-2">
      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Quantity */}
        <span className="text-base-content/70 w-8 text-center text-sm">
          {item.quantity}x
        </span>

        {/* Name + Size/Portion */}
        <div className="flex-1">
          <span className="font-medium">
            {item.product.displayName ?? item.product.name}
          </span>
          {item.size && (
            <span className="text-base-content/70 ml-1 text-sm">
              ({item.size.size?.displayName ?? item.size.size?.name})
            </span>
          )}
          {item.portions.length > 0 && (
            <span className="text-base-content/70 ml-1 text-sm">
              [{item.portions.map((p) => p.portionType.name).join(' / ')}]
            </span>
          )}
        </div>

        {/* Line total */}
        <span className="font-medium">{formatCurrency(lineTotal)}</span>

        {/* Actions */}
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => onEdit(item)}
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="btn btn-ghost btn-xs text-error"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Modifiers */}
      {hasModifiers && (
        <div className="text-base-content/60 mt-1 ml-10 text-sm">
          {item.modifiers.map((mod) => (
            <div key={mod.id}>
              {mod.affix && <span className="italic">{mod.affix.name} </span>}•{' '}
              {mod.topping.displayName ?? mod.topping.name}
              {mod.quantity > 1 && ` x${mod.quantity}`}
              {mod.topping.price > 0 &&
                ` (+${formatCurrency(mod.topping.price * mod.quantity)})`}
            </div>
          ))}
          {item.portions.map((portion) =>
            portion.modifiers.map((mod) => (
              <div key={mod.id}>
                {mod.affix && <span className="italic">{mod.affix.name} </span>}
                • {mod.topping.displayName ?? mod.topping.name} (
                {portion.portionType.name})
                {mod.quantity > 1 && ` x${mod.quantity}`}
              </div>
            ))
          )}
        </div>
      )}

      {/* Item discount if any */}
      {item.itemDiscount && (
        <div className="text-success ml-10 text-sm">
          Discount: {item.itemDiscount.name}
        </div>
      )}
    </div>
  )
}
