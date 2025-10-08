import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import StickyHeader from '../StickyHeader'

// Mock the hooks and icons
vi.mock('@/hooks/useToggle', () => ({
  useToggle: () => ({
    isOpen: false,
    toggle: vi.fn(),
    close: vi.fn(),
  }),
}))

vi.mock('@/hooks/useThrottle', () => ({
  useThrottle: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon">Cart</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">Close</div>,
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('StickyHeader Component', () => {
  let scrollSpy: any

  beforeEach(() => {
    // Mock window.scrollY and scroll event
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })

    scrollSpy = vi.spyOn(window, 'addEventListener')
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderStickyHeader = () => {
    return render(
      <MemoryRouter>
        <StickyHeader />
      </MemoryRouter>
    )
  }

  it('should render logo and navigation', () => {
    renderStickyHeader()

    expect(screen.getByText('TCDynamics')).toBeInTheDocument()
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalités')).toBeInTheDocument()
    expect(screen.getByText('Comment ça marche')).toBeInTheDocument()
    expect(screen.getByText('Avantages locaux')).toBeInTheDocument()
    expect(screen.getByText('Tarifs')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should render checkout button', () => {
    renderStickyHeader()

    const checkoutButton = screen.getByRole('button', {
      name: /voir les tarifs/i,
    })
    expect(checkoutButton).toBeInTheDocument()
    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument()
  })

  it('should render mobile menu button', () => {
    renderStickyHeader()

    const mobileMenuButton = screen.getByLabelText(
      /ouvrir le menu de navigation/i
    )
    expect(mobileMenuButton).toBeInTheDocument()
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
  })

  it('should handle logo click to scroll to hero section', () => {
    renderStickyHeader()

    const logoButton = screen.getByText('TCDynamics')
    const mockScrollIntoView = vi.fn()

    // Mock getElementById and scrollIntoView
    const mockElement = { scrollIntoView: mockScrollIntoView }
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    fireEvent.click(logoButton)

    expect(document.getElementById).toHaveBeenCalledWith('hero')
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should handle navigation item clicks', () => {
    renderStickyHeader()

    const featuresButton = screen.getByText('Fonctionnalités')
    const mockScrollIntoView = vi.fn()

    const mockElement = { scrollIntoView: mockScrollIntoView }
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    fireEvent.click(featuresButton)

    expect(document.getElementById).toHaveBeenCalledWith('features')
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should handle checkout button click', () => {
    renderStickyHeader()

    const checkoutButton = screen.getByRole('button', {
      name: /voir les tarifs/i,
    })
    fireEvent.click(checkoutButton)

    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })

  it('should update scrolled state on scroll', async () => {
    renderStickyHeader()

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
      expect(header).toHaveClass('bg-background/80', 'backdrop-blur-xl')
    })
  })

  it('should handle mobile menu toggle', () => {
    // Mock useToggle to return controlled state
    const mockToggle = vi.fn()
    vi.mocked(vi.importMock('@/hooks/useToggle')).mockReturnValue({
      isOpen: false,
      toggle: mockToggle,
      close: vi.fn(),
    })

    renderStickyHeader()

    const mobileMenuButton = screen.getByLabelText(
      /ouvrir le menu de navigation/i
    )
    fireEvent.click(mobileMenuButton)

    expect(mockToggle).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    renderStickyHeader()

    const mobileMenuButton = screen.getByLabelText(
      /ouvrir le menu de navigation/i
    )
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    expect(mobileMenuButton).toHaveAttribute('aria-controls')
  })

  it('should render mobile menu when open', () => {
    // Mock useToggle to return open state
    vi.mocked(vi.importMock('@/hooks/useToggle')).mockReturnValue({
      isOpen: true,
      toggle: vi.fn(),
      close: vi.fn(),
    })

    renderStickyHeader()

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Menu de navigation mobile')
    ).toBeInTheDocument()
  })

  it('should add scroll event listener on mount', () => {
    renderStickyHeader()

    expect(scrollSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    })
  })

  it('should cleanup scroll event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderStickyHeader()

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    )
  })
})
