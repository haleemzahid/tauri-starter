import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSale } from '../shared/database'

export function useDeleteSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      void queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['distributor-dashboard'] })
    },
    onError: (error) => {
      console.error('Error deleting sale:', error)
    },
  })
}
