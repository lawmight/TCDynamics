import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SimpleNavigation from '../SimpleNavigation'

import { ThemeProvider } from '@/components/ThemeProvider'
import { renderWithClerk } from '@/test/utils'

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual('@clerk/clerk-react')
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      isSignedIn: false,
      isLoaded: true,
      user: null,
      userId: null,
      getToken: vi.fn(() => Promise.resolve(null)),
      signOut: vi.fn(() => Promise.resolve()),
    })),
    useUser: vi.fn(() => ({
      isSignedIn: false,
      isLoaded: true,
      user: null,
    })),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})

describe('SimpleNavigation Component', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn> | null = null

  beforeEach(() => {
    // Mock window.scrollY and scroll event
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })

    scrollSpy = vi.spyOn(window, 'addEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderSimpleNavigation = () =>
    renderWithClerk(
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <SimpleNavigation />
      </ThemeProvider>
    )

  it('should render logo and navigation items', () => {
    renderSimpleNavigation()

    expect(screen.getByText('WorkFlowAI')).toBeInTheDocument()
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalités')).toBeInTheDocument()
    expect(screen.getByText('Tarifs')).toBeInTheDocument()
    expect(screen.getByText('À propos')).toBeInTheDocument()
    expect(screen.getByText('Démo')).toBeInTheDocument()
    expect(screen.getByText('Démarrer')).toBeInTheDocument()
  })

  it('should render mobile menu button', () => {
    renderSimpleNavigation()

    const mobileMenuButton = screen.getByRole('button', { name: /Toggle menu/i })
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('should handle logo click to scroll to hero section', () => {
    renderSimpleNavigation()

    const logoButton = screen.getByText('WorkFlowAI')
    const mockScrollIntoView = vi.fn()

    // Mock getElementById and scrollIntoView
    const mockElement = { scrollIntoView: mockScrollIntoView } as HTMLElement
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

    fireEvent.click(logoButton)

    expect(document.getElementById).toHaveBeenCalledWith('hero')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should handle navigation item clicks', () => {
    renderSimpleNavigation()

    const featuresButton = screen.getByText('Fonctionnalités')
    const mockScrollIntoView = vi.fn()

    const mockElement = { scrollIntoView: mockScrollIntoView } as HTMLElement
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

    fireEvent.click(featuresButton)

    expect(document.getElementById).toHaveBeenCalledWith('features')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should toggle mobile menu on button click', () => {
    renderSimpleNavigation()

    const mobileMenuButton = screen.getByRole('button', { name: /Toggle menu/i })

    // Initially closed: one "Accéder à l'app" (desktop only)
    expect(screen.getAllByText(/Accéder à l'app/i)).toHaveLength(1)

    // Open mobile menu: mobile panel adds a second "Accéder à l'app"
    fireEvent.click(mobileMenuButton)

    expect(screen.getAllByText(/Accéder à l'app/i)).toHaveLength(2)
  })

  it('should render mobile menu when open', () => {
    renderSimpleNavigation()

    const mobileMenuButton = screen.getByLabelText('Toggle menu')

    // Open mobile menu
    fireEvent.click(mobileMenuButton)

    // Should show mobile menu navigation
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalités')).toBeInTheDocument()
  })

  it('should close mobile menu when navigation item is clicked', () => {
    renderSimpleNavigation()

    const mobileMenuButton = screen.getByRole('button', { name: /Toggle menu/i })

    // Open mobile menu
    fireEvent.click(mobileMenuButton)

    // Click on a navigation item
    const featuresButton = screen.getByText('Fonctionnalités')
    fireEvent.click(featuresButton)

    // Menu should close: back to one "Accéder à l'app" (desktop only)
    expect(screen.getAllByText(/Accéder à l'app/i)).toHaveLength(1)
  })

  it('should update scrolled state on scroll', async () => {
    renderSimpleNavigation()

    const header = screen.getByRole('banner')

    // Initially not scrolled
    expect(header).toHaveClass('bg-transparent')

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    })

    fireEvent.scroll(window)

    await waitFor(() => {
      expect(header).toHaveClass('bg-background/95', 'backdrop-blur-sm')
    })
  })

  it('should show back to top button when scrolled past threshold', async () => {
    renderSimpleNavigation()

    // Initially no back to top button
    expect(screen.queryByRole('button', { name: /Back to top/i })).not.toBeInTheDocument()

    // Simulate scroll past 300px
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400,
    })

    fireEvent.scroll(window)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Back to top/i })).toBeInTheDocument()
    })
  })

  it('should handle back to top button click', () => {
    renderSimpleNavigation()

    // Mock scrollTo
    const mockScrollTo = vi.fn()
    window.scrollTo = mockScrollTo

    // First scroll to show the button
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400,
    })

    fireEvent.scroll(window)

    const backToTopButton = screen.getByLabelText('Back to top')
    fireEvent.click(backToTopButton)

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('should add scroll event listener on mount', () => {
    renderSimpleNavigation()

    expect(scrollSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    )
  })

  it('should cleanup scroll event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderSimpleNavigation()

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    )
  })

  it('should have proper accessibility attributes for mobile menu button', () => {
    renderSimpleNavigation()

    const mobileMenuButton = screen.getByLabelText('Toggle menu')
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('should have proper accessibility attributes for back to top button', async () => {
    renderSimpleNavigation()

    // Scroll to show back to top button
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400,
    })

    fireEvent.scroll(window)

    await waitFor(() => {
      const backToTopButton = screen.getByLabelText('Back to top')
      expect(backToTopButton).toBeInTheDocument()
    })
  })
})
