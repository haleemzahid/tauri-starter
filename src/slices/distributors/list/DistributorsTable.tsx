import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, User, MapPin, Building2 } from 'lucide-react'
import {
  BaseTable,
  SortableHeader,
  TableActions,
  TableActionButton,
} from '@/core/components'
import type { DistributorWithCompanies } from '../shared/types'

interface DistributorsTableProps {
  distributors: DistributorWithCompanies[]
  onEdit: (item: DistributorWithCompanies) => void
  onDelete: (id: number) => void
}

export default function DistributorsTable({
  distributors,
  onEdit,
  onDelete,
}: DistributorsTableProps) {
  const columns = useMemo<ColumnDef<DistributorWithCompanies>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader column={column}>Distributor Name</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold">{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: ({ column }) => (
          <SortableHeader column={column}>City</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2 text-base-content/70">
            <MapPin className="w-4 h-4" />
            <span>{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'company_names',
        header: 'Companies',
        cell: (info) => {
          const companies = info.getValue() as string[]
          if (!companies || companies.length === 0) {
            return <span className="text-base-content/40">No companies</span>
          }
          return (
            <div className="flex flex-wrap gap-1">
              {companies.map((name, idx) => (
                <span
                  key={idx}
                  className="badge badge-sm badge-outline gap-1"
                >
                  <Building2 className="w-3 h-3" />
                  {name}
                </span>
              ))}
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
              <TableActionButton onClick={() => onEdit(item)} title="Edit distributor">
                <Edit className="w-4 h-4" />
              </TableActionButton>
              <TableActionButton
                onClick={() => onDelete(item.id)}
                title="Delete distributor"
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
      data={distributors}
      columns={columns}
      filters={[]}
      emptyMessage="No distributors yet. Click 'Add Distributor' to create one."
      showStats
    />
  )
}
