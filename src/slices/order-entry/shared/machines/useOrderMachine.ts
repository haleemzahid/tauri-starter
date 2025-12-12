// Order Machine Hooks - Convenience hooks for common operations

import { useCallback, useMemo } from 'react'
import { useOrderMachineContext } from './orderMachineContext'
import {
  selectEditingItem,
  selectEditingProduct,
  productNeedsModifiers,
} from './orderMachine'
import { getProductWithDetails } from '../database/product-queries'
import { calculateCartTotals } from '../utils/pricing'
import type {
  Product,
  CartItem,
  CartItemModifier,
  AssignedSize,
  ProductType,
  PortionType,
  Discount,
  CartTotals,
  ServiceMethod,
  SpecialRequest,
} from '../types'

// === View State ===

export type OrderView = 'menu' | 'modifiers' | 'discount' | 'payment'

export function useOrderView(): OrderView {
  const { state } = useOrderMachineContext()

  if (state.matches('configuring')) return 'modifiers'
  if (state.matches('discount')) return 'discount'
  if (state.matches('payment')) return 'payment'
  return 'menu'
}

// === Cart State ===

export function useCart(): CartItem[] {
  const { context } = useOrderMachineContext()
  return context.cart
}

export function useCartTotals(): CartTotals {
  const { context } = useOrderMachineContext()
  return useMemo(
    () =>
      calculateCartTotals(
        context.cart,
        context.isTaxExempt,
        context.invoiceDiscount,
        context.tenderAmount
      ),
    [
      context.cart,
      context.isTaxExempt,
      context.invoiceDiscount,
      context.tenderAmount,
    ]
  )
}

export function useIsCartEmpty(): boolean {
  const { context } = useOrderMachineContext()
  return context.cart.length === 0
}

// === Editing State ===

export function useEditingItem(): CartItem | null {
  const { context } = useOrderMachineContext()
  return selectEditingItem(context)
}

export function useEditingProduct(): Product | null {
  const { context } = useOrderMachineContext()
  return selectEditingProduct(context)
}

export function useIsNewItem(): boolean {
  const { context } = useOrderMachineContext()
  return context.isNewItem
}

// === Selected Cart Item (for discounts) ===

export function useSelectedCartItemId(): string | null {
  const { context } = useOrderMachineContext()
  return context.selectedCartItemId
}

export function useSelectedCartItem(): CartItem | null {
  const { context } = useOrderMachineContext()
  if (!context.selectedCartItemId) return null
  return context.cart.find((i) => i.id === context.selectedCartItemId) ?? null
}

export function useSelectCartItem() {
  const { send } = useOrderMachineContext()
  return useCallback(
    (itemId: string | null) => send({ type: 'SELECT_CART_ITEM', itemId }),
    [send]
  )
}

// === Session State ===

export function useServiceMethod(): ServiceMethod | null {
  const { context } = useOrderMachineContext()
  return context.serviceMethod
}

export function useInvoiceDiscount(): Discount | null {
  const { context } = useOrderMachineContext()
  return context.invoiceDiscount
}

// === Cart Actions ===

export function useCartActions() {
  const { send } = useOrderMachineContext()

  return useMemo(
    () => ({
      removeItem: (itemId: string) => send({ type: 'REMOVE_ITEM', itemId }),
      setItemDiscount: (itemId: string, discount: Discount | null) =>
        send({ type: 'SET_ITEM_DISCOUNT', itemId, discount }),
    }),
    [send]
  )
}

// === Product Actions ===

export function useProductActions() {
  const { send } = useOrderMachineContext()

  const addProduct = useCallback(
    async (product: Product) => {
      // Load full product details
      const details = await getProductWithDetails(product.id)
      const fullProduct: Product = {
        ...product,
        assignedSizes: details.assignedSizes,
        productTypes: details.productTypes,
        portionTypes: details.portionTypes,
        toppingCategories: details.toppingCategories,
      }

      send({
        type: 'ADD_PRODUCT',
        product: fullProduct,
        needsModifiers: productNeedsModifiers(fullProduct),
      })
    },
    [send]
  )

  const editItem = useCallback(
    (itemId: string) => {
      send({ type: 'EDIT_ITEM', itemId })
    },
    [send]
  )

  return { addProduct, editItem }
}

// === Modifier Actions (live updates) ===

export function useModifierActions() {
  const { send } = useOrderMachineContext()

  return useMemo(
    () => ({
      setSize: (size: AssignedSize | null) => send({ type: 'SET_SIZE', size }),
      setType: (productType: ProductType | null) =>
        send({ type: 'SET_TYPE', productType }),
      setPortions: (portions: PortionType[]) =>
        send({ type: 'SET_PORTIONS', portions }),
      setModifiers: (modifiers: CartItemModifier[]) =>
        send({ type: 'SET_MODIFIERS', modifiers }),
      setQuantity: (quantity: number) =>
        send({ type: 'SET_QUANTITY', quantity }),
      addSpecialRequest: (request: SpecialRequest) =>
        send({ type: 'ADD_SPECIAL_REQUEST', request }),
      removeSpecialRequest: (requestId: string) =>
        send({ type: 'REMOVE_SPECIAL_REQUEST', requestId }),
      confirm: () => send({ type: 'CONFIRM_ITEM' }),
      cancel: () => send({ type: 'CANCEL_ITEM' }),
      delete: () => send({ type: 'DELETE_ITEM' }),
    }),
    [send]
  )
}

// === Navigation Actions ===

export function useNavigationActions() {
  const { send, state } = useOrderMachineContext()
  const isCartEmpty = useIsCartEmpty()

  return useMemo(
    () => ({
      goToMenu: () => send({ type: 'GO_TO_MENU' }),
      goToDiscount: () => send({ type: 'GO_TO_DISCOUNT' }),
      goToPayment: () => {
        if (!isCartEmpty) send({ type: 'GO_TO_PAYMENT' })
      },
      canGoToPayment: !isCartEmpty && !state.matches('configuring'),
    }),
    [send, isCartEmpty, state]
  )
}

// === Session Actions ===

export function useSessionActions() {
  const { send } = useOrderMachineContext()

  return useMemo(
    () => ({
      setServiceMethod: (method: ServiceMethod | null) =>
        send({ type: 'SET_SERVICE_METHOD', method }),
      setInvoiceDiscount: (discount: Discount | null) =>
        send({ type: 'SET_INVOICE_DISCOUNT', discount }),
      setTaxExempt: (exempt: boolean) =>
        send({ type: 'SET_TAX_EXEMPT', exempt }),
    }),
    [send]
  )
}

// === Order Actions ===

export function useOrderActions() {
  const { send } = useOrderMachineContext()

  return useMemo(
    () => ({
      holdOrder: () => send({ type: 'HOLD_ORDER' }),
      cancelOrder: () => {
        if (confirm('Cancel this order?')) {
          send({ type: 'CANCEL_ORDER' })
        }
      },
      completePayment: (amount: number) =>
        send({ type: 'COMPLETE_PAYMENT', amount }),
      resetOrder: () => send({ type: 'RESET_ORDER' }),
    }),
    [send]
  )
}
