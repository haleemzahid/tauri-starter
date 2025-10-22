import { createFileRoute } from '@tanstack/react-router'
import { ListTodos } from '../slices/todos'

export const Route = createFileRoute('/')({
  component: ListTodos,
} as const)
