import { useState } from 'react'
import { Plus, Target, User, Trash2, Building2, Pencil } from 'lucide-react'
import { BaseListPage } from '@/core/components'
import { useSolTargets, usePersonalTargets } from './useListTargets'
import { useSetSolTarget, useDeleteSolTarget } from '../set-sol-target/useSetSolTarget'
import { useSetPersonalTarget, useDeletePersonalTarget } from '../set-personal-target/useSetPersonalTarget'
import SolTargetForm from '../set-sol-target/SolTargetForm'
import PersonalTargetForm from '../set-personal-target/PersonalTargetForm'
import { getMonthName, type SetSolTargetInput, type SetPersonalTargetInput, type SolTargetWithDetails, type PersonalTarget } from '../shared/types'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ListTargets() {
  const [activeTab, setActiveTab] = useState<'sol' | 'personal'>('sol')
  const [isSolFormOpen, setIsSolFormOpen] = useState(false)
  const [isPersonalFormOpen, setIsPersonalFormOpen] = useState(false)
  const [editingSolTarget, setEditingSolTarget] = useState<SolTargetWithDetails | null>(null)
  const [editingPersonalTarget, setEditingPersonalTarget] = useState<PersonalTarget | null>(null)

  const { data: solTargets = [], isLoading: solLoading } = useSolTargets()
  const { data: personalTargets = [], isLoading: personalLoading } = usePersonalTargets()

  const setSolTargetMutation = useSetSolTarget()
  const deleteSolTargetMutation = useDeleteSolTarget()
  const setPersonalTargetMutation = useSetPersonalTarget()
  const deletePersonalTargetMutation = useDeletePersonalTarget()

  const handleSolSubmit = async (data: SetSolTargetInput) => {
    await setSolTargetMutation.mutateAsync(data)
    setIsSolFormOpen(false)
    setEditingSolTarget(null)
  }

  const handlePersonalSubmit = async (data: SetPersonalTargetInput) => {
    await setPersonalTargetMutation.mutateAsync(data)
    setIsPersonalFormOpen(false)
    setEditingPersonalTarget(null)
  }

  const handleEditSolTarget = (target: SolTargetWithDetails) => {
    setEditingSolTarget(target)
    setIsSolFormOpen(true)
  }

  const handleEditPersonalTarget = (target: PersonalTarget) => {
    setEditingPersonalTarget(target)
    setIsPersonalFormOpen(true)
  }

  const handleSolFormClose = () => {
    setIsSolFormOpen(false)
    setEditingSolTarget(null)
  }

  const handlePersonalFormClose = () => {
    setIsPersonalFormOpen(false)
    setEditingPersonalTarget(null)
  }

  const handleDeleteSolTarget = (id: number) => {
    if (confirm('Delete this target?')) {
      void deleteSolTargetMutation.mutate(id)
    }
  }

  const handleDeletePersonalTarget = (id: number) => {
    if (confirm('Delete this target?')) {
      void deletePersonalTargetMutation.mutate(id)
    }
  }

  return (
    <>
      <BaseListPage
        title="Targets"
        description="Set monthly sales targets for SOLs and yourself."
        actionButton={{
          label: activeTab === 'sol' ? 'Set SOL Target' : 'Set My Target',
          icon: Plus,
          onClick: () => activeTab === 'sol' ? setIsSolFormOpen(true) : setIsPersonalFormOpen(true),
        }}
        stats={[
          {
            label: 'SOL Targets',
            value: solTargets.length,
            icon: Target,
            color: 'primary',
          },
          {
            label: 'Personal Targets',
            value: personalTargets.length,
            icon: User,
            color: 'success',
          },
        ]}
        isLoading={solLoading || personalLoading}
      >
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab ${activeTab === 'sol' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('sol')}
          >
            <Target className="w-4 h-4 mr-2" />
            SOL Targets
          </button>
          <button
            className={`tab ${activeTab === 'personal' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User className="w-4 h-4 mr-2" />
            My Monthly Targets
          </button>
        </div>

        {/* SOL Targets Tab */}
        {activeTab === 'sol' && (
          <div className="space-y-2">
            {solTargets.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No SOL targets set yet.</p>
                <p className="text-sm">Click "Set SOL Target" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>SOL</th>
                      <th>Company</th>
                      <th>Month</th>
                      <th>Total Target</th>
                      <th>Main Target</th>
                      <th>Sub Target</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solTargets.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="font-semibold">{t.sol_name}</div>
                          <div className="text-sm text-base-content/60">
                            Main: {t.main_distributor_name}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-secondary" />
                            {t.company_name}
                          </div>
                        </td>
                        <td>{getMonthName(t.month)} {t.year}</td>
                        <td className="font-bold text-primary">{formatAmount(t.total_target)}</td>
                        <td className="text-success">{formatAmount(t.main_target)}</td>
                        <td className="text-info">{formatAmount(t.sub_target)}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditSolTarget(t)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-error"
                              onClick={() => handleDeleteSolTarget(t.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Personal Targets Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-2">
            {personalTargets.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No personal targets set yet.</p>
                <p className="text-sm">Click "Set My Target" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Target Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalTargets.map((t) => (
                      <tr key={t.id}>
                        <td className="font-semibold">{getMonthName(t.month)}</td>
                        <td>{t.year}</td>
                        <td className="font-bold text-success">{formatAmount(t.target_amount)}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditPersonalTarget(t)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-error"
                              onClick={() => handleDeletePersonalTarget(t.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </BaseListPage>

      <SolTargetForm
        onSubmit={handleSolSubmit}
        onCancel={handleSolFormClose}
        isOpen={isSolFormOpen}
        initialData={editingSolTarget}
      />

      <PersonalTargetForm
        onSubmit={handlePersonalSubmit}
        onCancel={handlePersonalFormClose}
        isOpen={isPersonalFormOpen}
        initialData={editingPersonalTarget}
      />
    </>
  )
}
