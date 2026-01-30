import { useEffect, useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import { useListSols } from '@/slices/sols'
import { useListCompanies } from '@/slices/companies'
import { MONTH_NAMES, type SetSolTargetInput, type SolTargetWithDetails } from '../shared/types'

interface SolTargetFormProps {
  onSubmit: (data: SetSolTargetInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  initialData?: SolTargetWithDetails | null
}

export default function SolTargetForm({
  onSubmit,
  onCancel,
  isOpen,
  initialData,
}: SolTargetFormProps) {
  const { data: sols = [] } = useListSols()
  const { data: companies = [] } = useListCompanies()
  const currentDate = new Date()
  const isEditMode = !!initialData

  const form = useForm({
    defaultValues: {
      sol_id: initialData?.sol_id ?? 0,
      company_id: initialData?.company_id ?? 0,
      year: initialData?.year ?? currentDate.getFullYear(),
      month: initialData?.month ?? currentDate.getMonth() + 1,
      total_target: initialData?.total_target ?? 0,
      main_target: initialData?.main_target ?? 0,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        total_target: Number(value.total_target),
        main_target: Number(value.main_target),
      })
      form.reset()
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.setFieldValue('sol_id', initialData.sol_id)
      form.setFieldValue('company_id', initialData.company_id)
      form.setFieldValue('year', initialData.year)
      form.setFieldValue('month', initialData.month)
      form.setFieldValue('total_target', initialData.total_target)
      form.setFieldValue('main_target', initialData.main_target)
    } else {
      form.reset()
    }
  }, [initialData, form])

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i)

  // Calculate sub target display
  const [totalTarget, mainTarget] = [
    form.useStore((s) => s.values.total_target),
    form.useStore((s) => s.values.main_target),
  ]
  const subTarget = Math.max(0, Number(totalTarget) - Number(mainTarget))

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? 'Edit SOL Target' : 'Set SOL Target'}
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
                form="sol-target-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : isEditMode ? (
                  'Update Target'
                ) : (
                  'Set Target'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="sol-target-form"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* SOL Selection */}
        <form.Field
          name="sol_id"
          validators={{
            onChange: ({ value }) => (value === 0 ? 'Select a SOL' : undefined),
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  SOL <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              >
                <option value={0}>-- Select SOL --</option>
                {sols.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city}) - Main: {s.main_distributor_name}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {field.state.meta.errors[0]}
                  </span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        {/* Company Selection */}
        <form.Field
          name="company_id"
          validators={{
            onChange: ({ value }) => (value === 0 ? 'Select a company' : undefined),
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Company <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              >
                <option value={0}>-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {field.state.meta.errors[0]}
                  </span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          {/* Month */}
          <form.Field name="month">
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Month</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Year */}
          <form.Field name="year">
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Year</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Total Target */}
        <form.Field
          name="total_target"
          validators={{
            onChange: ({ value }) =>
              Number(value) <= 0 ? 'Enter a valid total target' : undefined,
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Total SOL Target (PKR) <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-base-content/60">
                  Overall target for this SOL
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="e.g., 5000000"
                min="0"
                step="any"
              />
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {field.state.meta.errors[0]}
                  </span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        {/* Main Distributor Target */}
        <form.Field
          name="main_target"
          validators={{
            onChange: ({ value, fieldApi }) => {
              const total = fieldApi.form.getFieldValue('total_target')
              if (Number(value) < 0) return 'Target cannot be negative'
              if (Number(value) > Number(total))
                return 'Main target cannot exceed total target'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Main Distributor Target (PKR) <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-base-content/60">
                  Target for the main distributor
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="e.g., 3000000"
                min="0"
                step="any"
              />
              {field.state.meta.errors.length > 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {field.state.meta.errors[0]}
                  </span>
                </label>
              )}
            </div>
          )}
        </form.Field>

        {/* Sub Distributors Target (calculated) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Sub Distributors Target (PKR)</span>
            <span className="label-text-alt text-base-content/60">
              Auto-calculated: Total - Main
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full bg-base-200"
            value={subTarget.toLocaleString()}
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-info">
              This will be shared among all sub-distributors
            </span>
          </label>
        </div>
      </form>
    </BaseDialog>
  )
}
