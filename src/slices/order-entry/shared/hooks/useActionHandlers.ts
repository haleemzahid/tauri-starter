// Action Handlers - Centralized logic for order entry action buttons

import { useCallback, useState } from 'react'
import {
  useIsTaxExempt,
  useSetIsTaxExempt,
  useSelectedCartItem,
  useCartActions,
  useSetInvoiceDiscount,
} from '../store'
import type { ActionType } from '../types/order-entry-action'
import type { CartItem } from '../types'

export function useActionHandlers() {
  const isTaxExempt = useIsTaxExempt()
  const setIsTaxExempt = useSetIsTaxExempt()
  const selectedItem = useSelectedCartItem()
  const setInvoiceDiscount = useSetInvoiceDiscount()
  const {
    addItem,
    removeItem,
    updateQuantity,
    setItemTaxFree,
    setItemDiscount,
    selectItem,
    clearCart,
  } = useCartActions()

  // Confirmation dialog state for CancelOrder
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const duplicateItem = useCallback(
    (item: CartItem) => {
      const duplicate: CartItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }
      addItem(duplicate)
    },
    [addItem]
  )

  const deleteItem = useCallback(
    (itemId: string) => {
      removeItem(itemId)
      selectItem(null)
    },
    [removeItem, selectItem]
  )

  const handleAction = useCallback(
    (actionType: ActionType) => {
      switch (actionType) {
        case 'TaxExempt':
          setIsTaxExempt(!isTaxExempt)
          break
        case 'MakeTaxFree':
          if (selectedItem) {
            setItemTaxFree(selectedItem.id, !selectedItem.isTaxFree)
          }
          break
        case 'DuplicateItem':
          if (selectedItem) {
            duplicateItem(selectedItem)
          }
          break
        case 'RemoveItem':
          if (selectedItem) {
            deleteItem(selectedItem.id)
          }
          break
        case 'IncreaseQuantity':
          if (selectedItem) {
            updateQuantity(selectedItem.id, selectedItem.quantity + 1)
          }
          break
        case 'DecreaseQuantity':
          if (selectedItem) {
            if (selectedItem.quantity <= 1) {
              deleteItem(selectedItem.id)
            } else {
              updateQuantity(selectedItem.id, selectedItem.quantity - 1)
            }
          }
          break
        case 'ClearInvoiceDiscount':
          setInvoiceDiscount(null)
          break
        case 'ClearItemDiscount':
          if (selectedItem) {
            setItemDiscount(selectedItem.id, null)
          }
          break
        case 'CancelOrder':
          // Show confirmation dialog - actual cancel handled by confirmCancelOrder
          setShowCancelConfirm(true)
          break
        default:
          // eslint-disable-next-line no-console
          console.warn(`Action not implemented: ${actionType}`)
      }
    },
    [
      isTaxExempt,
      setIsTaxExempt,
      selectedItem,
      setItemTaxFree,
      setItemDiscount,
      setInvoiceDiscount,
      duplicateItem,
      deleteItem,
      updateQuantity,
    ]
  )

  // Cancel order confirmation handlers
  const confirmCancelOrder = useCallback(() => {
    clearCart()
    setShowCancelConfirm(false)
  }, [clearCart])

  const dismissCancelOrder = useCallback(() => {
    setShowCancelConfirm(false)
  }, [])

  const isActionActive = useCallback(
    (actionType: ActionType): boolean => {
      switch (actionType) {
        case 'TaxExempt':
          return isTaxExempt
        case 'MakeTaxFree':
          return selectedItem?.isTaxFree ?? false
        default:
          return false
      }
    },
    [isTaxExempt, selectedItem]
  )

  return {
    handleAction,
    isActionActive,
    // Cancel order dialog state and handlers
    showCancelConfirm,
    confirmCancelOrder,
    dismissCancelOrder,
  }
}
