import { createFileRoute, Navigate } from '@tanstack/react-router'

function HomePage() {
  return <Navigate to="/dashboard/my" />
}

export const Route = createFileRoute('/')({
  component: HomePage,
} as const)
