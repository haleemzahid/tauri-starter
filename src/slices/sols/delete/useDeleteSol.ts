import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSol } from '../shared/database'

export function useDeleteSol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSol,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sols'] })
    },
    onError: (error) => {
      console.error('Error deleting SOL:', error)
    },
  })
}
