import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCompany } from '../shared/database'

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error) => {
      console.error('Error deleting company:', error)
    },
  })
}
