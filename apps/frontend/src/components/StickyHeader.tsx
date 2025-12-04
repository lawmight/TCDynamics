import { ShoppingCart, Menu, X } from 'lucide-react'
import React, { useState, useEffect, useId, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useThrottle } from '@/hooks/useThrottle'
import { useToggle } from '@/hooks/useToggle'

const StickyHeader = () => {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const {
    isOpen: isMobileMenuOpen,
    toggle: toggleMobileMenu,
    close: closeMobileMenu,
  } = useToggle()
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
    navigate('/checkout')
  }

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'border-b border-primary/10 bg-background/80 shadow-lg shadow-primary/5 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gradient font-mono text-2xl font-bold transition-transform duration-300 hover:scale-105"
              >
                TCDynamics
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-2 lg:flex">
              {navigationItems.slice(0, -1).map(item => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="group relative rounded-full px-4 py-2 font-mono text-sm text-foreground/80 transition-all duration-300 hover:bg-primary/5 hover:text-foreground"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 rounded-full bg-gradient-primary transition-transform duration-300 group-hover:scale-x-100"></span>
                </Button>
              ))}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckoutClick}
                className="button-hover-scale ml-4 rounded-full bg-gradient-primary px-6 py-2 font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Voir les tarifs
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/5 lg:hidden"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-label={
                isMobileMenuOpen
                  ? 'Fermer le menu de navigation'
                  : 'Ouvrir le menu de navigation'
              }
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            id={mobileMenuId}
            className="absolute left-0 right-0 top-full border-b border-primary/10 bg-background/95 shadow-xl backdrop-blur-xl lg:hidden"
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
                    className="justify-start rounded-xl px-4 py-3 text-left font-mono text-foreground/80 transition-all duration-300 hover:bg-primary/5 hover:text-foreground"
                    role="menuitem"
                  >
                    {item.label}
                  </Button>
                ))}

                {/* Mobile Checkout Button */}
                <Button
                  onClick={handleCheckoutClick}
                  className="button-hover-scale mt-4 w-full rounded-xl bg-gradient-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  role="menuitem"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
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
