import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '../shared/database'

export function useListCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  })
}
