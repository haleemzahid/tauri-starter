import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setPersonalTarget, deletePersonalTarget } from '../shared/database'

export function useSetPersonalTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setPersonalTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personal-targets'] })
    },
    onError: (error) => {
      console.error('Error setting personal target:', error)
    },
  })
}

export function useDeletePersonalTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePersonalTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personal-targets'] })
    },
    onError: (error) => {
      console.error('Error deleting personal target:', error)
    },
  })
}
