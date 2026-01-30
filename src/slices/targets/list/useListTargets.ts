import { useQuery } from '@tanstack/react-query'
import { getSolTargets, getPersonalTargets } from '../shared/database'

export function useSolTargets(year?: number, month?: number) {
  return useQuery({
    queryKey: ['sol-targets', year, month],
    queryFn: () => getSolTargets(year, month),
  })
}

export function usePersonalTargets() {
  return useQuery({
    queryKey: ['personal-targets'],
    queryFn: getPersonalTargets,
  })
}
