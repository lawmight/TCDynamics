import { useId } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu, Phone, Calendar, Mail, MapPin } from 'lucide-react'
import { useToggle } from '@/hooks/useToggle'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

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
    <div className="fixed top-4 right-4 z-50 md:hidden">
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
          className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-l border-primary/20"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-bold text-gradient">
              WorkFlowAI
            </SheetTitle>
            <p className="text-sm text-muted-foreground font-mono">
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
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="space-y-3 pt-6 border-t border-primary/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Actions rapides
              </h3>

              <Button
                variant="hero"
                className="w-full justify-start"
                onClick={() => scrollToSection('contact')}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Réserver une démo
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => scrollToSection('pricing')}
              >
                <Phone className="w-4 h-4 mr-3" />
                Voir les tarifs
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-6 border-t border-primary/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Contact direct
              </h3>

              <div className="space-y-2">
                <a
                  href="tel:0139447500"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">01 39 44 75 00</span>
                </a>

                <a
                  href="mailto:contact@workflowai.fr"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">
                    contact@workflowai.fr
                  </span>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
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
