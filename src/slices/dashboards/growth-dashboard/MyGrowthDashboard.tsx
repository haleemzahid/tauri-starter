import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Minus, Download, ChevronRight } from 'lucide-react'
import { useMyGrowth } from './useMyGrowth'
import { exportMyGrowthToPDF } from '../shared/export-utils'
import type { Period } from '../shared/types'

type ComparisonPreset = 'last-month' | 'last-year' | 'last-quarter'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getPresetPeriods(preset: ComparisonPreset): { period1: Period; period2: Period } {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  switch (preset) {
    case 'last-month': {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
      return {
        period1: { type: 'monthly', year: prevYear, month: prevMonth },
        period2: { type: 'monthly', year: currentYear, month: currentMonth },
      }
    }
    case 'last-year': {
      return {
        period1: { type: 'monthly', year: currentYear - 1, month: currentMonth },
        period2: { type: 'monthly', year: currentYear, month: currentMonth },
      }
    }
    case 'last-quarter': {
      const currentQuarter = Math.ceil(currentMonth / 3)
      const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1
      const prevYear = currentQuarter === 1 ? currentYear - 1 : currentYear
      return {
        period1: { type: 'quarterly', year: prevYear, quarter: prevQuarter },
        period2: { type: 'quarterly', year: currentYear, quarter: currentQuarter },
      }
    }
  }
}

function formatPeriodSimple(period: Period): string {
  if (period.type === 'quarterly') {
    return `Q${period.quarter} ${period.year}`
  }
  return `${MONTH_NAMES[(period.month || 1) - 1]} ${period.year}`
}

export default function MyGrowthDashboard() {
  const navigate = useNavigate()
  const [preset, setPreset] = useState<ComparisonPreset>('last-month')

  const { period1, period2 } = getPresetPeriods(preset)
  const { data, isLoading, error } = useMyGrowth(period1, period2)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK').format(amount)
  }

  const handleExportPDF = async () => {
    if (data) {
      await exportMyGrowthToPDF(data)
    }
  }

  const handleSolClick = (solId: number) => {
    navigate({
      to: '/dashboard/growth/$solId',
      params: { solId: String(solId) },
    })
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Unable to load data. Please try again.</span>
        </div>
      </div>
    )
  }

  const growthIsPositive = (data?.growth_percentage ?? 0) > 0
  const growthIsNegative = (data?.growth_percentage ?? 0) < 0

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Growth</h1>
          <p className="text-base-content/60 mt-1">See how your sales are growing</p>
        </div>
        <button
          className="btn btn-outline btn-sm gap-2"
          onClick={handleExportPDF}
          disabled={!data || data.rows.length === 0}
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Quick Compare Buttons */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <p className="text-sm font-medium text-base-content/70 mb-3">Compare:</p>
          <div className="flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${preset === 'last-month' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPreset('last-month')}
            >
              This Month vs Last Month
            </button>
            <button
              className={`btn btn-sm ${preset === 'last-year' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPreset('last-year')}
            >
              This Month vs Last Year
            </button>
            <button
              className={`btn btn-sm ${preset === 'last-quarter' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPreset('last-quarter')}
            >
              This Quarter vs Last Quarter
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : data ? (
        <>
          {/* Summary Card */}
          <div className={`card shadow-sm border-2 ${
            growthIsPositive ? 'bg-success/10 border-success/30' :
            growthIsNegative ? 'bg-error/10 border-error/30' :
            'bg-base-200 border-base-300'
          }`}>
            <div className="card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-base-content/60">
                    {formatPeriodSimple(period1)} → {formatPeriodSimple(period2)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-3xl font-bold">
                      {formatAmount(data.period1_total)}
                    </span>
                    <span className="text-2xl text-base-content/40">→</span>
                    <span className="text-3xl font-bold">
                      {formatAmount(data.period2_total)}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  growthIsPositive ? 'bg-success/20 text-success' :
                  growthIsNegative ? 'bg-error/20 text-error' :
                  'bg-base-300 text-base-content/60'
                }`}>
                  {growthIsPositive ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : growthIsNegative ? (
                    <TrendingDown className="h-6 w-6" />
                  ) : (
                    <Minus className="h-6 w-6" />
                  )}
                  <span className="text-2xl font-bold">
                    {data.growth_percentage > 0 ? '+' : ''}{data.growth_percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Distributor List */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <div className="p-4 border-b border-base-200">
                <h2 className="font-semibold">By SOL</h2>
                <p className="text-sm text-base-content/60">Tap to see details</p>
              </div>

              {data.rows.length === 0 ? (
                <div className="p-8 text-center text-base-content/50">
                  No sales data for selected periods
                </div>
              ) : (
                <div className="divide-y divide-base-200">
                  {data.rows.map((row) => {
                    const isUp = row.growth_percentage > 0
                    const isDown = row.growth_percentage < 0

                    return (
                      <div
                        key={row.sol_id}
                        className="p-4 hover:bg-base-200/50 cursor-pointer transition-colors"
                        onClick={() => handleSolClick(row.sol_id)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {row.sol_name}
                            </p>
                            <p className="text-sm text-base-content/60">{row.city}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-base-content/60">
                                {formatAmount(row.period1_amount)} → {formatAmount(row.period2_amount)}
                              </p>
                              <div className={`flex items-center justify-end gap-1 font-medium ${
                                isUp ? 'text-success' : isDown ? 'text-error' : 'text-base-content/50'
                              }`}>
                                {isUp ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : isDown ? (
                                  <TrendingDown className="h-4 w-4" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                                <span>
                                  {row.growth_percentage > 0 ? '+' : ''}{row.growth_percentage}%
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-base-content/40" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Total Footer */}
              {data.rows.length > 0 && (
                <div className="p-4 bg-base-200/50 border-t border-base-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <div className="flex items-center gap-4">
                      <span className="text-base-content/70">
                        {formatAmount(data.period1_total)} → {formatAmount(data.period2_total)}
                      </span>
                      <div className={`flex items-center gap-1 font-bold ${
                        growthIsPositive ? 'text-success' :
                        growthIsNegative ? 'text-error' :
                        'text-base-content/60'
                      }`}>
                        {growthIsPositive ? '+' : ''}{data.growth_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
