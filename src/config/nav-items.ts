import { LucideIcon, Home, Settings } from 'lucide-react'

/**
 * Navigation Item Interface
 *
 * @property label - Display text for the nav item
 * @property path - Route path (optional for parent items with children)
 * @property icon - Lucide React icon component
 * @property badge - Optional badge text (e.g., "New", "Beta", "3")
 * @property children - Optional nested navigation items (creates collapsible menu)
 */
export interface NavItem {
  label: string
  path?: string
  icon: LucideIcon
  badge?: string
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: Home,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  // {
  //   label: 'Management',
  //   icon: Users,
  //   children: [
  //     {
  //       label: 'Users',
  //       path: '/management/users',
  //       icon: Users,
  //     },
  //     {
  //       label: 'Roles',
  //       path: '/management/roles',
  //       icon: FileText,
  //     },
  //   ],
  // },
  // {
  //   label: 'Analytics',
  //   path: '/analytics',
  //   icon: BarChart3,
  //   badge: 'New',
  // },
  // {
  //   label: 'Products',
  //   path: '/products',
  //   icon: Package,
  // },
]
