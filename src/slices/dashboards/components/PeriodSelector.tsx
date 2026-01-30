import { MONTH_NAMES } from '@/slices/targets'
import type { Period, PeriodType } from '../shared/types'

interface PeriodSelectorProps {
  label: string
  period: Period
  onChange: (period: Period) => void
}

const QUARTER_NAMES = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)']

export function PeriodSelector({ label, period, onChange }: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  const handleTypeChange = (type: PeriodType) => {
    const newPeriod: Period = { type, year: period.year }
    if (type === 'monthly') {
      newPeriod.month = period.month || new Date().getMonth() + 1
    } else if (type === 'quarterly') {
      newPeriod.quarter = period.quarter || Math.ceil((new Date().getMonth() + 1) / 3)
    }
    onChange(newPeriod)
  }

  const handleYearChange = (year: number) => {
    onChange({ ...period, year })
  }

  const handleMonthChange = (month: number) => {
    onChange({ ...period, month })
  }

  const handleQuarterChange = (quarter: number) => {
    onChange({ ...period, quarter })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-base-content/70">{label}</span>
      <div className="flex gap-2 flex-wrap items-center">
        {/* Period Type Buttons */}
        <div className="join">
          <button
            className={`btn btn-sm join-item ${period.type === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTypeChange('monthly')}
          >
            Month
          </button>
          <button
            className={`btn btn-sm join-item ${period.type === 'quarterly' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTypeChange('quarterly')}
          >
            Quarter
          </button>
          <button
            className={`btn btn-sm join-item ${period.type === 'annual' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTypeChange('annual')}
          >
            Annual
          </button>
        </div>

        {/* Month Selector */}
        {period.type === 'monthly' && (
          <select
            className="select select-bordered select-sm"
            value={period.month || 1}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        )}

        {/* Quarter Selector */}
        {period.type === 'quarterly' && (
          <select
            className="select select-bordered select-sm"
            value={period.quarter || 1}
            onChange={(e) => handleQuarterChange(Number(e.target.value))}
          >
            {QUARTER_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        )}

        {/* Year Selector */}
        <select
          className="select select-bordered select-sm"
          value={period.year}
          onChange={(e) => handleYearChange(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * Format a period for display
 */
export function formatPeriod(period: Period): string {
  if (period.type === 'annual') {
    return `${period.year}`
  }
  if (period.type === 'quarterly') {
    return `Q${period.quarter} ${period.year}`
  }
  return `${MONTH_NAMES[(period.month || 1) - 1]} ${period.year}`
}
