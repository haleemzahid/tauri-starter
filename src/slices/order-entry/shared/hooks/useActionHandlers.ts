// Action Handlers - Centralized logic for order entry action buttons

import { useCallback } from 'react'
import {
  useIsTaxExempt,
  useSetIsTaxExempt,
  useSelectedCartItem,
  useCartActions,
} from '../store'
import type { ActionType } from '../types/order-entry-action'
import type { CartItem } from '../types'

export function useActionHandlers() {
  const isTaxExempt = useIsTaxExempt()
  const setIsTaxExempt = useSetIsTaxExempt()
  const selectedItem = useSelectedCartItem()
  const { addItem, removeItem, setItemTaxFree, selectItem } = useCartActions()

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
        default:
          console.log(`Action not implemented: ${actionType}`)
      }
    },
    [isTaxExempt, setIsTaxExempt, selectedItem, setItemTaxFree, duplicateItem, deleteItem]
  )

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

  return { handleAction, isActionActive }
}
