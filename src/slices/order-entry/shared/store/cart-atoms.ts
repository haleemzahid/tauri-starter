// Cart State Atoms

import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithReducer } from 'jotai/utils'
import type {
  CartItem,
  CartItemModifier,
  CartTotals,
  ServiceMethod,
  Customer,
  Discount,
} from '../types'
import { calculateCartTotals } from '../utils/pricing'

// === Cart Actions ===

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'UPDATE_ITEM'; item: CartItem }
  | {
      type: 'ADD_MODIFIER'
      itemId: string
      portionId?: string
      modifier: CartItemModifier
    }
  | {
      type: 'REMOVE_MODIFIER'
      itemId: string
      portionId?: string
      modifierId: string
    }
  | { type: 'SET_ITEM_DISCOUNT'; itemId: string; discount: Discount | null }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.item]

    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.itemId)

    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.id === action.itemId
          ? { ...item, quantity: Math.max(1, action.quantity) }
          : item
      )

    case 'UPDATE_ITEM':
      return state.map((item) =>
        item.id === action.item.id ? action.item : item
      )

    case 'ADD_MODIFIER':
      return state.map((item) => {
        if (item.id !== action.itemId) return item

        if (action.portionId) {
          // Add to specific portion
          return {
            ...item,
            portions: item.portions.map((portion) =>
              portion.id === action.portionId
                ? {
                    ...portion,
                    modifiers: [...portion.modifiers, action.modifier],
                  }
                : portion
            ),
          }
        } else {
          // Add to item-level modifiers
          return {
            ...item,
            modifiers: [...item.modifiers, action.modifier],
          }
        }
      })

    case 'REMOVE_MODIFIER':
      return state.map((item) => {
        if (item.id !== action.itemId) return item

        if (action.portionId) {
          // Remove from specific portion
          return {
            ...item,
            portions: item.portions.map((portion) =>
              portion.id === action.portionId
                ? {
                    ...portion,
                    modifiers: portion.modifiers.filter(
                      (m) => m.id !== action.modifierId
                    ),
                  }
                : portion
            ),
          }
        } else {
          // Remove from item-level modifiers
          return {
            ...item,
            modifiers: item.modifiers.filter((m) => m.id !== action.modifierId),
          }
        }
      })

    case 'SET_ITEM_DISCOUNT':
      return state.map((item) =>
        item.id === action.itemId
          ? { ...item, itemDiscount: action.discount ?? undefined }
          : item
      )

    case 'CLEAR_CART':
      return []

    case 'LOAD_CART':
      return action.items

    default:
      return state
  }
}

// === Atoms ===

// Cart items with reducer
export const cartItemsAtom = atomWithReducer<CartItem[], CartAction>(
  [],
  cartReducer
)

// Selected item ID (for editing)
export const selectedCartItemIdAtom = atom<string | null>(null)

// Service method (Dine-In / To-Go)
export const serviceMethodAtom = atom<ServiceMethod | null>(null)

// Tax exempt flag
export const isTaxExemptAtom = atom<boolean>(false)

// Customer
export const customerAtom = atom<Customer | null>(null)

// Invoice-level discount
export const invoiceDiscountAtom = atom<Discount | null>(null)

// Tender amount (for payment)
export const tenderAmountAtom = atom<number>(0)

// === Derived Atoms ===

// Selected cart item
export const selectedCartItemAtom = atom((get) => {
  const items = get(cartItemsAtom)
  const selectedId = get(selectedCartItemIdAtom)
  return items.find((item) => item.id === selectedId) ?? null
})

// Cart totals (computed)
export const cartTotalsAtom = atom<CartTotals>((get) => {
  const items = get(cartItemsAtom)
  const isTaxExempt = get(isTaxExemptAtom)
  const invoiceDiscount = get(invoiceDiscountAtom)
  const tenderAmount = get(tenderAmountAtom)

  return calculateCartTotals(items, isTaxExempt, invoiceDiscount, tenderAmount)
})

// Is cart empty
export const isCartEmptyAtom = atom((get) => get(cartItemsAtom).length === 0)

// === Hooks ===

export const useCartItems = () => useAtomValue(cartItemsAtom)
export const useCartTotals = () => useAtomValue(cartTotalsAtom)
export const useSelectedCartItem = () => useAtomValue(selectedCartItemAtom)
export const useIsCartEmpty = () => useAtomValue(isCartEmptyAtom)
export const useServiceMethod = () => useAtomValue(serviceMethodAtom)
export const useCustomer = () => useAtomValue(customerAtom)
export const useIsTaxExempt = () => useAtomValue(isTaxExemptAtom)

// Dispatch hook for cart actions
export function useCartActions() {
  const dispatch = useSetAtom(cartItemsAtom)
  const setSelectedId = useSetAtom(selectedCartItemIdAtom)

  return {
    addItem: (item: CartItem) => {
      dispatch({ type: 'ADD_ITEM', item })
      setSelectedId(item.id)
    },
    removeItem: (itemId: string) => {
      dispatch({ type: 'REMOVE_ITEM', itemId })
      setSelectedId(null)
    },
    updateQuantity: (itemId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity })
    },
    updateItem: (item: CartItem) => {
      dispatch({ type: 'UPDATE_ITEM', item })
    },
    addModifier: (
      itemId: string,
      modifier: CartItemModifier,
      portionId?: string
    ) => {
      dispatch({ type: 'ADD_MODIFIER', itemId, portionId, modifier })
    },
    removeModifier: (
      itemId: string,
      modifierId: string,
      portionId?: string
    ) => {
      dispatch({ type: 'REMOVE_MODIFIER', itemId, portionId, modifierId })
    },
    setItemDiscount: (itemId: string, discount: Discount | null) => {
      dispatch({ type: 'SET_ITEM_DISCOUNT', itemId, discount })
    },
    clearCart: () => {
      dispatch({ type: 'CLEAR_CART' })
      setSelectedId(null)
    },
    loadCart: (items: CartItem[]) => {
      dispatch({ type: 'LOAD_CART', items })
    },
    selectItem: (itemId: string | null) => {
      setSelectedId(itemId)
    },
  }
}

// Session state setters
export const useSetServiceMethod = () => useSetAtom(serviceMethodAtom)
export const useSetCustomer = () => useSetAtom(customerAtom)
export const useSetIsTaxExempt = () => useSetAtom(isTaxExemptAtom)
export const useSetInvoiceDiscount = () => useSetAtom(invoiceDiscountAtom)
export const useSetTenderAmount = () => useSetAtom(tenderAmountAtom)
