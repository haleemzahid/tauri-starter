import { useState } from 'react'
import { Plus, ListTodo } from 'lucide-react'
import TodoTable from './TodoTable'
import TodoForm from '../create-todo/TodoForm'
import { useListTodos } from './useListTodos'
import { useCreateTodo } from '../create-todo/useCreateTodo'
import { useUpdateTodo } from '../update-todo/useUpdateTodo'
import { useDeleteTodo } from '../delete-todo/useDeleteTodo'
import { useToggleTodoStatus } from '../toggle-todo-status/useToggleTodoStatus'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../shared/types'

export default function ListTodos() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined)

  // Queries and mutations
  const { data: todos = [], isLoading, error } = useListTodos()
  const createMutation = useCreateTodo()
  const updateMutation = useUpdateTodo()
  const deleteMutation = useDeleteTodo()
  const toggleStatusMutation = useToggleTodoStatus()

  const handleSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (editingTodo) {
      await updateMutation.mutateAsync({ id: editingTodo.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateTodoInput)
    }
    setIsFormOpen(false)
    setEditingTodo(undefined)
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      void deleteMutation.mutate(id)
    }
  }

  const handleToggleStatus = (id: number) => {
    void toggleStatusMutation.mutate(id)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingTodo(undefined)
  }

  const handleCreateNew = () => {
    setEditingTodo(undefined)
    setIsFormOpen(true)
  }

  // Stats calculation
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.status === 'completed').length,
    inProgress: todos.filter((t) => t.status === 'in-progress').length,
    pending: todos.filter((t) => t.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-base-content">Todos</h1>
          <p className="text-base-content/70 mt-2">
            Manage your tasks with TanStack Router, Form, and Table
          </p>
        </div>
        <button className="btn btn-primary gap-2" onClick={handleCreateNew}>
          <Plus className="w-5 h-5" />
          New Todo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <ListTodo className="w-8 h-8" />
          </div>
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{stats.total}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-base-content">{stats.pending}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-warning">{stats.inProgress}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">{stats.completed}</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <span>Error loading todos: {error.toString()}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <TodoTable
          todos={todos}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
        />
      )}

      {/* Todo Form Modal */}
      <TodoForm
        todo={editingTodo}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  )
}
