import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Edit,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react'
import type { Todo } from '../shared/types'

interface TodoTableProps {
  todos: Todo[]
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  onEdit: (todo: Todo) => void
}

const columnHelper = createColumnHelper<Todo>()

export default function TodoTable({
  todos,
  onDelete,
  onToggleStatus,
  onEdit,
}: TodoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () => [
      // Status column with icon
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          return (
            <div className="flex items-center gap-2">
              {status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-warning" />
              ) : (
                <Circle className="w-5 h-5 text-base-content/30" />
              )}
              <span className="capitalize">{status}</span>
            </div>
          )
        },
        filterFn: 'equals',
      }),

      // Title column
      columnHelper.accessor('title', {
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary"
              onClick={() => column.toggleSorting()}
            >
              Title
              <ArrowUpDown className="w-4 h-4" />
            </button>
          )
        },
        cell: (info) => (
          <div className="font-semibold text-base-content">
            {info.getValue()}
          </div>
        ),
      }),

      // Description column
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => {
          const desc = info.getValue()
          return (
            <div className="text-sm text-base-content/70 max-w-md truncate">
              {desc ?? '-'}
            </div>
          )
        },
      }),

      // Priority column with badge
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue()
          const badgeClass =
            priority === 'high'
              ? 'badge-error'
              : priority === 'medium'
                ? 'badge-warning'
                : 'badge-info'
          return (
            <div className={`badge ${badgeClass} badge-sm capitalize`}>
              {priority}
            </div>
          )
        },
        filterFn: 'equals',
      }),

      // Due date column
      columnHelper.accessor('due_date', {
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary"
              onClick={() => column.toggleSorting()}
            >
              Due Date
              <ArrowUpDown className="w-4 h-4" />
            </button>
          )
        },
        cell: (info) => {
          const date = info.getValue()
          if (!date) return <span className="text-base-content/50">-</span>

          const dueDate = new Date(date)
          const today = new Date()
          const isOverdue = dueDate < today

          return (
            <div className="flex items-center gap-2">
              {isOverdue && <AlertCircle className="w-4 h-4 text-error" />}
              <span className={isOverdue ? 'text-error' : ''}>
                {new Date(date).toLocaleDateString()}
              </span>
            </div>
          )
        },
      }),

      // Actions column
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const todo = row.original
          return (
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => onToggleStatus(todo.id)}
                title={
                  todo.status === 'completed'
                    ? 'Mark as pending'
                    : 'Mark as completed'
                }
              >
                {todo.status === 'completed' ? (
                  <Circle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </button>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => onEdit(todo)}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={() => onDelete(todo.id)}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        },
      }),
    ],
    [onDelete, onToggleStatus, onEdit]
  )

  const table = useReactTable({
    data: todos,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Filter by Status</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={
              (table.getColumn('status')?.getFilterValue() as string) ?? ''
            }
            onChange={(e) =>
              table
                .getColumn('status')
                ?.setFilterValue(
                  e.target.value !== '' ? e.target.value : undefined
                )
            }
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Filter by Priority</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={
              (table.getColumn('priority')?.getFilterValue() as string) ?? ''
            }
            onChange={(e) =>
              table
                .getColumn('priority')
                ?.setFilterValue(
                  e.target.value !== '' ? e.target.value : undefined
                )
            }
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table table-zebra">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <div className="text-base-content/50">
                    No todos found. Create one to get started!
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="text-sm text-base-content/70">
        Showing {table.getFilteredRowModel().rows.length} of {todos.length}{' '}
        todos
      </div>
    </div>
  )
}
