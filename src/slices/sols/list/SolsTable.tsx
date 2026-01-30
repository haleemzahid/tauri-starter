import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MapPin, User, Users } from 'lucide-react'
import {
  BaseTable,
  SortableHeader,
  TableActions,
  TableActionButton,
} from '@/core/components'
import type { SolWithDetails } from '../shared/types'

interface SolsTableProps {
  sols: SolWithDetails[]
  onEdit: (sol: SolWithDetails) => void
  onDelete: (id: number) => void
}

export default function SolsTable({ sols, onEdit, onDelete }: SolsTableProps) {
  const columns = useMemo<ColumnDef<SolWithDetails>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader column={column}>SOL Name</SortableHeader>
        ),
        cell: (info) => (
          <div className="font-semibold">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'city',
        header: ({ column }) => (
          <SortableHeader column={column}>City</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-base-content/50" />
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'main_distributor_name',
        header: 'Main Distributor',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="badge badge-primary badge-outline">
              {info.getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'sub_distributor_names',
        header: 'Sub Distributors',
        cell: (info) => {
          const names = info.getValue() as string[]
          if (names.length === 0) {
            return (
              <span className="text-base-content/50 text-sm">
                No sub-distributors
              </span>
            )
          }
          return (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <div className="flex flex-wrap gap-1">
                {names.slice(0, 3).map((name) => (
                  <span
                    key={name}
                    className="badge badge-secondary badge-outline badge-sm"
                  >
                    {name}
                  </span>
                ))}
                {names.length > 3 && (
                  <span className="badge badge-ghost badge-sm">
                    +{names.length - 3}
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original
          return (
            <TableActions>
              <TableActionButton onClick={() => onEdit(item)} title="Edit SOL">
                <Edit className="w-4 h-4" />
              </TableActionButton>
              <TableActionButton
                onClick={() => onDelete(item.id)}
                title="Delete SOL"
                variant="error"
              >
                <Trash2 className="w-4 h-4" />
              </TableActionButton>
            </TableActions>
          )
        },
      },
    ],
    [onEdit, onDelete]
  )

  return (
    <BaseTable
      data={sols}
      columns={columns}
      filters={[]}
      emptyMessage="No SOLs yet. Click 'Create SOL' to create one."
      showStats
    />
  )
}
