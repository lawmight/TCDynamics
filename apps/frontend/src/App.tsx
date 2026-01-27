// FIXED: Using simple navigation to prevent black page
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import ErrorBoundary from './components/ErrorBoundary'
// import MobileNavigation from './components/MobileNavigation' // DISABLED: Causes black page
// import StickyHeader from './components/StickyHeader' // DISABLED: Causes black page
import Footer from './components/Footer'
import LazyAIChatbot from './components/LazyAIChatbot'
import OfflineIndicator from './components/OfflineIndicator'
import { PageSkeleton } from './components/PageSkeleton'
import PerformanceMonitor from './components/PerformanceMonitor'
import ScrollToTop from './components/ScrollToTop'
import SimpleNavigation from './components/SimpleNavigation'
import { ThemeProvider, useTheme } from './components/ThemeProvider'
import { AppLayout } from './components/app/AppLayout'
import { getClerkAppearance } from './config/clerkTheme'
import { useAuth } from './hooks/useAuth'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutEnterprise = lazy(() => import('./pages/CheckoutEnterprise'))
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
const Waitlist = lazy(() => import('./pages/auth/Waitlist'))
const WaitlistSuccess = lazy(() => import('./pages/auth/WaitlistSuccess'))
const ChatApp = lazy(() => import('./pages/app/Chat'))
const FilesApp = lazy(() => import('./pages/app/Files'))
const AnalyticsApp = lazy(() => import('./pages/app/Analytics'))
const EmailPreferences = lazy(() => import('./pages/app/EmailPreferences'))
const Security = lazy(() => import('./pages/Security'))

// Defer analytics until after initial paint (bundle-defer-third-party)
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
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

// PageLoader replaced by PageSkeleton for layout-based loading states
// See: components/PageSkeleton.tsx

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
    return <PageSkeleton />
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Component to handle hash fragment redirects for React Router 6.30.3+
const HashRedirect = ({ hash }: { hash: string }) => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/#${hash}`, { replace: true })
  }, [hash, navigate])

  return null
}

const AppRouter = () => {
  const location = useLocation()
  const hideMarketingChrome =
    location.pathname.startsWith('/app') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/waitlist')

  return (
    <>
      {!hideMarketingChrome && <SimpleNavigation />}
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-enterprise" element={<CheckoutEnterprise />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/about" element={<About />} />
          <Route path="/security" element={<Security />} />

          <Route path="/features" element={<HashRedirect hash="features" />} />
          <Route path="/pricing" element={<HashRedirect hash="pricing" />} />
          <Route path="/contact" element={<HashRedirect hash="contact" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/waitlist-success" element={<WaitlistSuccess />} />
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
            <Route path="settings/email" element={<EmailPreferences />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideMarketingChrome && <Footer />}
      <LazyAIChatbot />
    </>
  )
}

/**
 * ClerkProvider wrapper that uses dynamic theming
 * Must be inside ThemeProvider to access theme context
 */
const ThemedClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme()

  // Use preview/test key for localhost and Vercel preview deployments
  // Use production key for production deployment only
  const isPreview =
    import.meta.env.MODE === 'development' ||
    (typeof window !== 'undefined' &&
      window.location.hostname.includes('vercel.app'))

  const PUBLISHABLE_KEY = isPreview
    ? import.meta.env.VITE_CLERK_PREVIEW_PUBLISHABLE_KEY
    : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!PUBLISHABLE_KEY) {
    throw new Error(
      `Missing Clerk Publishable Key for ${isPreview ? 'preview' : 'production'} environment`
    )
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      waitlistUrl="/waitlist"
      appearance={getClerkAppearance(resolvedTheme)}
    >
      {children}
    </ClerkProvider>
  )
}

const App = () => (
  <ThemeProvider>
    <ThemedClerkProvider>
      <ErrorBoundary onError={handleAppError}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PerformanceMonitor />
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppRouter />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemedClerkProvider>
  </ThemeProvider>
)

export default App
