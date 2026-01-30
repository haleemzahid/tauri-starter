import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Download, Target, Share2, User, Users } from 'lucide-react'
import { getMonthName } from '@/slices/targets'
import { MonthYearPicker } from '../components/MonthYearPicker'
import { MyDashboardTable } from './MyDashboardTable'
import { useMyDashboard } from './useMyDashboard'

export default function MyDashboard() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [isAnnual, setIsAnnual] = useState(false)

  const { data, isLoading, error } = useMyDashboard(year, month, isAnnual)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK').format(amount)
  }

  const handleSolClick = (solId: number) => {
    navigate({
      to: '/dashboard/sol/$solId',
      params: { solId: String(solId) },
      search: { year, month, annual: isAnnual ? '1' : undefined },
    })
  }

  const handleSetTarget = () => {
    navigate({ to: '/targets' })
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading dashboard: {error.message}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          My Dashboard - {isAnnual ? `ANNUAL ${year}` : `${getMonthName(month).toUpperCase()} ${year}`}
        </h1>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={handleSetTarget}>
            <Target className="h-4 w-4" />
            Set Target
          </button>
        </div>
      </div>

      {/* Month/Year Picker */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-base-content/70">Select Period:</span>
        <MonthYearPicker
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          isAnnual={isAnnual}
          onAnnualChange={setIsAnnual}
          showAnnualToggle
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Sales</div>
              <div className="stat-value text-success">{formatAmount(data.total)}</div>
              <div className="stat-desc">{isAnnual ? 'This year' : 'This month'}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <User className="w-8 h-8" />
              </div>
              <div className="stat-title">Main Distributors</div>
              <div className="stat-value text-primary">{formatAmount(data.main_total)}</div>
              <div className="stat-desc">From main distributors</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Sub Distributors</div>
              <div className="stat-value text-secondary">{formatAmount(data.sub_total)}</div>
              <div className="stat-desc">From sub distributors</div>
            </div>
            <div className="stat">
              <div className="stat-title">Target</div>
              <div className="stat-value">{formatAmount(data.target)}</div>
              <div className="stat-desc">{isAnnual ? 'Annual goal' : 'Monthly goal'}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Achievement</div>
              <div
                className={`stat-value ${
                  data.percentage >= 100
                    ? 'text-success'
                    : data.percentage >= 50
                      ? 'text-warning'
                      : 'text-error'
                }`}
              >
                {data.percentage}%
              </div>
              <div className="stat-desc">
                {data.percentage >= 100 ? 'Target achieved!' : 'Keep going!'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <progress
              className={`progress w-full ${
                data.percentage >= 100
                  ? 'progress-success'
                  : data.percentage >= 50
                    ? 'progress-warning'
                    : 'progress-error'
              }`}
              value={Math.min(data.percentage, 100)}
              max="100"
            />
          </div>

          {/* Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">SOL Sales</h2>
              <p className="text-sm text-base-content/60">
                Click on a SOL to view detailed sales by company
              </p>
              <MyDashboardTable
                rows={data.rows}
                total={data.total}
                onSolClick={handleSolClick}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
