import { useQuery } from '@tanstack/react-query'
import { getSols } from '../shared/database'

export function useListSols() {
  return useQuery({
    queryKey: ['sols'],
    queryFn: getSols,
  })
}
