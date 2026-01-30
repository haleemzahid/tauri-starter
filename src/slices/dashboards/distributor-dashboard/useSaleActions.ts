import { useCallback, useState, useTransition } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSale, deleteSale } from '@/slices/sales/shared/database'
import type { DistributorDashboardSale } from '../shared/types'

export interface SaleFormData {
  date: string
  amount: number
  note: string
  bank_details: string
}

interface UseSaleActionsOptions {
  distributorId: number
  companyId: number
  onSuccess?: () => void
}

export function useSaleActions({ distributorId, companyId, onSuccess }: UseSaleActionsOptions) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [editingSale, setEditingSale] = useState<DistributorDashboardSale | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const invalidateQueries = useCallback(() => {
    startTransition(() => {
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      void queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['distributor-dashboard'] })
      onSuccess?.()
    })
  }, [queryClient, onSuccess])

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SaleFormData }) => {
      return updateSale(id, {
        distributor_id: distributorId,
        company_id: companyId,
        date: data.date,
        amount: data.amount,
        note: data.note || undefined,
        bank_details: data.bank_details || undefined,
      })
    },
    onSuccess: invalidateQueries,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: invalidateQueries,
  })

  const openEditDialog = useCallback((sale: DistributorDashboardSale) => {
    setEditingSale(sale)
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingSale(null)
  }, [])

  const handleUpdate = useCallback(async (data: SaleFormData) => {
    if (!editingSale) return
    await updateMutation.mutateAsync({ id: editingSale.id, data })
    closeDialog()
  }, [editingSale, updateMutation, closeDialog])

  const handleDelete = useCallback(async (saleId: number) => {
    await deleteMutation.mutateAsync(saleId)
  }, [deleteMutation])

  return {
    // State
    editingSale,
    isDialogOpen,
    isPending: isPending || updateMutation.isPending || deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Actions
    openEditDialog,
    closeDialog,
    handleUpdate,
    handleDelete,
  }
}
