// useOrderEntry - State and handlers for order entry page

import { useState, useCallback } from 'react'
import {
  useCartActions,
  useSetInvoiceDiscount,
  useSelectedCartItem,
  useModifierSelections,
  useResetModifierSelections,
} from './shared/store'
import { useSetSelectedProduct } from './shared/store/ui-atoms'
import { getProductWithDetails } from './shared/database/product-queries'
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
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  const { addItem, updateItem, removeItem, clearCart, setItemDiscount } =
    useCartActions()
  const setInvoiceDiscount = useSetInvoiceDiscount()
  const selectedItem = useSelectedCartItem()
  const setSelectedProduct = useSetSelectedProduct()
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

        if (productNeedsModifiers(fullProduct)) {
          // Store product and show modifier view
          setPendingProduct(fullProduct)
          setSelectedProduct(fullProduct)
          setCurrentView('modifiers')
        } else {
          // Add directly to cart
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
        }
      } finally {
        setIsLoadingProduct(false)
      }
    },
    [addItem, setSelectedProduct]
  )

  const handleEditItem = useCallback(
    (item: CartItem) => {
      setPendingProduct(item.product)
      setSelectedProduct(item.product)
      setCurrentView('modifiers')
    },
    [setSelectedProduct]
  )

  // --- Modifier Actions ---
  const handleModifierConfirm = useCallback(() => {
    if (!pendingProduct) return

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

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: pendingProduct,
      quantity: modifierSelections.quantity,
      size: modifierSelections.size ?? undefined,
      type: modifierSelections.type ?? undefined,
      portions: modifierSelections.portions.map((p) => ({
        id: crypto.randomUUID(),
        portionType: p,
        modifiers: [],
      })),
      modifiers,
      taxRate: pendingProduct.isTaxed ? 0.0825 : 0,
      specialInstructions: [],
      createdAt: new Date(),
    }

    addItem(newItem)
    resetModifierSelections()
    setPendingProduct(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [
    pendingProduct,
    modifierSelections,
    addItem,
    resetModifierSelections,
    setSelectedProduct,
  ])

  const handleModifierCancel = useCallback(() => {
    resetModifierSelections()
    setPendingProduct(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [resetModifierSelections, setSelectedProduct])

  const handleModifierDelete = useCallback(() => {
    // If editing existing item, remove it
    if (selectedItem) {
      removeItem(selectedItem.id)
    }
    resetModifierSelections()
    setPendingProduct(null)
    setSelectedProduct(null)
    setCurrentView('menu')
  }, [selectedItem, removeItem, resetModifierSelections, setSelectedProduct])

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
    isLoadingProduct,

    // Setters
    setServiceMethod,

    // Product actions
    handleProductSelect,
    handleEditItem,

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
