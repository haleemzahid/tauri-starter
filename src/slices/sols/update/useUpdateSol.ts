import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSol } from '../shared/database'
import type { UpdateSolInput } from '../shared/types'

export function useUpdateSol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSolInput }) =>
      updateSol(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sols'] })
    },
    onError: (error) => {
      console.error('Error updating SOL:', error)
    },
  })
}
