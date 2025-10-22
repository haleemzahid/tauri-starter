import { useMutation, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

/**
 * Example query hook that calls the Tauri greet command
 */
export function useGreeting(name: string, enabled = false) {
  return useQuery({
    queryKey: ['greet', name],
    queryFn: async () => {
      const result = await invoke<string>('greet', { name })
      return result
    },
    enabled: enabled && name.length > 0,
  })
}

/**
 * Example mutation hook that calls the Tauri greet command
 */
export function useGreetMutation() {
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await invoke<string>('greet', { name })
      return result
    },
  })
}
