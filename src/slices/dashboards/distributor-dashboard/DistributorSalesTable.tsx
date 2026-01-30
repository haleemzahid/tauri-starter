import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { DistributorDashboardSale } from '../shared/types'

interface DistributorSalesTableProps {
  sales: DistributorDashboardSale[]
  total: number
  onEdit?: (sale: DistributorDashboardSale) => void
  onDelete?: (saleId: number) => Promise<void>
  isDeleting?: boolean
}

export function DistributorSalesTable({
  sales,
  total,
  onEdit,
  onDelete,
  isDeleting = false,
}: DistributorSalesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK').format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleDelete = useCallback(async (saleId: number) => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this sale?')) return

    setDeletingId(saleId)
    try {
      await onDelete(saleId)
    } finally {
      setDeletingId(null)
    }
  }, [onDelete])

  const showActions = onEdit || onDelete

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th className="w-16">Sr No</th>
            <th>Date</th>
            <th>Note</th>
            <th>Bank Details</th>
            <th className="text-right">Amount</th>
            {showActions && <th className="w-24">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 6 : 5} className="text-center text-base-content/60">
                No sales for this period
              </td>
            </tr>
          ) : (
            sales.map((sale, idx) => (
              <tr key={sale.id}>
                <td>{idx + 1}</td>
                <td>{formatDate(sale.date)}</td>
                <td className="max-w-xs truncate">{sale.note || '-'}</td>
                <td>{sale.bank_details || '-'}</td>
                <td className="text-right font-mono">{formatAmount(sale.amount)}</td>
                {showActions && (
                  <td>
                    <div className="flex gap-1 justify-end">
                      {onEdit && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => onEdit(sale)}
                          title="Edit sale"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square text-error"
                          onClick={() => void handleDelete(sale.id)}
                          disabled={isDeleting || deletingId === sale.id}
                          title="Delete sale"
                        >
                          {deletingId === sale.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="font-bold text-base">
            <td colSpan={showActions ? 5 : 4} className="text-right">
              Total:
            </td>
            <td className={`text-right font-mono ${showActions ? '' : ''}`}>
              {formatAmount(total)}
            </td>
            {showActions && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
