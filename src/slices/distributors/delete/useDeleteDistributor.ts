import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDistributor } from '../shared/database'

export function useDeleteDistributor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDistributor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['distributors'] })
    },
    onError: (error) => {
      console.error('Error deleting distributor:', error)
    },
  })
}
