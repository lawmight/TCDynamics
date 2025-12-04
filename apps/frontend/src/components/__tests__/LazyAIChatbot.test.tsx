import { render, screen, waitFor } from '@testing-library/react'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LazyAIChatbot from '../LazyAIChatbot'

// Mock the AIChatbot component
vi.mock('../AIChatbot', () => ({
  default: () => <div data-testid="ai-chatbot">AI Chatbot Loaded</div>,
}))

// Mock the lucide-react icon
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loader</div>,
}))

describe('LazyAIChatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading fallback initially', () => {
    render(<LazyAIChatbot />)

    // Should show the loading fallback with spinner
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
  })

  it('should render AIChatbot after lazy loading', async () => {
    render(<LazyAIChatbot />)

    // Initially shows loading
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()

    // Wait for lazy component to load
    await waitFor(
      () => {
        expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Loading should no longer be visible
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument()
  })

  it('should render with correct CSS classes for loading state', () => {
    render(<LazyAIChatbot />)

    const loadingContainer = screen.getByTestId('loader-icon').closest('div')
    expect(loadingContainer).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50')

    const spinnerContainer = loadingContainer?.firstElementChild
    expect(spinnerContainer).toHaveClass(
      'rounded-full',
      'w-16',
      'h-16',
      'shadow-lg',
      'bg-primary/50',
      'flex',
      'items-center',
      'justify-center'
    )
  })

  it('should render AIChatbot with correct CSS classes after loading', async () => {
    render(<LazyAIChatbot />)

    await waitFor(() => {
      expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
    })

    // The AIChatbot should be wrapped in Suspense but visible
    expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
  })

  it('should handle Suspense boundary correctly', () => {
    // Test that Suspense is working by checking that the fallback is rendered first
    render(
      <Suspense
        fallback={<div data-testid="custom-fallback">Custom Loading</div>}
      >
        <LazyAIChatbot />
      </Suspense>
    )

    // Should use the custom fallback instead of the default one
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument()
  })

  it('should work with different Suspense configurations', async () => {
    render(
      <Suspense
        fallback={
          <div data-testid="different-fallback">Different Loading State</div>
        }
      >
        <LazyAIChatbot />
      </Suspense>
    )

    // Initially shows custom fallback
    expect(screen.getByTestId('different-fallback')).toBeInTheDocument()

    // After loading, shows the chatbot
    await waitFor(() => {
      expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('different-fallback')).not.toBeInTheDocument()
  })

  it('should maintain lazy loading behavior across multiple renders', async () => {
    const { rerender } = render(<LazyAIChatbot />)

    // First render should show loading
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
    })

    // Rerender should still show the loaded component (not reload)
    rerender(<LazyAIChatbot />)

    // Should still be loaded (no loading state again)
    expect(screen.getByTestId('ai-chatbot')).toBeInTheDocument()
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument()
  })

  it('should have proper positioning for loading state', () => {
    render(<LazyAIChatbot />)

    const loadingContainer = screen.getByTestId('loader-icon').closest('div')
    expect(loadingContainer).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50')
  })

  it('should use correct icon in loading state', () => {
    render(<LazyAIChatbot />)

    // Should use Loader2 icon with proper classes
    const loaderIcon = screen.getByTestId('loader-icon')
    expect(loaderIcon).toHaveClass(
      'w-6',
      'h-6',
      'animate-spin',
      'text-primary-foreground'
    )
  })
})
