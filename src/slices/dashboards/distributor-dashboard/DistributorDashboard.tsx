import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { getMonthName } from '@/slices/targets'
import { MonthYearPicker } from '../components/MonthYearPicker'
import { DistributorSalesTable } from './DistributorSalesTable'
import { EditSaleDialog } from './EditSaleDialog'
import { useDistributorDashboard } from './useDistributorDashboard'
import { useSaleActions } from './useSaleActions'
import { exportDistributorDashboardToPDF, shareDistributorDashboardPDF } from '../shared/export-utils'

export default function DistributorDashboard() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { distributorId?: string }
  const search = useSearch({ strict: false }) as { year?: number; month?: number; annual?: string }

  const now = new Date()
  const [year, setYear] = useState(search.year ?? now.getFullYear())
  const [month, setMonth] = useState(search.month ?? now.getMonth() + 1)
  const [isAnnual, setIsAnnual] = useState(search.annual === '1')
  const [activeTab, setActiveTab] = useState(0)

  const distributorId = params.distributorId ? Number(params.distributorId) : null

  const { data, isLoading, error } = useDistributorDashboard(distributorId, year, month, isAnnual)

  // Get the active company data
  const activeCompany = useMemo(() => {
    return data?.companies[activeTab] ?? null
  }, [data, activeTab])

  // Sale actions hook - only initialize when we have valid IDs
  const saleActions = useSaleActions({
    distributorId: distributorId ?? 0,
    companyId: activeCompany?.company_id ?? 0,
  })

  // Reset active tab when distributor changes
  useEffect(() => {
    setActiveTab(0)
  }, [distributorId])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK').format(amount)
  }

  const handleBack = () => {
    navigate({ to: '/dashboard/my', search: { year, month } })
  }

  const handleExportPDF = async () => {
    if (data) {
      await exportDistributorDashboardToPDF(data, activeTab, isAnnual)
    }
  }

  const handleSharePDF = async () => {
    if (data) {
      await shareDistributorDashboardPDF(data, activeTab, isAnnual)
    }
  }

  if (!distributorId) {
    return (
      <div className="alert alert-warning">
        <span>No distributor selected. Please go back and select a distributor.</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading dashboard: {error.message}</span>
      </div>
    )
  }

  const periodText = isAnnual ? `Annual ${year}` : `${getMonthName(month)} ${year}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost btn-sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {data?.distributor.name || 'Loading...'} - {periodText}
          </h1>
          {data && (
            <p className="text-sm text-base-content/60">{data.distributor.city}</p>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleExportPDF}
          disabled={!data || data.companies.length === 0}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleSharePDF}
          disabled={!data || data.companies.length === 0}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
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
          {data.companies.length === 0 ? (
            <div className="alert alert-info">
              <span>This distributor is not assigned to any companies yet.</span>
            </div>
          ) : (
            <>
              {/* Company Tabs */}
              <div role="tablist" className="tabs tabs-boxed">
                {data.companies.map((company, idx) => (
                  <button
                    key={company.company_id}
                    role="tab"
                    className={`tab ${activeTab === idx ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {company.company_name}
                  </button>
                ))}
              </div>

              {/* Active Company Content */}
              {activeCompany && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="stats shadow w-full">
                    <div className="stat">
                      <div className="stat-title">Total Sales</div>
                      <div className="stat-value text-primary">
                        {formatAmount(activeCompany.total)}
                      </div>
                      <div className="stat-desc">
                        {activeCompany.company_name} - {isAnnual ? year : getMonthName(month)}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Target</div>
                      <div className="stat-value">
                        {formatAmount(activeCompany.target)}
                      </div>
                      <div className="stat-desc">{isAnnual ? 'Annual goal' : 'Monthly goal'}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Achievement</div>
                      <div
                        className={`stat-value ${
                          activeCompany.percentage >= 100
                            ? 'text-success'
                            : activeCompany.percentage >= 50
                              ? 'text-warning'
                              : 'text-error'
                        }`}
                      >
                        {activeCompany.percentage}%
                      </div>
                      <div className="stat-desc">
                        {activeCompany.percentage >= 100
                          ? 'Target achieved!'
                          : 'Keep going!'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full">
                    <progress
                      className={`progress w-full ${
                        activeCompany.percentage >= 100
                          ? 'progress-success'
                          : activeCompany.percentage >= 50
                            ? 'progress-warning'
                            : 'progress-error'
                      }`}
                      value={Math.min(activeCompany.percentage, 100)}
                      max="100"
                    />
                  </div>

                  {/* Sales Table */}
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">
                        Sales for {activeCompany.company_name}
                      </h2>
                      <DistributorSalesTable
                        sales={activeCompany.sales}
                        total={activeCompany.total}
                        onEdit={saleActions.openEditDialog}
                        onDelete={saleActions.handleDelete}
                        isDeleting={saleActions.isDeleting}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : null}

      {/* Edit Sale Dialog */}
      <EditSaleDialog
        sale={saleActions.editingSale}
        isOpen={saleActions.isDialogOpen}
        isSubmitting={saleActions.isUpdating}
        onSubmit={saleActions.handleUpdate}
        onClose={saleActions.closeDialog}
      />
    </div>
  )
}
