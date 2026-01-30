import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/sol/')({
  component: () => <Navigate to="/dashboard/sol" />,
})
