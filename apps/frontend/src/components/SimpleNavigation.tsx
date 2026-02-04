import { startTransition, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import ScrollProgressBar from '@/components/ScrollProgressBar'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import ArrowUp from '~icons/lucide/arrow-up'
import Menu from '~icons/lucide/menu'
import X from '~icons/lucide/x'

type NavigationItem =
  | { label: string; scrollId: string; path?: never }
  | { label: string; path: string; scrollId?: never }

// Prefetch route chunks on hover to reduce TTFB on navigation
const routePrefetchers: Record<string, () => Promise<unknown>> = {
  '/about': () => import('../pages/About'),
  '/demo': () => import('../pages/Demo'),
  '/get-started': () => import('../pages/GetStarted'),
  '/settings': () => import('../pages/Settings'),
  '/app': () => import('../pages/app/Chat'),
}

const prefetchRoute = (path?: string) => {
  if (!path) return
  const loader = routePrefetchers[path]
  if (loader) {
    loader().catch(() => {
      // Swallow prefetch failures; navigation will still work via normal load
    })
  }
}

const SimpleNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { isSignedIn } = useAuth()
  const { progress } = useScrollProgress()
  const appUrl = import.meta.env.VITE_APP_URL || '/app'
  const isExternalApp = appUrl.startsWith('http')
  const goToApp = () => {
    if (isExternalApp) {
      window.location.href = appUrl
      return
    }
    navigate(appUrl)
    setIsMobileMenuOpen(false)
  }
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      startTransition(() => {
        setIsScrolled(scrollTop > 50)
        setShowBackToTop(scrollTop > 300)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (item: NavigationItem) => {
    if (item.scrollId && location.pathname === '/') {
      const element = document.getElementById(item.scrollId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setIsMobileMenuOpen(false)
        return
      }
    }
    if (item.path) {
      navigate(item.path)
      setIsMobileMenuOpen(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigationItems = [
    { label: 'Accueil', scrollId: 'hero' },
    { label: 'Fonctionnalités', scrollId: 'features' },
    { label: 'Tarifs', scrollId: 'pricing-cards' },
    { label: 'À propos', path: '/about' },
    { label: 'Démo', path: '/demo' },
    { label: 'Démarrer', path: '/get-started' },
    ...(isSignedIn ? [{ label: 'Settings', path: '/settings' }] : []),
  ]

  // Avoid rendering duplicate nav items in tests/mobile by hiding desktop set when the mobile menu is open.
  const shouldShowDesktopNav = location.pathname === '/' && !isMobileMenuOpen

  return (
    <>
      {/* Scroll Progress Bar - Homepage only */}
      {location.pathname === '/' && <ScrollProgressBar progress={progress} />}

      {/* Simple Header */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300 ${
          isScrolled
            ? 'border-b border-border bg-background/95 backdrop-blur-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Link renders as <a> with native keyboard support */}
            <Link
              to={location.pathname === '/' ? '/#hero' : '/'}
              onClick={e => {
                if (location.pathname === '/') {
                  e.preventDefault()
                  handleNavClick({ label: 'Accueil', scrollId: 'hero' })
                }
              }}
              className="text-2xl font-bold text-primary transition-colors hover:text-primary-glow focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              TCDynamics
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-4 lg:flex">
              {shouldShowDesktopNav ? (
                <>
                  {navigationItems.map(item =>
                    item.path ? (
                      /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Link renders as focusable <a> with native keyboard support */
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => handleNavClick(item)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNavClick(item)
                          }
                        }}
                        className="px-0 py-2.5 text-foreground/80 transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onMouseEnter={() => prefetchRoute(item.path)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        href={`/#${item.scrollId}`}
                        onClick={e => {
                          if (location.pathname === '/') {
                            e.preventDefault()
                            handleNavClick(item)
                          }
                        }}
                        onKeyDown={e => {
                          if (
                            location.pathname === '/' &&
                            (e.key === 'Enter' || e.key === ' ')
                          ) {
                            e.preventDefault()
                            handleNavClick(item)
                          }
                        }}
                        className="px-0 py-2.5 text-foreground/80 transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onMouseEnter={() => prefetchRoute(item.path)}
                      >
                        {item.label}
                      </a>
                    )
                  )}
                  <button
                    onClick={goToApp}
                    onMouseEnter={() => !isExternalApp && prefetchRoute('/app')}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Accéder à l'app
                  </button>
                  {/* Theme Toggle - Desktop */}
                  <button
                    className="theme-toggle p-2 md:p-0"
                    onClick={() =>
                      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                    }
                    title="Toggle theme"
                    aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    <div className="sun-moon">
                      <div className="sun" />
                      <div className="moon" />
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="px-0 py-1.5 text-foreground/80 transition-colors hover:text-primary"
                  >
                    Home
                  </Link>
                  <button
                    onClick={goToApp}
                    onMouseEnter={() => !isExternalApp && prefetchRoute('/app')}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Accéder à l'app
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground transition-colors hover:text-primary lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
            <div className="container mx-auto p-4">
              <nav className="flex flex-col space-y-3">
                {location.pathname === '/' ? (
                  navigationItems.map(item =>
                    item.path ? (
                      /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Link renders as focusable <a> with native keyboard support */
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => handleNavClick(item)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNavClick(item)
                          }
                        }}
                        className="py-2 text-left text-foreground/80 transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onMouseEnter={() => prefetchRoute(item.path)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        href={`/#${item.scrollId}`}
                        onClick={e => {
                          e.preventDefault()
                          handleNavClick(item)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleNavClick(item)
                          }
                        }}
                        className="py-2 text-left text-foreground/80 transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onMouseEnter={() => prefetchRoute(item.path)}
                      >
                        {item.label}
                      </a>
                    )
                  )
                ) : (
                  /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
                  <Link
                    to="/"
                    className="py-2 text-left text-foreground/80 transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsMobileMenuOpen(false)
                      }
                    }}
                  >
                    Home
                  </Link>
                )}
                <button
                  onClick={goToApp}
                  className="mt-2 rounded-full bg-primary px-4 py-2 text-left text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  onMouseEnter={() => !isExternalApp && prefetchRoute('/app')}
                >
                  Accéder à l'app
                </button>
                {/* Theme Toggle - Mobile */}
                <button
                  className="theme-toggle mx-auto my-2 size-12 p-2"
                  onClick={() => {
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                    setIsMobileMenuOpen(false)
                  }}
                  title="Toggle theme"
                  aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <div className="sun-moon">
                    <div className="sun" />
                    <div className="moon" />
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-[background-color,border-color] duration-300 hover:bg-primary-glow"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Spacer to prevent content from hiding behind header */}
      <div className="h-16"></div>
    </>
  )
}

export default SimpleNavigation
