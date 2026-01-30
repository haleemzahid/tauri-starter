import { useQuery } from '@tanstack/react-query'
import { getMyGrowthData } from '../shared/database'
import type { Period } from '../shared/types'

export function useMyGrowth(period1: Period, period2: Period) {
  return useQuery({
    queryKey: ['my-growth', period1, period2],
    queryFn: () => getMyGrowthData(period1, period2),
  })
}
