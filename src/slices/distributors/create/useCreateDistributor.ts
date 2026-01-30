import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDistributor } from '../shared/database'

export function useCreateDistributor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDistributor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['distributors'] })
    },
    onError: (error) => {
      console.error('Error creating distributor:', error)
    },
  })
}
