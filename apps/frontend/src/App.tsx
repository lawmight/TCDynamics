// FIXED: Using simple navigation to prevent black page
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import SimpleNavigation from './components/SimpleNavigation'
// import MobileNavigation from './components/MobileNavigation' // DISABLED: Causes black page
// import StickyHeader from './components/StickyHeader' // DISABLED: Causes black page
import LazyAIChatbot from './components/LazyAIChatbot'
import OfflineIndicator from './components/OfflineIndicator'
import PerformanceMonitor from './components/PerformanceMonitor'

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const Demo = lazy(() => import('./pages/Demo'))
const GetStarted = lazy(() => import('./pages/GetStarted'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Pages = lazy(() => import('./pages/Pages'))
const Diagnostics = lazy(() => import('./pages/Diagnostics'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Settings = lazy(() => import('./pages/Settings'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Contact = lazy(() => import('./pages/Contact'))

// Stripe Connect pages
const ConnectDashboard = lazy(() => import('./pages/ConnectDashboard'))
const ConnectProducts = lazy(() => import('./pages/ConnectProducts'))
const ConnectStorefront = lazy(() => import('./pages/ConnectStorefront'))
const ConnectCheckoutSuccess = lazy(
  () => import('./pages/ConnectCheckoutSuccess')
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        const err = error as { status?: number }
        if (err?.status && err.status >= 400 && err.status < 500) {
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
        <OfflineIndicator />
        <PerformanceMonitor />
        <LazyAIChatbot />
        <BrowserRouter>
          <SimpleNavigation />
          {/* DISABLED: MobileNavigation and StickyHeader cause black page */}
          {/* <MobileNavigation /> */}
          {/* <StickyHeader /> */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/pricing" element={<Pricing />} />

              {/* Stripe Connect Routes */}
              <Route path="/connect/dashboard" element={<ConnectDashboard />} />
              <Route
                path="/connect/products/:accountId"
                element={<ConnectProducts />}
              />
              <Route
                path="/connect/store/:accountId"
                element={<ConnectStorefront />}
              />
              <Route
                path="/connect/store/:accountId/success"
                element={<ConnectCheckoutSuccess />}
              />

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
