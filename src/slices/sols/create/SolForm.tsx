import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import { useListDistributors } from '@/slices/distributors'
import type { SolWithDetails, CreateSolInput, UpdateSolInput } from '../shared/types'

interface SolFormProps {
  sol?: SolWithDetails
  onSubmit: (data: CreateSolInput | UpdateSolInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export default function SolForm({ sol, onSubmit, onCancel, isOpen }: SolFormProps) {
  const { data: distributors = [] } = useListDistributors()

  const form = useForm({
    defaultValues: {
      name: sol?.name ?? '',
      city: sol?.city ?? '',
      main_distributor_id: sol?.main_distributor_id ?? 0,
      sub_distributor_ids: sol?.sub_distributor_ids ?? ([] as number[]),
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset()
    },
  })

  // Sync form when sol changes (for edit mode)
  useEffect(() => {
    if (sol) {
      form.setFieldValue('name', sol.name)
      form.setFieldValue('city', sol.city)
      form.setFieldValue('main_distributor_id', sol.main_distributor_id)
      form.setFieldValue('sub_distributor_ids', sol.sub_distributor_ids)
    } else {
      form.reset()
    }
  }, [sol])

  const toggleSubDistributor = (distributorId: number, currentIds: number[]) => {
    if (currentIds.includes(distributorId)) {
      return currentIds.filter((id) => id !== distributorId)
    }
    return [...currentIds, distributorId]
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={sol ? 'Edit SOL' : 'Create New SOL'}
      maxWidth="2xl"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                form="sol-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : sol ? (
                  'Save Changes'
                ) : (
                  'Create SOL'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="sol-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* SOL Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'SOL name is required'
              if (value.length < 2) return 'Name must be at least 2 characters'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  SOL Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${
                  field.state.meta.errors.length > 0 ? 'input-error' : ''
                }`}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Peshawar SOL"
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

        {/* City Field */}
        <form.Field
          name="city"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'City is required'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  City <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${
                  field.state.meta.errors.length > 0 ? 'input-error' : ''
                }`}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Peshawar"
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

        {/* Main Distributor Selection */}
        <form.Field
          name="main_distributor_id"
          validators={{
            onChange: ({ value }) => {
              if (!value || value === 0) return 'Please select a main distributor'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Main Distributor <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-base-content/60">
                  Primary distributor for this SOL
                </span>
              </label>
              {distributors.length === 0 ? (
                <div className="alert alert-warning">
                  <span>No distributors found. Please add distributors first.</span>
                </div>
              ) : (
                <select
                  className={`select select-bordered w-full ${
                    field.state.meta.errors.length > 0 ? 'select-error' : ''
                  }`}
                  value={field.state.value}
                  onChange={(e) => {
                    const newMainId = Number(e.target.value)
                    field.handleChange(newMainId)
                    // Remove from sub-distributors if selected as main
                    const currentSubs = form.getFieldValue('sub_distributor_ids')
                    if (currentSubs.includes(newMainId)) {
                      form.setFieldValue(
                        'sub_distributor_ids',
                        currentSubs.filter((id) => id !== newMainId)
                      )
                    }
                  }}
                >
                  <option value={0}>Select main distributor...</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.city})
                    </option>
                  ))}
                </select>
              )}
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

        {/* Sub Distributors Multi-Select */}
        <form.Subscribe selector={(state) => state.values.main_distributor_id}>
          {(mainDistributorId) => (
            <form.Field name="sub_distributor_ids">
              {(field) => {
                const availableDistributors = distributors.filter(
                  (d) => d.id !== mainDistributorId
                )

                return (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Sub Distributors</span>
                      <span className="label-text-alt text-base-content/60">
                        Optional - select additional distributors for this SOL
                      </span>
                    </label>
                    {!mainDistributorId ? (
                      <div className="alert alert-info">
                        <span>Select a main distributor first to add sub-distributors</span>
                      </div>
                    ) : availableDistributors.length === 0 ? (
                      <div className="text-base-content/60 text-sm p-3 bg-base-200 rounded-lg">
                        No other distributors available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-base-200 rounded-lg max-h-48 overflow-y-auto">
                        {availableDistributors.map((distributor) => (
                          <label
                            key={distributor.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              field.state.value.includes(distributor.id)
                                ? 'bg-secondary/10 border-2 border-secondary'
                                : 'bg-base-100 border-2 border-transparent hover:bg-base-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-secondary checkbox-sm"
                              checked={field.state.value.includes(distributor.id)}
                              onChange={() => {
                                field.handleChange(
                                  toggleSubDistributor(distributor.id, field.state.value)
                                )
                              }}
                            />
                            <div>
                              <span className="font-medium">{distributor.name}</span>
                              <span className="text-xs text-base-content/60 ml-2">
                                ({distributor.city})
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {field.state.value.length > 0 && (
                      <label className="label">
                        <span className="label-text-alt text-success">
                          {field.state.value.length} sub-distributor(s) selected
                        </span>
                      </label>
                    )}
                  </div>
                )
              }}
            </form.Field>
          )}
        </form.Subscribe>
      </form>
    </BaseDialog>
  )
}
