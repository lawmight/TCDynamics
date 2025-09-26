// FIXED: Using simple navigation to prevent black page
import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import SimpleNavigation from './components/SimpleNavigation'
// import MobileNavigation from './components/MobileNavigation' // DISABLED: Causes black page
// import StickyHeader from './components/StickyHeader' // DISABLED: Causes black page
import OfflineIndicator from './components/OfflineIndicator'
import PerformanceMonitor from './components/PerformanceMonitor'
import LazyAIChatbot from './components/LazyAIChatbot'

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
)

// Error handler for the ErrorBoundary
const handleAppError = (
  error: Error,
  errorInfo: { componentStack: string }
) => {
  // Report to monitoring service
  if (
    typeof window !== 'undefined' &&
    (
      window as Window & {
        performanceMonitor?: {
          recordMetric: (
            name: string,
            value: number,
            data: Record<string, unknown>
          ) => void
        }
      }
    ).performanceMonitor
  ) {
    ;(
      window as Window & {
        performanceMonitor?: {
          recordMetric: (
            name: string,
            value: number,
            data: Record<string, unknown>
          ) => void
        }
      }
    ).performanceMonitor.recordMetric('error.app', 1, {
      error: error.message,
      componentStack: errorInfo.componentStack,
      severity: 'high',
    })
  }
}

const App = () => (
  <ErrorBoundary onError={handleAppError}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SimpleNavigation />
        {/* DISABLED: MobileNavigation and StickyHeader cause black page */}
        {/* <MobileNavigation /> */}
        {/* <StickyHeader /> */}
        <OfflineIndicator />
        <PerformanceMonitor />
        <LazyAIChatbot />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)

export default App
