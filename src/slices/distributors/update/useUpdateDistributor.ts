import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDistributor } from '../shared/database'
import type { UpdateDistributorInput } from '../shared/types'

export function useUpdateDistributor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDistributorInput }) =>
      updateDistributor(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['distributors'] })
    },
    onError: (error) => {
      console.error('Error updating distributor:', error)
    },
  })
}
