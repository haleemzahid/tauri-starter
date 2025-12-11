import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { Home, Menu, LogOut } from 'lucide-react'
import { navItems, type NavItem } from '../../config/nav-items'
import { useCurrentUser, useLogout } from '../../slices/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouterState()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const isActive = (path: string) => router.location.pathname === path

  // Check if any child is active for parent items
  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false
    return item.children.some(
      (child: NavItem) =>
        child.path === location.pathname || hasActiveChild(child)
    )
  }

  return (
    <div className="drawer lg:drawer-open">
        {/* Page content */}
        <div className="p-4 lg:p-8">{children}</div>
      </div>
  )

  
}
