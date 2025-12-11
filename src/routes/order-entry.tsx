import { createFileRoute } from '@tanstack/react-router'
import { OrderEntryPage } from '@/slices/order-entry'

export const Route = createFileRoute('/order-entry')({
  component: OrderEntryPage,
})
