import { Menu, Phone, Calendar, Mail, MapPin } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useToggle } from '@/hooks/useToggle'

const MobileNavigation = () => {
  const { isOpen, toggle, close } = useToggle()
  const panelId = useId()

  // Prevent background scrolling when mobile menu is open
  useBodyScrollLock(isOpen)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      close()
    }
  }

  const navigationItems = [
    { label: 'Accueil', id: 'hero' },
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Comment ça marche', id: 'how-it-works' },
    { label: 'Avantages locaux', id: 'local-advantages' },
    { label: 'Témoignages', id: 'social-proof' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contact', id: 'contact' },
  ]

  return (
    <div className="fixed right-4 top-4 z-50 md:hidden">
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetTrigger asChild>
          <Button
            variant="hero-outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg backdrop-blur-md"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={
              isOpen
                ? 'Fermer le menu de navigation'
                : 'Ouvrir le menu de navigation'
            }
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          id={panelId}
          side="right"
          className="w-full border-l border-primary/20 bg-background/95 backdrop-blur-xl sm:max-w-md"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-gradient text-2xl font-bold">
              WorkFlowAI
            </SheetTitle>
            <p className="font-mono text-sm text-muted-foreground">
              Automatisation IA française
            </p>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Navigation Links */}
            <nav className="space-y-3">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="group w-full rounded-lg px-4 py-3 text-left transition-colors hover:bg-primary/10"
                >
                  <span className="font-medium transition-colors group-hover:text-primary">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="space-y-3 border-t border-primary/20 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Actions rapides
              </h3>

              <Button
                variant="hero"
                className="w-full justify-start"
                onClick={() => scrollToSection('contact')}
              >
                <Calendar className="mr-3 h-4 w-4" />
                Réserver une démo
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => scrollToSection('pricing')}
              >
                <Phone className="mr-3 h-4 w-4" />
                Voir les tarifs
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 border-t border-primary/20 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact direct
              </h3>

              <div className="space-y-2">
                <a
                  href="tel:0139447500"
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary/10"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">01 39 44 75 00</span>
                </a>

                <a
                  href="mailto:contact@workflowai.fr"
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary/10"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">
                    contact@workflowai.fr
                  </span>
                </a>

                <div className="flex items-center gap-3 rounded-lg p-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">
                    Montigny-le-Bretonneux
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNavigation
