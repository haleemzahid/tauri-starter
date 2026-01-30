import { useQuery } from '@tanstack/react-query'
import { getSolGrowthData } from '../shared/database'
import type { Period } from '../shared/types'

export function useSolGrowth(solId: number | null, period1: Period, period2: Period) {
  return useQuery({
    queryKey: ['sol-growth', solId, period1, period2],
    queryFn: () => {
      if (!solId) return null
      return getSolGrowthData(solId, period1, period2)
    },
    enabled: !!solId,
  })
}
