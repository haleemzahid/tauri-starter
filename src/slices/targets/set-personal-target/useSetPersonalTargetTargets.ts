import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSetPersonalTargetTargets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement your mutation logic
      console.log('set-personal-target targets:', data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['targets'] })
    },
    onError: (error) => {
      console.error('Error set-personal-target targets:', error)
    },
  })
}
