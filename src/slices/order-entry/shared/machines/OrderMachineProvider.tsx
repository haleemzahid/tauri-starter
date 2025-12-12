// Order Machine Provider - React context for XState machine

import type { ReactNode } from 'react'
import { useMachine } from '@xstate/react'
import { orderMachine } from './orderMachine'
import { OrderMachineContext } from './orderMachineContext'

// === Provider ===

interface OrderMachineProviderProps {
  children: ReactNode
}

export function OrderMachineProvider({ children }: OrderMachineProviderProps) {
  const [state, send] = useMachine(orderMachine)

  return (
    <OrderMachineContext.Provider
      value={{ state, send, context: state.context }}
    >
      {children}
    </OrderMachineContext.Provider>
  )
}
