import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, Building2, Mail, Phone } from 'lucide-react'
import {
  BaseTable,
  SortableHeader,
  TableActions,
  TableActionButton,
} from '@/core/components'
import type { Company } from '../shared/types'

interface CompaniesTableProps {
  companies: Company[]
  onEdit: (item: Company) => void
  onDelete: (id: number) => void
}

export default function CompaniesTable({
  companies,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader column={column}>Company Name</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-semibold">{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'contact_email',
        header: 'Email',
        cell: (info) => {
          const email = info.getValue() as string | null
          return email ? (
            <div className="flex items-center gap-2 text-base-content/70">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          ) : (
            <span className="text-base-content/40">-</span>
          )
        },
      },
      {
        accessorKey: 'contact_phone',
        header: 'Phone',
        cell: (info) => {
          const phone = info.getValue() as string | null
          return phone ? (
            <div className="flex items-center gap-2 text-base-content/70">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          ) : (
            <span className="text-base-content/40">-</span>
          )
        },
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: (info) => {
          const address = info.getValue() as string | null
          return address ? (
            <span className="text-base-content/70 truncate max-w-[200px] block">
              {address}
            </span>
          ) : (
            <span className="text-base-content/40">-</span>
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
              <TableActionButton onClick={() => onEdit(item)} title="Edit company">
                <Edit className="w-4 h-4" />
              </TableActionButton>
              <TableActionButton
                onClick={() => onDelete(item.id)}
                title="Delete company"
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
      data={companies}
      columns={columns}
      filters={[]}
      emptyMessage="No companies yet. Click 'Add Company' to create one."
      showStats
    />
  )
}
