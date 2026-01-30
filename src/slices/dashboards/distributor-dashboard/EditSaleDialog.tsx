import { useId, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import type { DistributorDashboardSale } from '../shared/types'
import type { SaleFormData } from './useSaleActions'

interface EditSaleDialogProps {
  sale: DistributorDashboardSale | null
  isOpen: boolean
  isSubmitting: boolean
  onSubmit: (data: SaleFormData) => Promise<void>
  onClose: () => void
}

export function EditSaleDialog({
  sale,
  isOpen,
  isSubmitting,
  onSubmit,
  onClose,
}: EditSaleDialogProps) {
  const formId = useId()

  const form = useForm({
    defaultValues: {
      date: sale?.date ?? new Date().toISOString().split('T')[0],
      amount: sale?.amount ?? 0,
      note: sale?.note ?? '',
      bank_details: sale?.bank_details ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        amount: Number(value.amount),
      })
    },
  })

  // Sync form with sale data when it changes
  useEffect(() => {
    if (sale) {
      form.setFieldValue('date', sale.date)
      form.setFieldValue('amount', sale.amount)
      form.setFieldValue('note', sale.note ?? '')
      form.setFieldValue('bank_details', sale.bank_details ?? '')
    }
  }, [sale, form])

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-PK').format(value)
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Sale"
      maxWidth="md"
      actions={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <button
                type="submit"
                form={formId}
                className="btn btn-primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <form.Field
            name="date"
            validators={{
              onChange: ({ value }) => (!value ? 'Date is required' : undefined),
            }}
          >
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Date <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'input-error' : ''
                  }`}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors[0] && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {field.state.meta.errors[0]}
                    </span>
                  </label>
                )}
              </div>
            )}
          </form.Field>

          {/* Amount */}
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (!value || value <= 0) return 'Enter a valid amount'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Amount (PKR) <span className="text-error">*</span>
                  </span>
                  {field.state.value > 0 && (
                    <span className="label-text-alt text-success font-semibold">
                      {formatAmount(Number(field.state.value))}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className={`input input-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'input-error' : ''
                  }`}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="e.g., 100000"
                  min="0"
                  step="any"
                />
                {field.state.meta.errors[0] && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {field.state.meta.errors[0]}
                    </span>
                  </label>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Bank Details */}
        <form.Field name="bank_details">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Bank Details</span>
                <span className="label-text-alt text-base-content/60">Optional</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Online, Cash, Bank Name"
              />
            </div>
          )}
        </form.Field>

        {/* Note */}
        <form.Field name="note">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Note</span>
                <span className="label-text-alt text-base-content/60">Optional</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20 w-full"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Monthly payment, Partial payment, etc."
              />
            </div>
          )}
        </form.Field>
      </form>
    </BaseDialog>
  )
}
