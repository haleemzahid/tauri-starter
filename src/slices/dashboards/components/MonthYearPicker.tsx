import { MONTH_NAMES } from '@/slices/targets'
import { Calendar, CalendarDays } from 'lucide-react'

interface MonthYearPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  isAnnual?: boolean
  onAnnualChange?: (isAnnual: boolean) => void
  showAnnualToggle?: boolean
}

export function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
  isAnnual = false,
  onAnnualChange,
  showAnnualToggle = false,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <div className="flex gap-2 items-center">
      {showAnnualToggle && onAnnualChange && (
        <div className="btn-group">
          <button
            className={`btn btn-sm ${!isAnnual ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onAnnualChange(false)}
            title="Monthly view"
          >
            <Calendar className="h-4 w-4" />
            Monthly
          </button>
          <button
            className={`btn btn-sm ${isAnnual ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onAnnualChange(true)}
            title="Annual view"
          >
            <CalendarDays className="h-4 w-4" />
            Annual
          </button>
        </div>
      )}
      {!isAnnual && (
        <select
          className="select select-bordered select-sm"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {MONTH_NAMES.map((name, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>
      )}
      <select
        className="select select-bordered select-sm"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
