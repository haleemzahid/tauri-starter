import { LayoutDashboard, BarChart3, Building2, TrendingUp } from 'lucide-react'

export const dashboardsConfig = {
  label: 'Dashboards',
  icon: LayoutDashboard,
  children: [
    {
      label: 'My Dashboard',
      path: '/dashboard/my',
      icon: BarChart3,
    },
    {
      label: 'SOL Dashboard',
      path: '/dashboard/sol',
      icon: Building2,
    },
    {
      label: 'Growth Comparison',
      path: '/dashboard/growth',
      icon: TrendingUp,
    },
  ],
}
