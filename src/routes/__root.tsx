import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Layout from '../core/ui/Layout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const enableDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {enableDevtools && <TanStackRouterDevtools />}
    </>
  )
}
