import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s — matches the existing auto-refresh cadence
      gcTime: 5 * 60_000,       // 5min cache retention
      refetchOnWindowFocus: false,
      retry: (failCount, err) => {
        // Don't retry 4xx — those are client errors, not transient
        const status = (err as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failCount < 2;
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
