// useOrderEntry - State and handlers for order entry page

import { useState, useCallback } from 'react'
import {
  useCartActions,
  useSetInvoiceDiscount,
  useSelectedCartItem,
} from './shared/store'
import type { Product, CartItem, ServiceMethod, Discount } from './shared/types'

export type OrderView = 'menu' | 'modifiers' | 'payment' | 'discount'

export function useOrderEntry() {
  const [currentView, setCurrentView] = useState<OrderView>('menu')
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod | null>(null)

  const { addItem, clearCart, setItemDiscount } = useCartActions()
  const setInvoiceDiscount = useSetInvoiceDiscount()
  const selectedItem = useSelectedCartItem()

  // --- Product Actions ---
  const handleProductSelect = useCallback(
    (product: Product) => {
      // TODO: Check if product needs modifiers (sizes, toppings)
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product,
        quantity: 1,
        portions: [],
        modifiers: [],
        taxRate: product.isTaxed ? 0.0825 : 0, // TODO: fetch from DB
        specialInstructions: [],
        createdAt: new Date(),
      }
      addItem(newItem)
    },
    [addItem]
  )

  const handleEditItem = useCallback((_item: CartItem) => {
    setCurrentView('modifiers')
  }, [])

  // --- Order Actions ---
  const handlePay = useCallback(() => setCurrentView('payment'), [])
  const handleHold = useCallback(() => {
    // TODO: Save to hold invoices
  }, [])
  const handleCancel = useCallback(() => {
    if (confirm('Cancel this order?')) clearCart()
  }, [clearCart])

  // --- Discount Actions ---
  const handleSelectDiscount = useCallback(
    (discount: Discount) => {
      if (discount.type === 2) {
        setInvoiceDiscount(discount)
      } else if (selectedItem) {
        setItemDiscount(selectedItem.id, discount)
      }
    },
    [setInvoiceDiscount, setItemDiscount, selectedItem]
  )

  const handleClearInvoiceDiscount = useCallback(
    () => setInvoiceDiscount(null),
    [setInvoiceDiscount]
  )

  const handleClearItemDiscount = useCallback(() => {
    if (selectedItem) setItemDiscount(selectedItem.id, null)
  }, [setItemDiscount, selectedItem])

  const handleOpenDiscount = useCallback(() => setCurrentView('discount'), [])
  const handleDiscountDone = useCallback(() => setCurrentView('menu'), [])

  return {
    // State
    currentView,
    serviceMethod,
    selectedItem,

    // Setters
    setServiceMethod,

    // Product actions
    handleProductSelect,
    handleEditItem,

    // Order actions
    handlePay,
    handleHold,
    handleCancel,

    // Discount actions
    handleOpenDiscount,
    handleSelectDiscount,
    handleClearInvoiceDiscount,
    handleClearItemDiscount,
    handleDiscountDone,
  }
}
