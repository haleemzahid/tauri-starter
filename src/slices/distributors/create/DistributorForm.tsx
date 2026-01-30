import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import { useListCompanies } from '@/slices/companies'
import type { DistributorWithCompanies, CreateDistributorInput, UpdateDistributorInput } from '../shared/types'

interface DistributorFormProps {
  distributor?: DistributorWithCompanies
  onSubmit: (data: CreateDistributorInput | UpdateDistributorInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export default function DistributorForm({
  distributor,
  onSubmit,
  onCancel,
  isOpen,
}: DistributorFormProps) {
  const { data: companies = [] } = useListCompanies()

  const form = useForm({
    defaultValues: {
      name: distributor?.name ?? '',
      city: distributor?.city ?? '',
      company_ids: distributor?.company_ids ?? ([] as number[]),
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset()
    },
  })

  const toggleCompany = (companyId: number, currentIds: number[]) => {
    if (currentIds.includes(companyId)) {
      return currentIds.filter(id => id !== companyId)
    }
    return [...currentIds, companyId]
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={distributor ? 'Edit Distributor' : 'Add New Distributor'}
      maxWidth="xl"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                form="distributor-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : distributor ? (
                  'Save Changes'
                ) : (
                  'Add Distributor'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="distributor-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Distributor Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Distributor name is required'
              if (value.length < 2) {
                return 'Name must be at least 2 characters'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Distributor Name <span className="text-error">*</span>
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
                placeholder="e.g., Al Syed Trader"
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
                placeholder="e.g., Peshawar, Bannu, Kohat"
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

        {/* Companies Multi-Select */}
        <form.Field
          name="company_ids"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.length === 0) {
                return 'Select at least one company'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Companies <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-base-content/60">
                  Select the companies this distributor works with
                </span>
              </label>
              {companies.length === 0 ? (
                <div className="alert alert-warning">
                  <span>No companies found. Please add a company first.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-base-200 rounded-lg max-h-48 overflow-y-auto">
                  {companies.map((company) => (
                    <label
                      key={company.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        field.state.value.includes(company.id)
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-base-100 border-2 border-transparent hover:bg-base-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={field.state.value.includes(company.id)}
                        onChange={() => {
                          field.handleChange(toggleCompany(company.id, field.state.value))
                        }}
                      />
                      <span className="font-medium">{company.name}</span>
                    </label>
                  ))}
                </div>
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
      </form>
    </BaseDialog>
  )
}
