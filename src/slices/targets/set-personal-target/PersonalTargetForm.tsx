import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import { MONTH_NAMES, type SetPersonalTargetInput, type PersonalTarget } from '../shared/types'

interface PersonalTargetFormProps {
  onSubmit: (data: SetPersonalTargetInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  initialData?: PersonalTarget | null
}

export default function PersonalTargetForm({
  onSubmit,
  onCancel,
  isOpen,
  initialData,
}: PersonalTargetFormProps) {
  const currentDate = new Date()
  const isEditMode = !!initialData

  const form = useForm({
    defaultValues: {
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
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.setFieldValue('year', initialData.year)
      form.setFieldValue('month', initialData.month)
      form.setFieldValue('target_amount', initialData.target_amount)
    } else {
      form.reset()
    }
  }, [initialData, form])

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i)

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? 'Edit My Monthly Target' : 'Set My Monthly Target'}
      maxWidth="md"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                form="personal-target-form"
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
        id="personal-target-form"
        onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}
        className="space-y-4"
      >
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
                <span className="label-text-alt text-base-content/60">Your total target for all distributors</span>
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
            </div>
          )}
        </form.Field>
      </form>
    </BaseDialog>
  )
}
