import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, User, Users, Building2, Calendar, Banknote } from 'lucide-react'
import {
  BaseTable,
  SortableHeader,
  TableActions,
  TableActionButton,
} from '@/core/components'
import type { SaleWithDetails } from '../shared/types'

interface SalesTableProps {
  sales: SaleWithDetails[]
  onEdit: (item: SaleWithDetails) => void
  onDelete: (id: number) => void
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SalesTable({
  sales,
  onEdit,
  onDelete,
}: SalesTableProps) {
  const columns = useMemo<ColumnDef<SaleWithDetails>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <SortableHeader column={column}>Date</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2 text-base-content/70">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(info.getValue() as string)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'sol_name',
        header: ({ column }) => (
          <SortableHeader column={column}>SOL</SortableHeader>
        ),
        cell: (info) => {
          const row = info.row.original
          return (
            <div>
              <span className="font-semibold">{row.sol_name}</span>
              <span className="text-base-content/50 text-sm ml-1">({row.sol_city})</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'distributor_name',
        header: ({ column }) => (
          <SortableHeader column={column}>Distributor</SortableHeader>
        ),
        cell: (info) => {
          const row = info.row.original
          const isMain = row.distributor_type === 'main'
          return (
            <div className="flex items-center gap-2">
              {isMain ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Users className="w-4 h-4 text-secondary" />
              )}
              <div>
                <span className="font-semibold">{row.distributor_name}</span>
                <span
                  className={`badge badge-sm ml-2 ${
                    isMain ? 'badge-primary' : 'badge-secondary'
                  }`}
                >
                  {isMain ? 'Main' : 'Sub'}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'company_name',
        header: ({ column }) => (
          <SortableHeader column={column}>Company</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-secondary" />
            <span>{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'note',
        header: 'Note',
        cell: (info) => {
          const note = info.getValue() as string | null
          return note ? (
            <span className="text-base-content/70 truncate max-w-[150px] block">
              {note}
            </span>
          ) : (
            <span className="text-base-content/40">-</span>
          )
        },
      },
      {
        accessorKey: 'bank_details',
        header: 'Bank',
        cell: (info) => {
          const bank = info.getValue() as string | null
          return bank ? (
            <span className="badge badge-outline badge-sm">{bank}</span>
          ) : (
            <span className="text-base-content/40">-</span>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <SortableHeader column={column}>Amount</SortableHeader>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-success" />
            <span className="font-bold text-success">
              {formatAmount(info.getValue() as number)}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original
          return (
            <TableActions>
              <TableActionButton onClick={() => onEdit(item)} title="Edit sale">
                <Edit className="w-4 h-4" />
              </TableActionButton>
              <TableActionButton
                onClick={() => onDelete(item.id)}
                title="Delete sale"
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

  // Calculate totals
  const totalAmount = sales.reduce((sum, s) => sum + s.amount, 0)
  const mainSales = sales.filter((s) => s.distributor_type === 'main')
  const subSales = sales.filter((s) => s.distributor_type === 'sub')
  const mainTotal = mainSales.reduce((sum, s) => sum + s.amount, 0)
  const subTotal = subSales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="space-y-4">
      <BaseTable
        data={sales}
        columns={columns}
        filters={[]}
        emptyMessage="No sales recorded yet. Click 'Add Sale' to record your first sale."
        showStats
      />

      {sales.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-end">
          <div className="stat bg-primary/10 rounded-lg">
            <div className="stat-title">Main Distributor</div>
            <div className="stat-value text-primary text-lg">{formatAmount(mainTotal)}</div>
            <div className="stat-desc">{mainSales.length} sales</div>
          </div>
          <div className="stat bg-secondary/10 rounded-lg">
            <div className="stat-title">Sub Distributors</div>
            <div className="stat-value text-secondary text-lg">{formatAmount(subTotal)}</div>
            <div className="stat-desc">{subSales.length} sales</div>
          </div>
          <div className="stat bg-success/10 rounded-lg">
            <div className="stat-title">Total Sales</div>
            <div className="stat-value text-success text-lg">{formatAmount(totalAmount)}</div>
            <div className="stat-desc">{sales.length} sales</div>
          </div>
        </div>
      )}
    </div>
  )
}
