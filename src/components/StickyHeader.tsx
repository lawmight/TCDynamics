import React, { useState, useEffect, useId, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useToggle } from '@/hooks/useToggle'
import { useThrottle } from '@/hooks/useThrottle'

const StickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useToggle()
  const mobileMenuId = useId()

  const navigationItems = [
    { label: 'Accueil', id: 'hero' },
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Comment ça marche', id: 'how-it-works' },
    { label: 'Avantages locaux', id: 'local-advantages' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'Contact', id: 'contact' },
  ]

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    setIsScrolled(scrollTop > 50)
  }, [])

  // Throttle scroll events to improve performance
  const throttledScrollHandler = useThrottle(handleScroll, 100)

  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', throttledScrollHandler)
  }, [throttledScrollHandler])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    closeMobileMenu()
  }

  const handleCheckoutClick = () => {
    scrollToSection('pricing')
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-2xl font-bold font-mono text-gradient hover:scale-105 transition-transform duration-300"
              >
                TCDynamics
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.slice(0, -1).map(item => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="relative px-4 py-2 text-sm font-mono text-foreground/80 hover:text-foreground hover:bg-primary/5 rounded-full transition-all duration-300 group"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                </Button>
              ))}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckoutClick}
                className="ml-4 px-6 py-2 bg-gradient-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 button-hover-scale font-medium"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Voir les tarifs
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-primary/5"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-label={isMobileMenuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            id={mobileMenuId}
            className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-primary/10 shadow-xl"
            role="menu"
            aria-label="Menu de navigation mobile"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col space-y-3">
                {navigationItems.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => scrollToSection(item.id)}
                    className="justify-start px-4 py-3 text-left font-mono text-foreground/80 hover:text-foreground hover:bg-primary/5 rounded-xl transition-all duration-300"
                    role="menuitem"
                  >
                    {item.label}
                  </Button>
                ))}

                {/* Mobile Checkout Button */}
                <Button
                  onClick={handleCheckoutClick}
                  className="mt-4 w-full px-6 py-3 bg-gradient-primary text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 button-hover-scale font-medium"
                  role="menuitem"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Voir les tarifs
                </Button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding behind header */}
      <div className="h-16 lg:h-20"></div>
    </>
  )
}

export default StickyHeader
