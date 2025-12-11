// MenuBottomBar - Bottom action bar with item-level actions

import { useOrderEntryActions } from '../../browse-menu/useOrderEntryActions'
import { useActionHandlers } from '../../shared/hooks/useActionHandlers'
import { useSelectedCartItem } from '../../shared/store'
import { ActionButton } from './ActionButton'

export function MenuBottomBar() {
  const { data: actions = [], isLoading } = useOrderEntryActions()
  const { handleAction, isActionActive } = useActionHandlers()
  const selectedItem = useSelectedCartItem()

  const hasSelectedItem = selectedItem !== null

  if (isLoading) {
    return (
      <div className="border-base-300 flex h-12 items-center border-t p-2">
        <span className="loading loading-spinner loading-sm" />
      </div>
    )
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
          isActive={isActionActive(action.type)}
          onClick={() => handleAction(action.type)}
        />
      ))}
    </div>
  )
}
