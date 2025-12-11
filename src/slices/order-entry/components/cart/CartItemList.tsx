// CartItemList - Scrollable list of cart items

import { CartItemRow } from './CartItemRow'
import { useSelectedCartItem, useCartActions } from '../../shared/store'
import type { CartItem } from '../../shared/types'

interface CartItemListProps {
  items: CartItem[]
  onDoubleClickItem: (item: CartItem) => void
  onRemoveItem: (itemId: string) => void
  onRemoveModifier?: (itemId: string, modifierId: string) => void
}

export function CartItemList({
  items,
  onDoubleClickItem,
  onRemoveItem,
  onRemoveModifier,
}: CartItemListProps) {
  const selectedItem = useSelectedCartItem()
  const { selectItem } = useCartActions()

  const handleSelect = (item: CartItem) => {
    // Toggle selection if clicking the same item
    selectItem(selectedItem?.id === item.id ? null : item.id)
  }

  if (items.length === 0) {
    return (
      <div className="text-base-content/50 flex flex-1 items-center justify-center">
        <p>No items in cart</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {items.map((item) => (
        <CartItemRow
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          onSelect={handleSelect}
          onDoubleClick={onDoubleClickItem}
          onRemove={onRemoveItem}
          onRemoveModifier={onRemoveModifier}
        />
      ))}
    </div>
  )
}
