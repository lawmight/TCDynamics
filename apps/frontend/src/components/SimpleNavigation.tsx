import { ArrowUp, Menu, X, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useTheme } from '@/components/ThemeProvider'

const SimpleNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
      setShowBackToTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (item: any) => {
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

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // If on home page, scroll to hero section
      handleNavClick({ scrollId: 'hero' })
    } else {
      // If on any other page, navigate to home
      navigate('/')
    }
  }

  const navigationItems = [
    { label: 'Accueil', scrollId: 'hero' },
    { label: 'Fonctionnalités', scrollId: 'features' },
    { label: 'Tarifs', scrollId: 'pricing' },
    { label: 'À propos', path: '/about' },
    { label: 'Démo', path: '/demo' },
    { label: 'Démarrer', path: '/get-started' },
  ]

  return (
    <>
      {/* Simple Header */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border bg-background/95 backdrop-blur-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="text-2xl font-bold text-primary transition-colors hover:text-primary-glow"
            >
              WorkFlowAI
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 md:flex">
              {location.pathname === '/' ? (
                <>
                  {navigationItems.map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item)}
                      className="px-0 py-2.5 text-foreground/80 transition-colors hover:text-primary"
                    >
                      {item.label}
                    </button>
                  ))}
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
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground transition-colors hover:text-primary md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-3">
                {location.pathname === '/' ? (
                  navigationItems.map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item)}
                      className="py-2 text-left text-foreground/80 transition-colors hover:text-primary"
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <Link
                    to="/"
                    className="py-2 text-left text-foreground/80 transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyDown={e =>
                      e.key === 'Enter' && setIsMobileMenuOpen(false)
                    }
                  >
                    Home
                  </Link>
                )}
                {}
                {/* Theme Toggle - Mobile */}
                <button
                  className="theme-toggle mx-auto my-2 h-12 w-12 p-2"
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
          className="fixed bottom-6 left-6 z-50 rounded-full bg-primary p-3 text-white shadow-lg transition-all duration-300 hover:bg-primary-glow"
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
