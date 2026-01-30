import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/slices/data-management'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
