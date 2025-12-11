// CartPanel - Resizable cart sidebar (composition of header, items, footer)

import { useAtomValue } from 'jotai'
import {
  cartItemsAtom,
  cartTotalsAtom,
  useCartActions,
} from '../../shared/store'
import { useResizablePanel } from '../../shared/hooks/useResizablePanel'
import { CartHeader } from './CartHeader'
import { CartItemList } from './CartItemList'
import { CartFooter } from './CartFooter'
import { ResizeHandle } from '../shared/ResizeHandle'
import type { CartItem, ServiceMethod } from '../../shared/types'

interface CartPanelProps {
  serviceMethod: ServiceMethod | null
  onServiceMethodChange: (method: ServiceMethod | null) => void
  onEditItem: (item: CartItem) => void
  onPay: () => void
  onHold: () => void
  onCancel: () => void
  onDiscount: () => void
}

export function CartPanel({
  serviceMethod,
  onServiceMethodChange,
  onEditItem,
  onPay,
  onHold,
  onCancel,
  onDiscount,
}: CartPanelProps) {
  const items = useAtomValue(cartItemsAtom)
  const totals = useAtomValue(cartTotalsAtom)
  const { removeItem } = useCartActions()

  const { width, panelRef, startResize } = useResizablePanel({
    storageKey: 'cart-panel-width',
    defaultWidth: 320,
    minWidth: 280,
    maxWidth: 500,
  })

  return (
    <div
      ref={panelRef}
      className="bg-base-100 border-base-300 relative flex h-full flex-col border-r"
      style={{ width }}
    >
      <CartHeader
        serviceMethod={serviceMethod}
        onServiceMethodChange={onServiceMethodChange}
        onCancel={onCancel}
        onDiscount={onDiscount}
      />

      <CartItemList
        items={items}
        onEditItem={onEditItem}
        onRemoveItem={removeItem}
      />

      <CartFooter
        totals={totals}
        hasItems={items.length > 0}
        onPay={onPay}
        onHold={onHold}
      />

      <ResizeHandle onMouseDown={startResize} />
    </div>
  )
}
