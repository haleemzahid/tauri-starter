import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompany } from '../shared/database'
import type { UpdateCompanyInput } from '../shared/types'

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyInput }) =>
      updateCompany(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error) => {
      console.error('Error updating company:', error)
    },
  })
}
