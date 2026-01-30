import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSale } from '../shared/database'

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      void queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['distributor-dashboard'] })
    },
    onError: (error) => {
      console.error('Error creating sale:', error)
    },
  })
}
