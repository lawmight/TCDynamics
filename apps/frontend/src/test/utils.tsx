import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

// Reusable QueryClient for tests (no retries, fast failures)
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

// Mock Clerk publishable key for tests
const MOCK_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key'

/**
 * Render component with ClerkProvider wrapper
 * Use for components that use Clerk authentication hooks
 * Note: Clerk must be mocked in the test file using vi.mock('@clerk/clerk-react')
 */
export function renderWithClerk(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClerkProvider publishableKey={MOCK_CLERK_PUBLISHABLE_KEY}>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    </ClerkProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render component with QueryClientProvider wrapper
 * Use for components that use React Query
 */
export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render component with all providers (Clerk + QueryClient + Router)
 * Use for complex components requiring multiple providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClerkProvider publishableKey={MOCK_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ClerkProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}
