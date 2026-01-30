import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSol } from '../shared/database'

export function useCreateSol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSol,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sols'] })
    },
    onError: (error) => {
      console.error('Error creating SOL:', error)
    },
  })
}
