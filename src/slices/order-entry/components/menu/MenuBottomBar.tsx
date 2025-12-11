// MenuBottomBar - Bottom action bar with item-level actions

import { useOrderEntryActions } from '../../browse-menu/useOrderEntryActions'
import { ActionButton } from './ActionButton'
import type { ActionType } from '../../shared/types/order-entry-action'

interface MenuBottomBarProps {
  hasSelectedItem?: boolean
  onAction?: (actionType: ActionType) => void
}

export function MenuBottomBar({
  hasSelectedItem = false,
  onAction,
}: MenuBottomBarProps) {
  const { data: actions = [], isLoading } = useOrderEntryActions()

  if (isLoading) {
    return (
      <div className="border-base-300 flex h-12 items-center border-t p-2">
        <span className="loading loading-spinner loading-sm" />
      </div>
    )
  }

  const handleAction = (actionType: ActionType) => {
    onAction?.(actionType)
  }

  // Item-scoped actions require a selected item
  const isDisabled = (scope: string) => scope === 'Item' && !hasSelectedItem

  return (
    <div className="border-base-300 bg-base-100 absolute inset-x-0 bottom-0 flex shrink-0 flex-wrap gap-2 border-t p-2">
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          action={action}
          disabled={isDisabled(action.scope)}
          onClick={() => handleAction(action.type)}
        />
      ))}
    </div>
  )
}
