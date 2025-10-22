import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Menu } from 'lucide-react'
import { navItems, type NavItem } from '../../config/nav-items'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouterState()

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
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar for mobile */}
        <div className="navbar bg-base-300 lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="sidebar-drawer"
              className="btn btn-square btn-ghost"
            >
              <Menu className="w-6 h-6" />
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">
            <span className="text-lg font-bold">Tauri Starter</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8">{children}</div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-80 min-h-screen">
          {/* Logo Section */}
          <div className="sticky top-0 z-20 bg-base-200 bg-opacity-90 backdrop-blur px-6 py-4 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary-content" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Tauri Starter</h1>
                <p className="text-xs text-base-content/60">v1.0.0</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <ul className="menu p-4 gap-2 w-full">
            {navItems.map((item) => (
              <NavMenuItem key={item.label} item={item} />
            ))}
          </ul>

          {/* Bottom section */}
          <div className="absolute bottom-0 w-full p-4 border-t border-base-300">
            <div className="flex items-center justify-between">
              <div className="text-xs text-base-content/60">
                Built with Tauri + React
              </div>
              <div className="flex gap-1">
                <div className="badge badge-sm badge-primary">v4</div>
                <div className="badge badge-sm badge-secondary">daisyUI</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )

  // Nested component to render nav items recursively
  function NavMenuItem({ item }: { item: NavItem }) {
    const Icon = item.icon
    const itemIsActive = item.path ? isActive(item.path) : false
    const childIsActive = hasActiveChild(item)

    // Item with children (collapsible)
    if (item.children && item.children.length > 0) {
      return (
        <li className="w-full">
          <details open={childIsActive}>
            <summary className={childIsActive ? 'menu-active' : ''}>
              <Icon className="w-5 h-5" />
              {item.label}
              {item.badge && (
                <span className="badge badge-sm badge-primary">
                  {item.badge}
                </span>
              )}
            </summary>
            <ul>
              {item.children.map((child) => (
                <NavMenuItem key={child.label} item={child} />
              ))}
            </ul>
          </details>
        </li>
      )
    }

    // Regular item with link
    return (
      <li className="w-full">
        <Link to={item.path} className={itemIsActive ? 'menu-active' : ''}>
          <Icon className="w-5 h-5" />
          {item.label}
          {item.badge && (
            <span className="badge badge-sm badge-primary">{item.badge}</span>
          )}
        </Link>
      </li>
    )
  }
}
