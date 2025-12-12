// Order State Machine - XState 5
// Handles order flow: browsing → configuring → discount → payment → complete

import { setup, assign } from 'xstate'
import type {
  Product,
  CartItem,
  CartItemModifier,
  ServiceMethod,
  Customer,
  Discount,
  AssignedSize,
  ProductType,
  PortionType,
  SpecialRequest,
} from '../types'

// === Context ===

export interface OrderContext {
  // Cart
  cart: CartItem[]
  selectedCartItemId: string | null // for item discounts (single-click selection)
  editingItemId: string | null
  isNewItem: boolean // true = cancel removes item, false = cancel reverts to original
  originalItem: CartItem | null // snapshot before editing (for revert)

  // Session
  serviceMethod: ServiceMethod | null
  customer: Customer | null
  invoiceDiscount: Discount | null
  isTaxExempt: boolean

  // Payment
  tenderAmount: number
}

const initialContext: OrderContext = {
  cart: [],
  selectedCartItemId: null,
  editingItemId: null,
  isNewItem: false,
  originalItem: null,
  serviceMethod: null,
  customer: null,
  invoiceDiscount: null,
  isTaxExempt: false,
  tenderAmount: 0,
}

// === Events ===

export type OrderEvent =
  // Product actions
  | { type: 'ADD_PRODUCT'; product: Product; needsModifiers: boolean }
  | { type: 'EDIT_ITEM'; itemId: string }
  // Modifier actions (live updates)
  | { type: 'SET_SIZE'; size: AssignedSize | null }
  | { type: 'SET_TYPE'; productType: ProductType | null }
  | { type: 'SET_PORTIONS'; portions: PortionType[] }
  | { type: 'SET_MODIFIERS'; modifiers: CartItemModifier[] }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'ADD_SPECIAL_REQUEST'; request: SpecialRequest }
  | { type: 'REMOVE_SPECIAL_REQUEST'; requestId: string }
  // Modifier flow control
  | { type: 'CONFIRM_ITEM' }
  | { type: 'CANCEL_ITEM' }
  | { type: 'DELETE_ITEM' }
  // Cart actions
  | { type: 'SELECT_CART_ITEM'; itemId: string | null }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'SET_ITEM_DISCOUNT'; itemId: string; discount: Discount | null }
  | { type: 'DUPLICATE_ITEM'; itemId: string }
  | { type: 'SET_ITEM_TAX_FREE'; itemId: string; isTaxFree: boolean }
  | { type: 'SET_ITEM_QUANTITY'; itemId: string; quantity: number }
  // Session actions
  | { type: 'SET_SERVICE_METHOD'; method: ServiceMethod | null }
  | { type: 'SET_CUSTOMER'; customer: Customer | null }
  | { type: 'SET_INVOICE_DISCOUNT'; discount: Discount | null }
  | { type: 'SET_TAX_EXEMPT'; exempt: boolean }
  // Navigation
  | { type: 'GO_TO_DISCOUNT' }
  | { type: 'GO_TO_PAYMENT' }
  | { type: 'GO_TO_MENU' }
  // Order actions
  | { type: 'HOLD_ORDER' }
  | { type: 'CANCEL_ORDER' }
  | { type: 'COMPLETE_PAYMENT'; amount: number }
  | { type: 'RESET_ORDER' }

// === Helpers ===

function createCartItem(product: Product): CartItem {
  return {
    id: crypto.randomUUID(),
    product,
    quantity: 1,
    portions: [],
    modifiers: [],
    taxRate: product.isTaxed ? 0.0825 : 0,
    specialInstructions: [],
    specialRequests: [],
    createdAt: new Date(),
  }
}

function productNeedsModifiers(product: Product): boolean {
  const hasSizes = (product.assignedSizes?.length ?? 0) > 0
  const hasTypes = (product.productTypes?.length ?? 0) > 0
  const hasPortions = (product.portionTypes?.length ?? 0) > 0
  const hasModifiers = (product.toppingCategories?.length ?? 0) > 0
  return hasSizes || hasTypes || hasPortions || hasModifiers
}

// === Machine ===

