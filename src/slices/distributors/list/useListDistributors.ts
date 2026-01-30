import { useQuery } from '@tanstack/react-query'
import { getDistributors } from '../shared/database'

export function useListDistributors() {
  return useQuery({
    queryKey: ['distributors'],
    queryFn: getDistributors,
  })
}
