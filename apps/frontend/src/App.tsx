// FIXED: Using simple navigation to prevent black page
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { Suspense, lazy } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom'

import ErrorBoundary from './components/ErrorBoundary'
// import MobileNavigation from './components/MobileNavigation' // DISABLED: Causes black page
// import StickyHeader from './components/StickyHeader' // DISABLED: Causes black page
// import LazyAIChatbot from './components/LazyAIChatbot' // Temporarily disabled - Week 5-6 customer validation
import Footer from './components/Footer'
import OfflineIndicator from './components/OfflineIndicator'
import PerformanceMonitor from './components/PerformanceMonitor'
import ScrollToTop from './components/ScrollToTop'
import SimpleNavigation from './components/SimpleNavigation'
import { ThemeProvider } from './components/ThemeProvider'
import { AppLayout } from './components/app/AppLayout'
import { useAuth } from './hooks/useAuth'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const Demo = lazy(() => import('./pages/Demo'))
const GetStarted = lazy(() => import('./pages/GetStarted'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const About = lazy(() => import('./pages/About'))
const Pages = lazy(() => import('./pages/Pages'))
const Diagnostics = lazy(() => import('./pages/Diagnostics'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/auth/Login'))
const ChatApp = lazy(() => import('./pages/app/Chat'))
const FilesApp = lazy(() => import('./pages/app/Files'))
const AnalyticsApp = lazy(() => import('./pages/app/Analytics'))
const Security = lazy(() => import('./pages/Security'))

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
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
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

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isSignedIn, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppRouter = () => {
  const location = useLocation()
  const hideMarketingChrome =
    location.pathname.startsWith('/app') ||
    location.pathname.startsWith('/login')

  return (
    <>
      {!hideMarketingChrome && <SimpleNavigation />}
      <ScrollToTop />
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
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/about" element={<About />} />
          <Route path="/security" element={<Security />} />

          <Route
            path="/features"
            element={<Navigate to="/#features" replace />}
          />
          <Route
            path="/pricing"
            element={<Navigate to="/#pricing" replace />}
          />
          <Route
            path="/contact"
            element={<Navigate to="/#contact" replace />}
          />

          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat" element={<ChatApp />} />
            <Route path="files" element={<FilesApp />} />
            <Route path="analytics" element={<AnalyticsApp />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideMarketingChrome && <Footer />}
    </>
  )
}

const App = () => (
  <ThemeProvider>
    <ErrorBoundary onError={handleAppError}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <PerformanceMonitor />
          <Analytics />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
)

export default App
