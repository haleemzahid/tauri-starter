// CartPanel - Full cart sidebar with items, totals, and action buttons

import { useAtomValue } from 'jotai'
import { ArrowLeft, LayoutGrid, Percent } from 'lucide-react'
import {
  cartItemsAtom,
  cartTotalsAtom,
  useCartActions,
} from '../../shared/store'
import { CartItemList } from './CartItemList'
import { TotalsSection } from './TotalsSection'
import { formatCurrency } from '../../shared/utils'
import type { CartItem, ServiceMethod } from '../../shared/types'

interface CartPanelProps {
  serviceMethod: ServiceMethod | null
  onServiceMethodChange: () => void
  onEditItem: (item: CartItem) => void
  onPay: () => void
  onHold: () => void
  onCancel: () => void
}

export function CartPanel({
  serviceMethod,
  onServiceMethodChange,
  onEditItem,
  onPay,
  onHold,
  onCancel,
}: CartPanelProps) {
  const items = useAtomValue(cartItemsAtom)
  const totals = useAtomValue(cartTotalsAtom)
  const { removeItem } = useCartActions()

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  const hasItems = items.length > 0

  return (
    <div className="bg-base-100 border-base-300 flex h-full w-80 flex-col border-r">
      {/* Header Row 1: Back, Customer Type, Tab Name */}
      <div className="border-base-300 flex items-center gap-2 border-b p-2">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-medium">Walk-In</span>
        <button className="btn btn-outline btn-sm flex-1">
          <LayoutGrid className="h-4 w-4" />
          Tab Name
        </button>
      </div>

      {/* Header Row 2: Service Method, Employee */}
      <div className="border-base-300 flex items-center gap-2 border-b p-2">
        <div className="flex-1">
          <label className="text-xs text-base-content/60">Service Methods</label>
          <select
            className="select select-bordered select-sm w-full"
            value={serviceMethod?.id ?? ''}
            onChange={onServiceMethodChange}
          >
            <option value="">Select...</option>
          </select>
        </div>
        <div className="btn btn-neutral btn-sm">Brian</div>
      </div>

      {/* Header Row 3: Action Buttons */}
      <div className="border-base-300 flex gap-2 border-b p-2">
        <button
          className="btn btn-neutral btn-sm flex-1"
          onClick={onServiceMethodChange}
        >
          Svc change
        </button>
        <button className="btn btn-neutral btn-sm flex-1">Split</button>
        <button className="btn btn-neutral btn-sm flex-1">
          <Percent className="h-3 w-3" />
          Discount
        </button>
      </div>

      {/* Cart Items */}
      <CartItemList
        items={items}
        onEditItem={onEditItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* Stay/Send Buttons */}
      <div className="border-base-300 grid grid-cols-2 gap-2 border-t p-2">
        <button className="btn btn-neutral btn-sm" disabled={!hasItems}>
          Stay
        </button>
        <button className="btn btn-neutral btn-sm" disabled={!hasItems}>
          Send
        </button>
      </div>

      {/* Totals */}
      <TotalsSection totals={totals} />

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 gap-2 p-2">
        <button className="btn btn-outline btn-sm" onClick={onHold}>
          No Sale
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onPay}
          disabled={!hasItems}
        >
          {formatCurrency(totals.grandTotal)}
        </button>
      </div>
    </div>
  )
}
