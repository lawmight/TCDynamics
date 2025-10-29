import { ArrowUp, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const SimpleNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
      setShowBackToTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigationItems = [
    { label: 'Accueil', id: 'hero' },
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Comment ça marche', id: 'how-it-works' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'Contact', id: 'contact' },
  ]

  return (
    <>
      {/* Simple Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-sm border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="text-2xl font-bold text-primary hover:text-primary-glow transition-colors"
            >
              WorkFlowAI
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {location.pathname === '/' ? (
                <>
                  {navigationItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-foreground/80 hover:text-primary transition-colors py-2.5 px-0"
                    >
                      {item.label}
                    </button>
                  ))}
                  <Link
                    to="/connect/dashboard"
                    className="text-foreground/80 hover:text-primary transition-colors py-3 px-0"
                  >
                    Connect
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="text-foreground/80 hover:text-primary transition-colors py-1.5 px-0"
                  >
                    Home
                  </Link>
                  <Link
                    to="/connect/dashboard"
                    className="text-foreground/80 hover:text-primary transition-colors py-1.5 px-0"
                  >
                    Connect
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-3">
                {location.pathname === '/' ? (
                  navigationItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left py-2 text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <Link
                    to="/"
                    className="text-left py-2 text-foreground/80 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                )}
                <Link
                  to="/connect/dashboard"
                  className="text-left py-2 text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connect
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-glow transition-all duration-300"
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
