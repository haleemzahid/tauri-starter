import { User, Users } from 'lucide-react'
import type { MyDashboardRow } from '../shared/types'

interface MyDashboardTableProps {
  rows: MyDashboardRow[]
  total: number
  onSolClick: (solId: number) => void
}

export function MyDashboardTable({ rows, total, onSolClick }: MyDashboardTableProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK').format(amount)
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th className="w-16">Sr No</th>
            <th>SOL Name</th>
            <th>City</th>
            <th>Main Distributor</th>
            <th className="text-right">
              <span className="flex items-center justify-end gap-1">
                <User className="w-4 h-4 text-primary" />
                Main
              </span>
            </th>
            <th className="text-right">
              <span className="flex items-center justify-end gap-1">
                <Users className="w-4 h-4 text-secondary" />
                Sub
              </span>
            </th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-base-content/60">
                No data for this period
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.sol_id}
                className="cursor-pointer hover:bg-base-200"
                onClick={() => onSolClick(row.sol_id)}
              >
                <td>{idx + 1}</td>
                <td className="font-medium">{row.sol_name}</td>
                <td>{row.city}</td>
                <td className="text-base-content/70">{row.main_distributor_name}</td>
                <td className="text-right font-mono text-primary">
                  {formatAmount(row.main_amount)}
                </td>
                <td className="text-right font-mono text-secondary">
                  {formatAmount(row.sub_amount)}
                </td>
                <td className="text-right font-mono font-semibold">
                  {formatAmount(row.total_amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="font-bold text-base">
            <td colSpan={4} className="text-right">
              Total:
            </td>
            <td className="text-right font-mono text-primary">
              {formatAmount(rows.reduce((sum, r) => sum + r.main_amount, 0))}
            </td>
            <td className="text-right font-mono text-secondary">
              {formatAmount(rows.reduce((sum, r) => sum + r.sub_amount, 0))}
            </td>
            <td className="text-right font-mono">{formatAmount(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
