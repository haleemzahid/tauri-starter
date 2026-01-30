import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setSolTarget, deleteSolTarget } from '../shared/database'

export function useSetSolTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setSolTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sol-targets'] })
    },
    onError: (error) => {
      console.error('Error setting SOL target:', error)
    },
  })
}

export function useDeleteSolTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSolTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sol-targets'] })
    },
    onError: (error) => {
      console.error('Error deleting SOL target:', error)
    },
  })
}
