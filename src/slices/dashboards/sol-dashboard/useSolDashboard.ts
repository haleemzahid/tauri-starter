import { useQuery } from '@tanstack/react-query'
import { getSolDashboardData } from '../shared/database'

export function useSolDashboard(
  solId: number | null,
  year: number,
  month: number,
  isAnnual = false
) {
  return useQuery({
    queryKey: ['sol-dashboard', solId, year, month, isAnnual],
    queryFn: () => {
      if (!solId) return null
      return getSolDashboardData(solId, year, month, isAnnual)
    },
    enabled: !!solId,
  })
}
