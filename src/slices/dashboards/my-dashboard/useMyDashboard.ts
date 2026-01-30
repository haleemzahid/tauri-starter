import { useQuery } from '@tanstack/react-query'
import { getMyDashboardData } from '../shared/database'

export function useMyDashboard(year: number, month: number, isAnnual = false) {
  return useQuery({
    queryKey: ['my-dashboard', year, month, isAnnual],
    queryFn: () => getMyDashboardData(year, month, isAnnual),
  })
}
