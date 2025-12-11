// OrderEntryPage - Main order entry layout

import { useState, useCallback } from 'react'
import { MenuBrowseView } from './browse-menu'
import { CartPanel } from './components/cart'
import { useCartActions } from './shared/store'
import type { Product, CartItem, ServiceMethod } from './shared/types'

type View = 'menu' | 'modifiers' | 'payment' | 'discount'

export function OrderEntryPage() {
  const [currentView, setCurrentView] = useState<View>('menu')
  const [_selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [_editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod | null>(null)

  const { addItem, clearCart } = useCartActions()

  // Handle product selection from menu
  const handleProductSelect = useCallback(
    (product: Product) => {
      setSelectedProduct(product)
      // TODO: Check if product needs modifiers (sizes, toppings)
      // For now, add directly to cart with defaults
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product,
        quantity: 1,
        portions: [],
        modifiers: [],
        taxRate: product.isTaxed ? 0.0825 : 0, // Default tax rate, TODO: fetch from DB
        specialInstructions: [],
        createdAt: new Date(),
      }
      addItem(newItem)
    },
    [addItem]
  )

  // Handle editing an existing cart item
  const handleEditItem = useCallback((item: CartItem) => {
    setEditingItem(item)
    setCurrentView('modifiers')
  }, [])

  // Handle service method change
  const handleServiceMethodChange = useCallback(
    (method: ServiceMethod | null) => {
      setServiceMethod(method)
    },
    []
  )

  // Handle pay button
  const handlePay = useCallback(() => {
    setCurrentView('payment')
  }, [])

  // Handle hold button
  const handleHold = useCallback(() => {
    // TODO: Save to hold invoices
    console.log('Hold order')
  }, [])

  // Handle cancel button
  const handleCancel = useCallback(() => {
    if (confirm('Cancel this order?')) {
      clearCart()
    }
  }, [clearCart])

  return (
    <div className="flex h-full min-h-0 flex-1">
      {/* Cart sidebar - LEFT */}
      <CartPanel
        serviceMethod={serviceMethod}
        onServiceMethodChange={handleServiceMethodChange}
        onEditItem={handleEditItem}
        onPay={handlePay}
        onHold={handleHold}
        onCancel={handleCancel}
      />

      {/* Main content area - RIGHT */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'menu' && (
          <MenuBrowseView onProductSelect={handleProductSelect} />
        )}
        {currentView === 'modifiers' && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50">Modifier view coming soon...</p>
          </div>
        )}
        {currentView === 'payment' && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50">Payment view coming soon...</p>
          </div>
        )}
        {currentView === 'discount' && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50">Discount view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
