// useOrderEntry - State and handlers for order entry page

import { useState, useCallback, useEffect } from 'react'
import {
  useCartActions,
  useSetInvoiceDiscount,
  useSelectedCartItem,
  useModifierSelections,
  useResetModifierSelections,
  selectedCartItemIdAtom,
  cartItemsAtom,
} from './shared/store'
import { useSetSelectedProduct } from './shared/store/ui-atoms'
import { getProductWithDetails } from './shared/database/product-queries'
import { useModifierValidation } from './modifier-view/useModifierValidation'
import { useSetAtom, useAtomValue } from 'jotai'
import type {
  Product,
  CartItem,
  CartItemModifier,
  ServiceMethod,
  Discount,
} from './shared/types'

export type OrderView = 'menu' | 'modifiers' | 'payment' | 'discount'

/** Check if product needs modifier configuration */
function productNeedsModifiers(product: Product): boolean {
  const hasSizes = (product.assignedSizes?.length ?? 0) > 0
  const hasTypes = (product.productTypes?.length ?? 0) > 0
  const hasPortions = (product.portionTypes?.length ?? 0) > 0
  const hasModifiers = (product.toppingCategories?.length ?? 0) > 0
  return hasSizes || hasTypes || hasPortions || hasModifiers
}

export function useOrderEntry() {
  const [currentView, setCurrentView] = useState<OrderView>('menu')
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  const { addItem, updateItem, removeItem, clearCart, setItemDiscount } =
    useCartActions()
  const setInvoiceDiscount = useSetInvoiceDiscount()
  const selectedItem = useSelectedCartItem()
  const setSelectedProduct = useSetSelectedProduct()
  const setSelectedCartItemId = useSetAtom(selectedCartItemIdAtom)
  const modifierSelections = useModifierSelections()
  const resetModifierSelections = useResetModifierSelections()

  // --- Product Actions ---
  const handleProductSelect = useCallback(
    async (product: Product) => {
      setIsLoadingProduct(true)
      try {
        // Load full product details (sizes, types, portions, toppings)
        const details = await getProductWithDetails(product.id)
        const fullProduct: Product = {
          ...product,
          assignedSizes: details.assignedSizes,
          productTypes: details.productTypes,
          portionTypes: details.portionTypes,
          toppingCategories: details.toppingCategories,
        }

        // Always add to cart immediately
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          product: fullProduct,
          quantity: 1,
          portions: [],
          modifiers: [],
          taxRate: fullProduct.isTaxed ? 0.0825 : 0,
          specialInstructions: [],
          createdAt: new Date(),
        }
        addItem(newItem)

        if (productNeedsModifiers(fullProduct)) {
          // Show modifier view to configure
          setEditingItemId(newItem.id)
          setSelectedProduct(fullProduct)
          setCurrentView('modifiers')
        }
      } finally {
        setIsLoadingProduct(false)
      }
    },
    [addItem, setSelectedProduct]
  )

  const handleDoubleClickItem = useCallback(
    (item: CartItem) => {
      setEditingItemId(item.id)
      setSelectedCartItemId(item.id)
      setSelectedProduct(item.product)
      setCurrentView('modifiers')
    },
    [setSelectedProduct, setSelectedCartItemId]
  )

  // --- Live Cart Updates (when modifiers change) ---
  const cartItems = useAtomValue(cartItemsAtom)

  useEffect(() => {
    if (!editingItemId || currentView !== 'modifiers') return

    // Find the item we're editing
    const currentItem = cartItems.find((item) => item.id === editingItemId)
    if (!currentItem) return

    // Build modifiers array from selections
    const modifiers: CartItemModifier[] = []
    modifierSelections.modifiersByCategory.forEach((mods) => {
      mods.forEach((mod) => {
        modifiers.push({
          id: mod.id,
          topping: mod.topping,
          affix: mod.affix,
          quantity: mod.quantity,
        })
      })
    })

    const updatedItem: CartItem = {
      ...currentItem,
      quantity: modifierSelections.quantity,
      size: modifierSelections.size ?? undefined,
      type: modifierSelections.type ?? undefined,
      portions: modifierSelections.portions.map((p) => ({
        id: crypto.randomUUID(),
        portionType: p,
        modifiers: [],
      })),
      modifiers,
    }

    updateItem(updatedItem)
  }, [editingItemId, currentView, modifierSelections, updateItem])

  // --- Modifier Actions ---
  const handleModifierConfirm = useCallback(() => {
    // Cart is already updated live, just close the view
    resetModifierSelections()
    setEditingItemId(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [resetModifierSelections, setSelectedProduct])

  const handleModifierCancel = useCallback(() => {
    resetModifierSelections()
    setEditingItemId(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [resetModifierSelections, setSelectedProduct])

  const handleModifierDelete = useCallback(() => {
    // Delete the item being edited
    if (editingItemId) {
      removeItem(editingItemId)
    }
    resetModifierSelections()
    setEditingItemId(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [editingItemId, removeItem, resetModifierSelections, setSelectedProduct])

  // --- Validation ---
  const { isValid: isModifierValid } = useModifierValidation()

  // --- Order Actions ---
  const handlePay = useCallback(() => {
    // Block if in modifier view with incomplete selection
    if (currentView === 'modifiers' && !isModifierValid) return
    setCurrentView('payment')
  }, [currentView, isModifierValid])
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

  const handleOpenDiscount = useCallback(() => {
    // Block if in modifier view with incomplete selection
    if (currentView === 'modifiers' && !isModifierValid) return
    setCurrentView('discount')
  }, [currentView, isModifierValid])
  const handleDiscountDone = useCallback(() => setCurrentView('menu'), [])

  return {
    // State
    currentView,
    serviceMethod,
    selectedItem,
    isLoadingProduct,

    // Setters
    setServiceMethod,

    // Product actions
    handleProductSelect,
    handleDoubleClickItem,

    // Modifier actions
    handleModifierConfirm,
    handleModifierCancel,
    handleModifierDelete,

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
