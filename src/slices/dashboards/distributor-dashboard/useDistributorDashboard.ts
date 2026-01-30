import { useQuery } from '@tanstack/react-query'
import { getDistributorDashboardData } from '../shared/database'

export function useDistributorDashboard(
  distributorId: number | null,
  year: number,
  month: number,
  isAnnual = false
) {
  return useQuery({
    queryKey: ['distributor-dashboard', distributorId, year, month, isAnnual],
    queryFn: () =>
      distributorId ? getDistributorDashboardData(distributorId, year, month, isAnnual) : null,
    enabled: distributorId !== null,
  })
}
