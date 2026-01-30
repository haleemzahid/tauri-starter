import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setDistributorTarget, deleteDistributorTarget } from '../shared/database'

export function useSetDistributorTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDistributorTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['distributor-targets'] })
    },
    onError: (error) => {
      console.error('Error setting distributor target:', error)
    },
  })
}

export function useDeleteDistributorTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDistributorTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['distributor-targets'] })
    },
    onError: (error) => {
      console.error('Error deleting distributor target:', error)
    },
  })
}
