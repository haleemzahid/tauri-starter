// OrderEntryPage - Main order entry layout

import { MenuBrowseView } from './browse-menu'
import { CartPanel } from './components/cart'
import { DiscountView } from './discount-view'
import { ModifierView } from './modifier-view'
import { useOrderEntry } from './useOrderEntry'

export function OrderEntryPage() {
  const {
    currentView,
    serviceMethod,
    selectedItem,
    setServiceMethod,
    handleProductSelect,
    handleEditItem,
    handleModifierConfirm,
    handleModifierCancel,
    handleModifierDelete,
    handlePay,
    handleHold,
    handleCancel,
    handleOpenDiscount,
    handleSelectDiscount,
    handleClearInvoiceDiscount,
    handleClearItemDiscount,
    handleDiscountDone,
  } = useOrderEntry()

  return (
    <div className="flex h-full min-h-0 flex-1">
      {/* Cart sidebar - LEFT */}
      <CartPanel
        serviceMethod={serviceMethod}
        onServiceMethodChange={setServiceMethod}
        onEditItem={handleEditItem}
        onPay={handlePay}
        onHold={handleHold}
        onCancel={handleCancel}
        onDiscount={handleOpenDiscount}
      />

      {/* Main content area - RIGHT */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {currentView === 'menu' && (
          <MenuBrowseView onProductSelect={handleProductSelect} />
        )}
        {currentView === 'modifiers' && (
          <ModifierView
            onConfirm={handleModifierConfirm}
            onCancel={handleModifierCancel}
            onDelete={handleModifierDelete}
          />
        )}
        {currentView === 'payment' && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base-content/50">Payment view coming soon...</p>
          </div>
        )}
        {currentView === 'discount' && (
          <DiscountView
            onSelectDiscount={handleSelectDiscount}
            onClearInvoiceDiscount={handleClearInvoiceDiscount}
            onClearItemDiscount={handleClearItemDiscount}
            onDone={handleDiscountDone}
            hasSelectedItem={selectedItem !== null}
          />
        )}
      </div>
    </div>
  )
}
