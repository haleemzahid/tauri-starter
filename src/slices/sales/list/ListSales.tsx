import { useState } from 'react'
import { Plus, DollarSign, TrendingUp } from 'lucide-react'
import { BaseListPage } from '@/core/components'
import SalesTable from './SalesTable'
import SaleForm from '../create/SaleForm'
import { useListSales } from './useListSales'
import { useCreateSale } from '../create/useCreateSale'
import { useUpdateSale } from '../update/useUpdateSale'
import { useDeleteSale } from '../delete/useDeleteSale'
import type { SaleWithDetails, CreateSaleInput, UpdateSaleInput } from '../shared/types'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ListSales() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<SaleWithDetails | undefined>(undefined)

  const { data: sales = [], isLoading, error } = useListSales()
  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale()
  const deleteMutation = useDeleteSale()

  const handleSubmit = async (data: CreateSaleInput | UpdateSaleInput) => {
    if (editingSale) {
      await updateMutation.mutateAsync({ id: editingSale.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateSaleInput)
    }
    setIsFormOpen(false)
    setEditingSale(undefined)
  }

  const handleEdit = (sale: SaleWithDetails) => {
    setEditingSale(sale)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this sale record?')) {
      void deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingSale(undefined)
  }

  const handleCreateNew = () => {
    setEditingSale(undefined)
    setIsFormOpen(true)
  }

  // Calculate stats
  const thisMonthSales = sales.filter(s => {
    const saleDate = new Date(s.date)
    const now = new Date()
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthSales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <>
      <BaseListPage
        title="Sales"
        description="Record and manage all sales from your distributors."
        actionButton={{
          label: 'Add Sale',
          icon: Plus,
          onClick: handleCreateNew,
        }}
        stats={[
          {
            label: 'Total Entries',
            value: sales.length,
            icon: DollarSign,
            color: 'primary',
          },
          {
            label: 'This Month',
            value: formatAmount(thisMonthTotal),
            icon: TrendingUp,
            color: 'success',
          },
        ]}
        isLoading={isLoading}
        error={error}
      >
        <SalesTable
          sales={sales}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </BaseListPage>

      <SaleForm
        sale={editingSale}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </>
  )
}
