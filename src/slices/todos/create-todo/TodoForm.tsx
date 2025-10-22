import { useForm } from '@tanstack/react-form'
import { X } from 'lucide-react'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../shared/types'

interface TodoFormProps {
  todo?: Todo
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export default function TodoForm({
  todo,
  onSubmit,
  onCancel,
  isOpen,
}: TodoFormProps) {
  const form = useForm({
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      status: todo?.status ?? ('pending' as const),
      priority: todo?.priority ?? ('medium' as const),
      due_date: todo?.due_date ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset()
    },
  })

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {todo ? 'Edit Todo' : 'Create New Todo'}
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onCancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {/* Title Field */}
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Title is required'
                if (value.length < 3) {
                  return 'Title must be at least 3 characters'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Title <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${
                    field.state.meta.errors.length > 0 ? 'input-error' : ''
                  }`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter todo title"
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

          {/* Description Field */}
          <form.Field name="description">
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter todo description (optional)"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Field */}
            <form.Field name="status">
              {(field) => (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as
                          | 'pending'
                          | 'in-progress'
                          | 'completed'
                      )
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </form.Field>

            {/* Priority Field */}
            <form.Field name="priority">
              {(field) => (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Priority</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as 'low' | 'medium' | 'high'
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          {/* Due Date Field */}
          <form.Field name="due_date">
            {(field) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Due Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* Form Actions */}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : todo ? (
                    'Update Todo'
                  ) : (
                    'Create Todo'
                  )}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onCancel}></div>
    </div>
  )
}
