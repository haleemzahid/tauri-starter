import { useState, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { Building2, TrendingUp, Target, User, Users, Calendar, Banknote } from 'lucide-react'
import { MonthYearPicker } from '../components/MonthYearPicker'
import { useSolDashboard } from './useSolDashboard'
import { useListSols } from '@/slices/sols'
import type { SolDashboardSale } from '../shared/types'

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

export default function SolDashboard() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/dashboard/sol/$solId' })
  const solId = (search as { solId?: string }).solId
    ? Number((search as { solId?: string }).solId)
    : null

  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [isAnnual, setIsAnnual] = useState(false)

  const { data: sols = [] } = useListSols()
  const { data, isLoading, error } = useSolDashboard(solId, year, month, isAnnual)

  const handleSolChange = (newSolId: number) => {
    void navigate({ to: '/dashboard/sol/$solId', params: { solId: String(newSolId) } })
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading SOL dashboard: {error.message}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            SOL Dashboard
          </h1>
          <p className="text-base-content/60 mt-1">
            View sales performance for a specific SOL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SOL Selector */}
          <select
            className="select select-bordered"
            value={solId ?? ''}
            onChange={(e) => handleSolChange(Number(e.target.value))}
          >
            <option value="">Select SOL...</option>
            {sols.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city})
              </option>
            ))}
          </select>

          <MonthYearPicker
            year={year}
            month={month}
            isAnnual={isAnnual}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onAnnualChange={setIsAnnual}
          />
        </div>
      </div>

      {!solId && (
        <div className="card bg-base-200 p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold">Select a SOL</h3>
          <p className="text-base-content/60">Choose a SOL from the dropdown to view its dashboard</p>
        </div>
      )}

      {solId && isLoading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {data && (
        <>
          {/* SOL Info Card */}
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="card-title text-xl">{data.sol.name}</h2>
                  <p className="text-base-content/60">{data.sol.city}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm">Main: {data.sol.main_distributor_name}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Total Sales</div>
                    <div className="stat-value text-success text-lg">
                      {formatAmount(data.overall_total)}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Main Distributor</div>
                    <div className="stat-value text-primary text-lg">
                      {formatAmount(data.overall_main_total)}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Sub Distributors</div>
                    <div className="stat-value text-secondary text-lg">
                      {formatAmount(data.overall_sub_total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          {data.companies.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">
                No sales or targets found for {isAnnual ? year : `${month}/${year}`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.companies.map((company) => (
                <div key={company.company_id} className="card bg-base-200">
                  <div className="card-body">
                    {/* Company Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold">{company.company_name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.target > 0 && (
                          <div className="badge badge-outline gap-1">
                            <Target className="w-3 h-3" />
                            Target: {formatAmount(company.target)}
                          </div>
                        )}
                        <div className="badge badge-success gap-1">
                          {company.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Total Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total</span>
                          <span className="font-semibold">{formatAmount(company.total)}</span>
                        </div>
                        <progress
                          className="progress progress-success w-full"
                          value={company.percentage}
                          max="100"
                        ></progress>
                      </div>
                      {/* Main Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> Main
                          </span>
                          <span className="font-semibold">{formatAmount(company.main_total)}</span>
                        </div>
                        <progress
                          className="progress progress-primary w-full"
                          value={company.main_percentage}
                          max="100"
                        ></progress>
                      </div>
                      {/* Sub Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> Sub
                          </span>
                          <span className="font-semibold">{formatAmount(company.sub_total)}</span>
                        </div>
                        <progress
                          className="progress progress-secondary w-full"
                          value={company.sub_percentage}
                          max="100"
                        ></progress>
                      </div>
                    </div>

                    {/* Sales Table */}
                    {company.sales.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Distributor</th>
                              <th>Type</th>
                              <th>Note</th>
                              <th>Bank</th>
                              <th className="text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {company.sales.map((sale) => (
                              <tr key={sale.id}>
                                <td>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-base-content/50" />
                                    {formatDate(sale.date)}
                                  </div>
                                </td>
                                <td>{sale.distributor_name}</td>
                                <td>
                                  <span
                                    className={`badge badge-sm ${
                                      sale.distributor_type === 'main'
                                        ? 'badge-primary'
                                        : 'badge-secondary'
                                    }`}
                                  >
                                    {sale.distributor_type === 'main' ? 'Main' : 'Sub'}
                                  </span>
                                </td>
                                <td className="text-base-content/60">
                                  {sale.note || '-'}
                                </td>
                                <td>
                                  {sale.bank_details ? (
                                    <span className="badge badge-outline badge-xs">
                                      {sale.bank_details}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="text-right font-semibold text-success">
                                  {formatAmount(sale.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
