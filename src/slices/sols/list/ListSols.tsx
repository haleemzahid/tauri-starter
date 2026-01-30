import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { BaseListPage } from '@/core/components'
import SolsTable from './SolsTable'
import SolForm from '../create/SolForm'
import { useListSols } from './useListSols'
import { useCreateSol } from '../create/useCreateSol'
import { useUpdateSol } from '../update/useUpdateSol'
import { useDeleteSol } from '../delete/useDeleteSol'
import type { SolWithDetails, CreateSolInput, UpdateSolInput } from '../shared/types'

export default function ListSols() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSol, setEditingSol] = useState<SolWithDetails | undefined>(undefined)

  const { data: sols = [], isLoading, error } = useListSols()
  const createMutation = useCreateSol()
  const updateMutation = useUpdateSol()
  const deleteMutation = useDeleteSol()

  const handleSubmit = async (data: CreateSolInput | UpdateSolInput) => {
    if (editingSol) {
      await updateMutation.mutateAsync({ id: editingSol.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateSolInput)
    }
    setIsFormOpen(false)
    setEditingSol(undefined)
  }

  const handleEdit = (sol: SolWithDetails) => {
    setEditingSol(sol)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (
      confirm(
        'Are you sure you want to delete this SOL? This will also delete all related sales and targets.'
      )
    ) {
      void deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingSol(undefined)
  }

  const handleCreateNew = () => {
    setEditingSol(undefined)
    setIsFormOpen(true)
  }

  // Calculate stats
  const totalSubDistributors = sols.reduce(
    (acc, sol) => acc + sol.sub_distributor_ids.length,
    0
  )

  return (
    <>
      <BaseListPage
        title="Sales Organization Levels"
        description="Manage your SOLs. Each SOL has a main distributor and optional sub-distributors."
        actionButton={{
          label: 'Create SOL',
          icon: Plus,
          onClick: handleCreateNew,
        }}
        stats={[
          {
            label: 'Total SOLs',
            value: sols.length,
            icon: Building2,
            color: 'primary',
          },
          {
            label: 'Total Sub-Distributors',
            value: totalSubDistributors,
            icon: Building2,
            color: 'secondary',
          },
        ]}
        isLoading={isLoading}
        error={error}
      >
        <SolsTable sols={sols} onEdit={handleEdit} onDelete={handleDelete} />
      </BaseListPage>

      <SolForm
        sol={editingSol}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </>
  )
}
