// CartItemRow - Single cart item display with modifiers

import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import { formatCurrency, calculateItemLinePrice } from '../shared/utils'
import type { CartItem } from '../shared/types'

interface CartItemRowProps {
  item: CartItem
  isSelected?: boolean
  onSelect: (item: CartItem) => void
  onDoubleClick: (item: CartItem) => void
  onRemove: (itemId: string) => void
  onRemoveModifier?: (itemId: string, modifierId: string) => void
  onRemovePortion?: (itemId: string, portionId: string) => void
  onRemovePortionModifier?: (
    itemId: string,
    portionId: string,
    modifierId: string
  ) => void
}

// Style classes extracted for readability
const baseStyles =
  'flex cursor-pointer flex-col border-b border-base-300 py-2 px-1 transition-colors'
const hoverStyles = 'hover:bg-base-200'
const selectedStyles = 'bg-base-200'
const unselectedStyles = ''

export const CartItemRow = memo(function CartItemRow({
  item,
  isSelected = false,
  onSelect,
  onDoubleClick,
  onRemove,
  onRemoveModifier,
  onRemovePortion,
  onRemovePortionModifier,
}: CartItemRowProps) {
  const hasModifiers = item.modifiers.length > 0 || item.portions.length > 0
  const hasSpecialRequests = (item.specialRequests?.length ?? 0) > 0
  const lineTotal = calculateItemLinePrice(item)

  // Format discount percentage if applied
  const discountSuffix = item.itemDiscount
    ? ` (${parseFloat(String(item.itemDiscount.discountPercentage)).toFixed(1)}%)`
    : ''

  const rowClassName = [
    baseStyles,
    hoverStyles,
    isSelected ? selectedStyles : unselectedStyles,
  ].join(' ')

  return (
    <div
      className={rowClassName}
      onClick={() => onSelect(item)}
      onDoubleClick={() => onDoubleClick(item)}
    >
      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Quantity */}
        <span className="text-base-content/70 w-8 text-center text-sm">
          {item.quantity}x
        </span>

        {/* Name + Size/Portion */}
        <div className="flex-1">
          <span className="font-medium">
            {item.size && (
              <span>
                {item.size.size?.name ?? item.size.size?.displayName}{' '}
              </span>
            )}
            {item.product.displayName ?? item.product.name}
            {discountSuffix}
          </span>
          {item.type && (
            <div className="text-base-content/70 text-sm">{item.type.name}</div>
          )}
        </div>

        {/* Line total */}
        <span className="font-medium">{formatCurrency(lineTotal)}</span>

        {/* Remove item */}
        <button
          className="btn btn-ghost btn-xs text-error"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Modifiers */}
      {hasModifiers && (
        <div className="text-base-content/60 mt-1 ml-10 text-sm">
          {/* Item-level modifiers */}
          {item.modifiers.map((mod) => (
            <div key={mod.id} className="flex items-center gap-1">
              <span className="flex-1">
                {mod.affix && <span className="italic">{mod.affix.name} </span>}
                {!mod.affix && '• '}
                {mod.topping.displayName ?? mod.topping.name}
                {mod.quantity > 1 && ` x${mod.quantity}`}
                {Number(mod.topping.price) > 0 &&
                  ` (+${formatCurrency(Number(mod.topping.price) * mod.quantity)})`}
              </span>
              {onRemoveModifier && (
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveModifier(item.id, mod.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {/* Portion-level modifiers grouped by portion */}
          {item.portions.map((portion) => (
            <div key={portion.id}>
              <div className="mt-1 flex items-center gap-1 font-medium text-base-content/80">
                <span className="flex-1">{portion.portionType.name}</span>
                {onRemovePortion && (
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemovePortion(item.id, portion.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {portion.modifiers.map((mod) => (
                <div key={mod.id} className="ml-2 flex items-center gap-1">
                  <span className="flex-1">
                    {mod.affix && (
                      <span className="italic">{mod.affix.name} </span>
                    )}
                    {!mod.affix && '• '}
                    {mod.topping.displayName ?? mod.topping.name}
                    {mod.quantity > 1 && ` x${mod.quantity}`}
                  </span>
                  {onRemovePortionModifier && (
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemovePortionModifier(item.id, portion.id, mod.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Special Requests */}
      {hasSpecialRequests && (
        <div className="text-base-content/60 mt-1 ml-10 text-sm">
          {item.specialRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-2">
              <span className="flex-1 italic">• {req.description}</span>
              {req.price > 0 && (
                <span className="text-base-content/80">
                  {formatCurrency(req.price)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
