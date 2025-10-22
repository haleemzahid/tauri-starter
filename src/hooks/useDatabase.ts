import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUsers,
  getUserById,
  insertUser,
  deleteUser,
  initDatabase,
} from '../lib/database'

/**
 * Hook to initialize the database
 */
export function useInitDatabase() {
  return useQuery({
    queryKey: ['database', 'init'],
    queryFn: initDatabase,
    staleTime: Infinity, // Only initialize once
  })
}

/**
 * Hook to fetch all users
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    enabled: id > 0,
  })
}

/**
 * Hook to insert a new user
 */
export function useInsertUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, email }: { name: string; email: string }) =>
      insertUser(name, email),
    onSuccess: async () => {
      // Invalidate and refetch users list
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: async () => {
      // Invalidate and refetch users list
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
