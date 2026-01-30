import { useEffect, useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { User, Users } from 'lucide-react'
import { BaseDialog } from '@/core/components'
import { useListSols } from '@/slices/sols'
import { useListCompanies } from '@/slices/companies'
import type { SaleWithDetails, CreateSaleInput, UpdateSaleInput, DistributorType } from '../shared/types'

interface SaleFormProps {
  sale?: SaleWithDetails
  onSubmit: (data: CreateSaleInput | UpdateSaleInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export default function SaleForm({ sale, onSubmit, onCancel, isOpen }: SaleFormProps) {
  const { data: sols = [] } = useListSols()
  const { data: companies = [] } = useListCompanies()

  const form = useForm({
    defaultValues: {
      sol_id: sale?.sol_id ?? 0,
      distributor_type: sale?.distributor_type ?? ('main' as DistributorType),
      distributor_id: sale?.distributor_id ?? 0,
      company_id: sale?.company_id ?? 0,
      date: sale?.date ?? new Date().toISOString().split('T')[0],
      note: sale?.note ?? '',
      bank_details: sale?.bank_details ?? '',
      amount: sale?.amount ?? 0,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        amount: Number(value.amount),
      })
      form.reset()
    },
  })

  // Watch for field changes
  const solId = form.useStore((s) => s.values.sol_id)
  const distributorType = form.useStore((s) => s.values.distributor_type)

  // Get selected SOL details
  const selectedSol = useMemo(() => sols.find((s) => s.id === solId), [sols, solId])

  // Get available distributors based on type
  const availableDistributors = useMemo(() => {
    if (!selectedSol) return []

    if (distributorType === 'main') {
      return [
        {
          id: selectedSol.main_distributor_id,
          name: selectedSol.main_distributor_name,
        },
      ]
    }

    return selectedSol.sub_distributor_ids.map((id, idx) => ({
      id,
      name: selectedSol.sub_distributor_names[idx],
    }))
  }, [selectedSol, distributorType])

  // Auto-select distributor when type changes
  useEffect(() => {
    if (availableDistributors.length > 0) {
      const currentDistributorId = form.getFieldValue('distributor_id')
      const isValidDistributor = availableDistributors.some((d) => d.id === currentDistributorId)
      if (!isValidDistributor) {
        form.setFieldValue('distributor_id', availableDistributors[0].id)
      }
    } else if (solId > 0) {
      form.setFieldValue('distributor_id', 0)
    }
  }, [availableDistributors, form, solId])

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-PK').format(value)
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={sale ? 'Edit Sale' : 'Record New Sale'}
      maxWidth="xl"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                form="sale-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : sale ? (
                  'Save Changes'
                ) : (
                  'Record Sale'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="sale-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* SOL Selection */}
        <form.Field
          name="sol_id"
          validators={{
            onChange: ({ value }) => (!value || value === 0 ? 'Select a SOL' : undefined),
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  SOL <span className="text-error">*</span>
                </span>
              </label>
              {sols.length === 0 ? (
                <div className="alert alert-warning">
                  <span>No SOLs found. Please create a SOL first.</span>
                </div>
              ) : (
                <select
                  className={`select select-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'select-error' : ''
                  }`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(Number(e.target.value))
                    // Reset distributor when SOL changes
                    form.setFieldValue('distributor_id', 0)
                  }}
                >
                  <option value={0}>-- Select SOL --</option>
                  {sols.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              )}
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">{field.state.meta.errors[0]}</span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        {/* Distributor Type Selection - Only show when SOL is selected */}
        {solId > 0 && (
          <form.Field name="distributor_type">
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Distributor Type <span className="text-error">*</span>
                  </span>
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors flex-1 ${
                      field.state.value === 'main'
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-base-200 border-2 border-transparent hover:bg-base-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="distributor_type"
                      className="radio radio-primary"
                      checked={field.state.value === 'main'}
                      onChange={() => field.handleChange('main')}
                    />
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Main Distributor</div>
                      {selectedSol && (
                        <div className="text-sm text-base-content/60">
                          {selectedSol.main_distributor_name}
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors flex-1 ${
                      field.state.value === 'sub'
                        ? 'bg-secondary/10 border-2 border-secondary'
                        : 'bg-base-200 border-2 border-transparent hover:bg-base-300'
                    } ${selectedSol?.sub_distributor_ids.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="distributor_type"
                      className="radio radio-secondary"
                      checked={field.state.value === 'sub'}
                      onChange={() => field.handleChange('sub')}
                      disabled={selectedSol?.sub_distributor_ids.length === 0}
                    />
                    <Users className="w-5 h-5 text-secondary" />
                    <div>
                      <div className="font-medium">Sub Distributor</div>
                      <div className="text-sm text-base-content/60">
                        {selectedSol?.sub_distributor_ids.length || 0} available
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </form.Field>
        )}

        {/* Distributor Selection - Only show for sub distributors */}
        {solId > 0 && distributorType === 'sub' && availableDistributors.length > 0 && (
          <form.Field
            name="distributor_id"
            validators={{
              onChange: ({ value }) => (!value || value === 0 ? 'Select a distributor' : undefined),
            }}
          >
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Select Sub Distributor <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'select-error' : ''
                  }`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  <option value={0}>-- Select Sub Distributor --</option>
                  {availableDistributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <label className="label">
                    <span className="label-text-alt text-error">{field.state.meta.errors[0]}</span>
                  </label>
                )}
              </div>
            )}
          </form.Field>
        )}

        {/* Company Selection */}
        <form.Field
          name="company_id"
          validators={{
            onChange: ({ value }) => (!value || value === 0 ? 'Select a company' : undefined),
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Company <span className="text-error">*</span>
                </span>
              </label>
              {companies.length === 0 ? (
                <div className="alert alert-warning">
                  <span>No companies found. Please add a company first.</span>
                </div>
              ) : (
                <select
                  className={`select select-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'select-error' : ''
                  }`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  <option value={0}>-- Select Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">{field.state.meta.errors[0]}</span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Field */}
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
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <label className="label">
                    <span className="label-text-alt text-error">{field.state.meta.errors[0]}</span>
                  </label>
                )}
              </div>
            )}
          </form.Field>

          {/* Amount Field */}
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (value === undefined || value === null || value === 0) return 'Amount is required'
                if (Number(value) < 0) return 'Amount must be positive'
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
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="e.g., 100000"
                  min="0"
                  step="any"
                />
                {field.state.meta.errors.length > 0 && (
                  <label className="label">
                    <span className="label-text-alt text-error">{field.state.meta.errors[0]}</span>
                  </label>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Bank Details Field */}
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
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Online, Cash, Bank Name"
              />
            </div>
          )}
        </form.Field>

        {/* Note Field */}
        <form.Field name="note">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Note</span>
                <span className="label-text-alt text-base-content/60">
                  What was this sale for?
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20 w-full"
                value={field.state.value}
                onBlur={field.handleBlur}
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
