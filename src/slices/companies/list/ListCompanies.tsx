import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { BaseListPage } from '@/core/components'
import CompaniesTable from './CompaniesTable'
import CompanyForm from '../create/CompanyForm'
import { useListCompanies } from './useListCompanies'
import { useCreateCompany } from '../create/useCreateCompany'
import { useUpdateCompany } from '../update/useUpdateCompany'
import { useDeleteCompany } from '../delete/useDeleteCompany'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../shared/types'

export default function ListCompanies() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined)

  const { data: companies = [], isLoading, error } = useListCompanies()
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()

  const handleSubmit = async (data: CreateCompanyInput | UpdateCompanyInput) => {
    if (editingCompany) {
      await updateMutation.mutateAsync({ id: editingCompany.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateCompanyInput)
    }
    setIsFormOpen(false)
    setEditingCompany(undefined)
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all related distributors and sales data.')) {
      void deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingCompany(undefined)
  }

  const handleCreateNew = () => {
    setEditingCompany(undefined)
    setIsFormOpen(true)
  }

  return (
    <>
      <BaseListPage
        title="Companies"
        description="Manage your companies. Add distributors to each company to track their sales."
        actionButton={{
          label: 'Add Company',
          icon: Plus,
          onClick: handleCreateNew,
        }}
        stats={[
          {
            label: 'Total Companies',
            value: companies.length,
            icon: Building2,
            color: 'primary',
          },
        ]}
        isLoading={isLoading}
        error={error}
      >
        <CompaniesTable
          companies={companies}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </BaseListPage>

      <CompanyForm
        company={editingCompany}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </>
  )
}
