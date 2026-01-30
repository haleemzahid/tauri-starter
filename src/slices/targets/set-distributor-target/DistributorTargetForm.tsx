import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import { useListDistributors } from '@/slices/distributors'
import { MONTH_NAMES, type SetDistributorTargetInput, type DistributorTargetWithDetails } from '../shared/types'

interface DistributorTargetFormProps {
  onSubmit: (data: SetDistributorTargetInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  initialData?: DistributorTargetWithDetails | null
}

export default function DistributorTargetForm({
  onSubmit,
  onCancel,
  isOpen,
  initialData,
}: DistributorTargetFormProps) {
  const { data: distributors = [] } = useListDistributors()
  const currentDate = new Date()
  const [selectedDistributorId, setSelectedDistributorId] = useState(initialData?.distributor_id ?? 0)
  const isEditMode = !!initialData

  const form = useForm({
    defaultValues: {
      distributor_id: initialData?.distributor_id ?? 0 as number,
      company_id: initialData?.company_id ?? 0 as number,
      year: initialData?.year ?? currentDate.getFullYear(),
      month: initialData?.month ?? currentDate.getMonth() + 1,
      target_amount: initialData?.target_amount ?? 0 as number,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        target_amount: Number(value.target_amount),
      })
      form.reset()
      setSelectedDistributorId(0)
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.setFieldValue('distributor_id', initialData.distributor_id)
      form.setFieldValue('company_id', initialData.company_id)
      form.setFieldValue('year', initialData.year)
      form.setFieldValue('month', initialData.month)
      form.setFieldValue('target_amount', initialData.target_amount)
      setSelectedDistributorId(initialData.distributor_id)
    } else {
      form.reset()
      setSelectedDistributorId(0)
    }
  }, [initialData, form])

  const selectedDistributor = distributors.find(d => d.id === selectedDistributorId)
  const availableCompanies = selectedDistributor
    ? selectedDistributor.company_ids.map((id, idx) => ({
        id,
        name: selectedDistributor.company_names[idx],
      }))
    : []

  useEffect(() => {
    if (selectedDistributorId && availableCompanies.length > 0) {
      const currentCompanyId = form.getFieldValue('company_id')
      const isValidCompany = availableCompanies.some(c => c.id === currentCompanyId)
      if (!isValidCompany) {
        form.setFieldValue('company_id', availableCompanies[0].id)
      }
    }
  }, [selectedDistributorId, availableCompanies, form])

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i)

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? 'Edit Distributor Target' : 'Set Distributor Target'}
      maxWidth="lg"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                form="distributor-target-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? <span className="loading loading-spinner"></span> : isEditMode ? 'Update Target' : 'Set Target'}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="distributor-target-form"
        onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}
        className="space-y-4"
      >
        {/* Distributor */}
        <form.Field
          name="distributor_id"
          validators={{ onChange: ({ value }) => value === 0 ? 'Select a distributor' : undefined }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Distributor <span className="text-error">*</span></span>
              </label>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  field.handleChange(val)
                  setSelectedDistributorId(val)
                }}
              >
                <option value={0}>-- Select Distributor --</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {/* Company */}
        <form.Field
          name="company_id"
          validators={{ onChange: ({ value }) => value === 0 ? 'Select a company' : undefined }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Company <span className="text-error">*</span></span>
              </label>
              {selectedDistributorId === 0 ? (
                <div className="alert alert-info py-2"><span>Select a distributor first</span></div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  <option value={0}>-- Select Company --</option>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          {/* Month */}
          <form.Field name="month">
            {(field) => (
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Month</span></label>
                <select
                  className="select select-bordered w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Year */}
          <form.Field name="year">
            {(field) => (
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Year</span></label>
                <select
                  className="select select-bordered w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Target Amount */}
        <form.Field
          name="target_amount"
          validators={{ onChange: ({ value }) => Number(value) <= 0 ? 'Enter a valid amount' : undefined }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Target Amount (PKR) <span className="text-error">*</span></span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="e.g., 1000000"
                min="0"
                step="any"
              />
            </div>
          )}
        </form.Field>
      </form>
    </BaseDialog>
  )
}
