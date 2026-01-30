import { useQuery } from '@tanstack/react-query'
import { getDistributorGrowthData } from '../shared/database'
import type { Period } from '../shared/types'

export function useDistributorGrowth(
  distributorId: number | null,
  period1: Period,
  period2: Period
) {
  return useQuery({
    queryKey: ['distributor-growth', distributorId, period1, period2],
    queryFn: () => {
      if (!distributorId) return null
      return getDistributorGrowthData(distributorId, period1, period2)
    },
    enabled: !!distributorId,
  })
}
