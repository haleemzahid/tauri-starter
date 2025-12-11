export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open h-screen overflow-hidden">
      {/* Page content */}
      <div className="drawer-content flex h-full flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
