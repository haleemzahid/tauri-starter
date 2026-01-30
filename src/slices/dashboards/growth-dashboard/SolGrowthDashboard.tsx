import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PeriodSelector, formatPeriod } from '../components/PeriodSelector'
import { useSolGrowth } from './useSolGrowth'
import { useListSols } from '@/slices/sols'
import type { Period } from '../shared/types'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getGrowthIcon(percentage: number) {
  if (percentage > 0) return <TrendingUp className="w-4 h-4 text-success" />
  if (percentage < 0) return <TrendingDown className="w-4 h-4 text-error" />
  return <Minus className="w-4 h-4 text-base-content/50" />
}

function getGrowthColor(percentage: number) {
  if (percentage > 0) return 'text-success'
  if (percentage < 0) return 'text-error'
  return 'text-base-content/50'
}

export default function SolGrowthDashboard() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { solId?: string }
  const solId = params.solId ? Number(params.solId) : null

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const [period1, setPeriod1] = useState<Period>({
    type: 'monthly',
    year: currentMonth === 1 ? currentYear - 1 : currentYear,
    month: currentMonth === 1 ? 12 : currentMonth - 1,
  })
  const [period2, setPeriod2] = useState<Period>({
    type: 'monthly',
    year: currentYear,
    month: currentMonth,
  })

  const { data: sols = [] } = useListSols()
  const { data, isLoading, error } = useSolGrowth(solId, period1, period2)

  const handleSolChange = (newSolId: number) => {
    void navigate({ to: '/dashboard/growth/$solId', params: { solId: String(newSolId) } })
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading growth data: {error.message}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            SOL Growth Comparison
          </h1>
          <p className="text-base-content/60 mt-1">
            Compare performance across different periods for a specific SOL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      {!solId && (
        <div className="card bg-base-200 p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold">Select a SOL</h3>
          <p className="text-base-content/60">
            Choose a SOL from the dropdown to view growth comparison
          </p>
        </div>
      )}

      {solId && (
        <>
          {/* Period Selectors */}
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Period 1 (Previous)</span>
                  </label>
                  <PeriodSelector value={period1} onChange={setPeriod1} />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Period 2 (Current)</span>
                  </label>
                  <PeriodSelector value={period2} onChange={setPeriod2} />
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {data && (
            <>
              {/* Summary Card */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h2 className="card-title">{data.sol.name}</h2>
                  <p className="text-base-content/60">{data.sol.city}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">{formatPeriod(period1)}</div>
                      <div className="stat-value text-lg">{formatAmount(data.period1_total)}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">{formatPeriod(period2)}</div>
                      <div className="stat-value text-lg">{formatAmount(data.period2_total)}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">Growth Amount</div>
                      <div className={`stat-value text-lg ${getGrowthColor(data.growth_amount)}`}>
                        {data.growth_amount >= 0 ? '+' : ''}
                        {formatAmount(data.growth_amount)}
                      </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">Growth %</div>
                      <div className={`stat-value text-lg flex items-center gap-2 ${getGrowthColor(data.growth_percentage)}`}>
                        {getGrowthIcon(data.growth_percentage)}
                        {data.growth_percentage >= 0 ? '+' : ''}
                        {data.growth_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Companies Table */}
              {data.companies.length > 0 && (
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">By Company</h3>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th className="text-right">{formatPeriod(period1)}</th>
                            <th className="text-right">{formatPeriod(period2)}</th>
                            <th className="text-right">Growth</th>
                            <th className="text-right">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.companies.map((company) => (
                            <tr key={company.company_id}>
                              <td className="font-semibold">{company.company_name}</td>
                              <td className="text-right">{formatAmount(company.period1_amount)}</td>
                              <td className="text-right">{formatAmount(company.period2_amount)}</td>
                              <td className={`text-right ${getGrowthColor(company.growth_amount)}`}>
                                {company.growth_amount >= 0 ? '+' : ''}
                                {formatAmount(company.growth_amount)}
                              </td>
                              <td className={`text-right ${getGrowthColor(company.growth_percentage)}`}>
                                <div className="flex items-center justify-end gap-1">
                                  {getGrowthIcon(company.growth_percentage)}
                                  {company.growth_percentage >= 0 ? '+' : ''}
                                  {company.growth_percentage}%
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
