import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { BaseListPage } from '@/core/components'
import DistributorsTable from './DistributorsTable'
import DistributorForm from '../create/DistributorForm'
import { useListDistributors } from './useListDistributors'
import { useCreateDistributor } from '../create/useCreateDistributor'
import { useUpdateDistributor } from '../update/useUpdateDistributor'
import { useDeleteDistributor } from '../delete/useDeleteDistributor'
import type { DistributorWithCompanies, CreateDistributorInput, UpdateDistributorInput } from '../shared/types'

export default function ListDistributors() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDistributor, setEditingDistributor] = useState<DistributorWithCompanies | undefined>(undefined)

  const { data: distributors = [], isLoading, error } = useListDistributors()
  const createMutation = useCreateDistributor()
  const updateMutation = useUpdateDistributor()
  const deleteMutation = useDeleteDistributor()

  const handleSubmit = async (data: CreateDistributorInput | UpdateDistributorInput) => {
    if (editingDistributor) {
      await updateMutation.mutateAsync({ id: editingDistributor.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateDistributorInput)
    }
    setIsFormOpen(false)
    setEditingDistributor(undefined)
  }

  const handleEdit = (distributor: DistributorWithCompanies) => {
    setEditingDistributor(distributor)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this distributor? This will also delete all their sales data.')) {
      void deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingDistributor(undefined)
  }

  const handleCreateNew = () => {
    setEditingDistributor(undefined)
    setIsFormOpen(true)
  }

  return (
    <>
      <BaseListPage
        title="Distributors"
        description="Manage your distributors. Track their sales and set monthly targets."
        actionButton={{
          label: 'Add Distributor',
          icon: Plus,
          onClick: handleCreateNew,
        }}
        stats={[
          {
            label: 'Total Distributors',
            value: distributors.length,
            icon: Users,
            color: 'primary',
          },
        ]}
        isLoading={isLoading}
        error={error}
      >
        <DistributorsTable
          distributors={distributors}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </BaseListPage>

      <DistributorForm
        distributor={editingDistributor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </>
  )
}
