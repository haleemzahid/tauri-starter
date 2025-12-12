// OrderEntryPage - Main order entry layout (XState powered)

import { MenuBrowseView } from './browse-menu'
import { CartPanel } from './components/cart'
import { DiscountView } from './discount-view'
import { ModifierView } from './modifier-view'
import {
  useOrderView,
  useServiceMethod,
  useProductActions,
  useModifierActions,
  useNavigationActions,
  useSessionActions,
  useOrderActions,
  useSelectedCartItem,
  useCartActions,
} from './shared/machines'

export function OrderEntryPage() {
  const currentView = useOrderView()
  const serviceMethod = useServiceMethod()
  const selectedCartItem = useSelectedCartItem()

  const { addProduct, editItem } = useProductActions()
  const { confirm, cancel, delete: deleteItem } = useModifierActions()
  const { goToDiscount, goToPayment, goToMenu } = useNavigationActions()
  const { setServiceMethod, setInvoiceDiscount } = useSessionActions()
  const { holdOrder, cancelOrder } = useOrderActions()
  const { setItemDiscount } = useCartActions()

  return (
    <div className="flex h-full min-h-0 flex-1">
      {/* Cart sidebar - LEFT */}
      <CartPanel
        serviceMethod={serviceMethod}
        onServiceMethodChange={setServiceMethod}
        onDoubleClickItem={(item) => editItem(item.id)}
        onPay={goToPayment}
        onHold={holdOrder}
        onCancel={cancelOrder}
        onDiscount={goToDiscount}
      />

      {/* Main content area - RIGHT */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {currentView === 'menu' && (
          <MenuBrowseView onProductSelect={addProduct} />
        )}
        {currentView === 'modifiers' && (
          <ModifierView
            onConfirm={confirm}
            onCancel={cancel}
            onDelete={deleteItem}
          />
        )}
        {currentView === 'payment' && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50">Payment view coming soon...</p>
          </div>
        )}
        {currentView === 'discount' && (
          <DiscountView
            onSelectDiscount={(d) => {
              if (selectedCartItem) {
                setItemDiscount(selectedCartItem.id, d)
              } else {
                setInvoiceDiscount(d)
              }
            }}
            onClearInvoiceDiscount={() => setInvoiceDiscount(null)}
            onClearItemDiscount={() => {
              if (selectedCartItem) {
                setItemDiscount(selectedCartItem.id, null)
              }
            }}
            onDone={goToMenu}
            hasSelectedItem={selectedCartItem !== null}
          />
        )}
      </div>
    </div>
  )
}