export const orderMachine = setup({
  types: {
    context: {} as OrderContext,
    events: {} as OrderEvent,
  },
  guards: {
    cartNotEmpty: ({ context }) => context.cart.length > 0,
    needsModifiers: ({ event }) =>
      event.type === 'ADD_PRODUCT' && event.needsModifiers,
    isNewItem: ({ context }) => context.isNewItem,
  },
  actions: {
    // Add product to cart immediately
    addProductToCart: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'ADD_PRODUCT') return context.cart
        const newItem = createCartItem(event.product)
        return [...context.cart, newItem]
      },
      editingItemId: ({ context, event }) => {
        if (event.type !== 'ADD_PRODUCT') return context.editingItemId
        // Find the item we just added (it's the last one)
        return null // Will be set by startConfiguring if needed
      },
    }),

    // Start configuring a new item
    startConfiguringNew: assign(({ context, event }) => {
      if (event.type !== 'ADD_PRODUCT') return context
      // The new item is the last one in cart
      const newItem = context.cart[context.cart.length - 1]
      return {
        ...context,
        editingItemId: newItem.id,
        isNewItem: true,
        originalItem: null, // No original for new items
      }
    }),

    // Start editing existing item
    startEditingExisting: assign(({ context, event }) => {
      if (event.type !== 'EDIT_ITEM') return context
      const item = context.cart.find((i) => i.id === event.itemId)
      if (!item) return context
      return {
        ...context,
        editingItemId: event.itemId,
        isNewItem: false,
        originalItem: structuredClone(item), // Deep clone for revert
      }
    }),

    // Live update: set size
    updateSize: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_SIZE' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? { ...item, size: event.size ?? undefined }
            : item
        )
      },
    }),

    // Live update: set type
    updateType: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_TYPE' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? { ...item, type: event.productType ?? undefined }
            : item
        )
      },
    }),

    // Live update: set portions
    updatePortions: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_PORTIONS' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? {
                ...item,
                portions: event.portions.map((p) => ({
                  id: crypto.randomUUID(),
                  portionType: p,
                  modifiers: [],
                })),
              }
            : item
        )
      },
    }),

    // Live update: set modifiers
    updateModifiers: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_MODIFIERS' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? { ...item, modifiers: event.modifiers }
            : item
        )
      },
    }),

    // Live update: set quantity
    updateQuantity: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_QUANTITY' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? { ...item, quantity: Math.max(1, event.quantity) }
            : item
        )
      },
    }),

    // Live update: add special request
    addSpecialRequest: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'ADD_SPECIAL_REQUEST' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? { ...item, specialRequests: [...item.specialRequests, event.request] }
            : item
        )
      },
    }),

    // Live update: remove special request
    removeSpecialRequest: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'REMOVE_SPECIAL_REQUEST' || !context.editingItemId)
          return context.cart
        return context.cart.map((item) =>
          item.id === context.editingItemId
            ? {
                ...item,
                specialRequests: item.specialRequests.filter(
                  (r) => r.id !== event.requestId
                ),
              }
            : item
        )
      },
    }),

    // Confirm: just clear editing state (cart already updated)
    confirmItem: assign({
      editingItemId: null,
      isNewItem: false,
      originalItem: null,
    }),

    // Cancel new item: remove from cart
    cancelNewItem: assign(({ context }) => ({
      cart: context.cart.filter((i) => i.id !== context.editingItemId),
      editingItemId: null,
      isNewItem: false,
      originalItem: null,
    })),

    // Cancel edit: revert to original
    cancelEditItem: assign(({ context }) => {
      if (!context.originalItem) {
        return {
          ...context,
          editingItemId: null,
          isNewItem: false,
          originalItem: null,
        }
      }
      return {
        cart: context.cart.map((item) =>
          item.id === context.editingItemId && context.originalItem
            ? context.originalItem
            : item
        ),
        editingItemId: null,
        isNewItem: false,
        originalItem: null,
      }
    }),

    // Delete item being edited
    deleteEditingItem: assign(({ context }) => ({
      cart: context.cart.filter((i) => i.id !== context.editingItemId),
      editingItemId: null,
      isNewItem: false,
      originalItem: null,
    })),

    // Remove item by ID
    removeItem: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_ITEM') return context
      return {
        cart: context.cart.filter((i) => i.id !== event.itemId),
        selectedCartItemId:
          context.selectedCartItemId === event.itemId
            ? null
            : context.selectedCartItemId,
      }
    }),

    // Select cart item (for item discounts)
    selectCartItem: assign({
      selectedCartItemId: ({ context, event }) => {
        if (event.type !== 'SELECT_CART_ITEM') return context.selectedCartItemId
        // Toggle selection
        return context.selectedCartItemId === event.itemId ? null : event.itemId
      },
    }),

    // Set item discount
    setItemDiscount: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_ITEM_DISCOUNT') return context.cart
        return context.cart.map((item) =>
          item.id === event.itemId
            ? { ...item, itemDiscount: event.discount ?? undefined }
            : item
        )
      },
    }),

    // Duplicate item
    duplicateItem: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'DUPLICATE_ITEM') return context.cart
        const item = context.cart.find((i) => i.id === event.itemId)
        if (!item) return context.cart
        const duplicate: CartItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        return [...context.cart, duplicate]
      },
    }),

    // Set item tax free
    setItemTaxFree: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_ITEM_TAX_FREE') return context.cart
        return context.cart.map((item) =>
          item.id === event.itemId
            ? { ...item, isTaxFree: event.isTaxFree }
            : item
        )
      },
    }),

    // Set item quantity (from bottom bar)
    setItemQuantity: assign({
      cart: ({ context, event }) => {
        if (event.type !== 'SET_ITEM_QUANTITY') return context.cart
        return context.cart.map((item) =>
          item.id === event.itemId
            ? { ...item, quantity: Math.max(1, event.quantity) }
            : item
        )
      },
    }),

    // Session actions
    setServiceMethod: assign({
      serviceMethod: ({ event }) =>
        event.type === 'SET_SERVICE_METHOD' ? event.method : null,
    }),

    setCustomer: assign({
      customer: ({ event }) =>
        event.type === 'SET_CUSTOMER' ? event.customer : null,
    }),

    setInvoiceDiscount: assign({
      invoiceDiscount: ({ event }) =>
        event.type === 'SET_INVOICE_DISCOUNT' ? event.discount : null,
    }),

    setTaxExempt: assign({
      isTaxExempt: ({ event }) =>
        event.type === 'SET_TAX_EXEMPT' ? event.exempt : false,
    }),

    // Reset order
    resetOrder: assign(() => initialContext),

    // Clear cart
    clearCart: assign({ cart: [] }),
  },
}).createMachine({
  id: 'order',
  initial: 'browsing',
  context: initialContext,

  states: {
    // Main menu browsing state
    browsing: {
      on: {
        ADD_PRODUCT: [
          {
            // Product needs modifiers: add to cart, then go to configuring
            guard: 'needsModifiers',
            target: 'configuring',
            actions: ['addProductToCart', 'startConfiguringNew'],
          },
          {
            // Simple product: just add to cart, stay in browsing
            actions: 'addProductToCart',
          },
        ],
        EDIT_ITEM: {
          target: 'configuring',
          actions: 'startEditingExisting',
        },
        REMOVE_ITEM: {
          actions: 'removeItem',
        },
        SELECT_CART_ITEM: {
          actions: 'selectCartItem',
        },
        SET_ITEM_DISCOUNT: {
          actions: 'setItemDiscount',
        },
        DUPLICATE_ITEM: {
          actions: 'duplicateItem',
        },
        SET_ITEM_TAX_FREE: {
          actions: 'setItemTaxFree',
        },
        SET_ITEM_QUANTITY: {
          actions: 'setItemQuantity',
        },
        GO_TO_DISCOUNT: 'discount',
        GO_TO_PAYMENT: {
          target: 'payment',
          guard: 'cartNotEmpty',
        },
        // Session actions available in browsing
        SET_SERVICE_METHOD: { actions: 'setServiceMethod' },
        SET_CUSTOMER: { actions: 'setCustomer' },
        SET_TAX_EXEMPT: { actions: 'setTaxExempt' },
        CANCEL_ORDER: { actions: 'clearCart' },
        HOLD_ORDER: 'holding',
      },
    },

    // Configuring product (size, type, portions, modifiers)
    configuring: {
      on: {
        // Live updates
        SET_SIZE: { actions: 'updateSize' },
        SET_TYPE: { actions: 'updateType' },
        SET_PORTIONS: { actions: 'updatePortions' },
        SET_MODIFIERS: { actions: 'updateModifiers' },
        SET_QUANTITY: { actions: 'updateQuantity' },
        ADD_SPECIAL_REQUEST: { actions: 'addSpecialRequest' },
        REMOVE_SPECIAL_REQUEST: { actions: 'removeSpecialRequest' },

        // Flow control
        CONFIRM_ITEM: {
          target: 'browsing',
          actions: 'confirmItem',
        },
        CANCEL_ITEM: [
          {
            guard: 'isNewItem',
            target: 'browsing',
            actions: 'cancelNewItem',
          },
          {
            target: 'browsing',
            actions: 'cancelEditItem',
          },
        ],
        DELETE_ITEM: {
          target: 'browsing',
          actions: 'deleteEditingItem',
        },
      },
    },

    // Discount selection
    discount: {
      on: {
        SELECT_CART_ITEM: { actions: 'selectCartItem' },
        SET_INVOICE_DISCOUNT: { actions: 'setInvoiceDiscount' },
        SET_ITEM_DISCOUNT: { actions: 'setItemDiscount' },
        GO_TO_MENU: 'browsing',
      },
    },

    // Payment processing
    payment: {
      on: {
        COMPLETE_PAYMENT: {
          target: 'complete',
          actions: assign({
            tenderAmount: ({ event }) =>
              event.type === 'COMPLETE_PAYMENT' ? event.amount : 0,
          }),
        },
        GO_TO_MENU: 'browsing',
      },
    },

    // Hold order (save for later)
    holding: {
      // TODO: Persist to database, then reset
      always: {
        target: 'browsing',
        actions: 'resetOrder',
      },
    },

    // Order complete
    complete: {
      type: 'final',
      entry: 'resetOrder',
    },
  },
})

// === Selectors ===

export function selectEditingItem(context: OrderContext): CartItem | null {
  if (!context.editingItemId) return null
  return context.cart.find((i) => i.id === context.editingItemId) ?? null
}

export function selectEditingProduct(context: OrderContext): Product | null {
  const item = selectEditingItem(context)
  return item?.product ?? null
}

export { productNeedsModifiers }
