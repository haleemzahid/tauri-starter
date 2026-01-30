import { useQuery } from '@tanstack/react-query'
import { getSales } from '../shared/database'

export function useListSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  })
}
