// Order Machine Context - Shared context for XState machine

import { createContext, useContext } from 'react'
import type { useMachine } from '@xstate/react'
import type { orderMachine, OrderContext } from './orderMachine'

// === Types ===

type OrderMachineState = ReturnType<typeof useMachine<typeof orderMachine>>[0]
type OrderMachineSend = ReturnType<typeof useMachine<typeof orderMachine>>[1]

export interface OrderMachineContextValue {
  state: OrderMachineState
  send: OrderMachineSend
  context: OrderContext
}

// === Context ===

export const OrderMachineContext =
  createContext<OrderMachineContextValue | null>(null)

// === Hook ===

export function useOrderMachineContext(): OrderMachineContextValue {
  const context = useContext(OrderMachineContext)
  if (!context) {
    throw new Error(
      'useOrderMachineContext must be used within OrderMachineProvider'
    )
  }
  return context
}
