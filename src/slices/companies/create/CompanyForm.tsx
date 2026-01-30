import { useForm } from '@tanstack/react-form'
import { BaseDialog } from '@/core/components'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../shared/types'

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: CreateCompanyInput | UpdateCompanyInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
  isOpen,
}: CompanyFormProps) {
  const form = useForm({
    defaultValues: {
      name: company?.name ?? '',
      contact_email: company?.contact_email ?? '',
      contact_phone: company?.contact_phone ?? '',
      address: company?.address ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset()
    },
  })

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={company ? 'Edit Company' : 'Add New Company'}
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
                form="company-form"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : company ? (
                  'Save Changes'
                ) : (
                  'Add Company'
                )}
              </button>
            )}
          </form.Subscribe>
        </>
      }
    >
      <form
        id="company-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Company Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Company name is required'
              if (value.length < 2) {
                return 'Company name must be at least 2 characters'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Company Name <span className="text-error">*</span>
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
                placeholder="e.g., ABC Trading Company"
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

        {/* Contact Email Field */}
        <form.Field name="contact_email">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
                <span className="label-text-alt text-base-content/60">Optional</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., contact@company.com"
              />
            </div>
          )}
        </form.Field>

        {/* Contact Phone Field */}
        <form.Field name="contact_phone">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Phone</span>
                <span className="label-text-alt text-base-content/60">Optional</span>
              </label>
              <input
                type="tel"
                className="input input-bordered w-full"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., +92 300 1234567"
              />
            </div>
          )}
        </form.Field>

        {/* Address Field */}
        <form.Field name="address">
          {(field) => (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Address</span>
                <span className="label-text-alt text-base-content/60">Optional</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20 w-full"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., 123 Main Street, Peshawar"
              />
            </div>
          )}
        </form.Field>
      </form>
    </BaseDialog>
  )
}
