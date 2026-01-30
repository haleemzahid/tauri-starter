import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSale } from '../shared/database'
import type { UpdateSaleInput } from '../shared/types'

export function useUpdateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSaleInput }) =>
      updateSale(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      void queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['distributor-dashboard'] })
    },
    onError: (error) => {
      console.error('Error updating sale:', error)
    },
  })
}
