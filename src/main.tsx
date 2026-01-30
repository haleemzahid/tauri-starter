import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './index.css'
import { initDatabase } from './core/database/client'
import { startBackupService } from './core/backup'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const enableDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'

async function startApp() {
  try {
    await initDatabase()
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
  }

  // Start MEGA backup service
  startBackupService({
    email: 'fidazahid.suit@gmail.com',
    password: 'fida313691',
    intervalMinutes: 15,
  }).catch((err) => {
    console.warn('⚠️ Backup service failed to start:', err)
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  )
}

void startApp()
