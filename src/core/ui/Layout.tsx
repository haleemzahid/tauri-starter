
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open h-screen">
      {/* Page content */}
      <div className="flex h-full flex-col">{children}</div>
    </div>
  )
}
