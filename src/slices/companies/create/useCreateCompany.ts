import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCompany } from '../shared/database'

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error) => {
      console.error('Error creating company:', error)
    },
  })
}
