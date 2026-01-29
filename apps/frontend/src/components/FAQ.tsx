import React, { createContext, useContext, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Gift from '~icons/lucide/gift'
import HeadphonesIcon from '~icons/lucide/headphones'
import Phone from '~icons/lucide/phone'
import Shield from '~icons/lucide/shield'
import Users from '~icons/lucide/users'
import Wrench from '~icons/lucide/wrench'

// Accordion Context for state management
interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error(
      'Accordion components must be used within an Accordion provider'
    )
  }
  return context
}

// Main Accordion component
const Accordion = ({
  children,
  type = 'single',
  collapsible = true,
}: {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  collapsible?: boolean
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (type === 'single') {
        // Single mode: close all others
        if (newSet.has(value)) {
          if (collapsible) {
            newSet.delete(value)
          }
        } else {
          newSet.clear()
          newSet.add(value)
        }
      } else {
        // Multiple mode: toggle individual items
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          newSet.add(value)
        }
      }
      return newSet
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div
        className="space-y-4"
        role="region"
        aria-label="Questions fréquentes"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) => (
  <div className={className} data-value={value}>
    {children}
  </div>
)

const AccordionTrigger = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const { openItems, toggleItem } = useAccordion()
  const isOpen = openItems.has(value)
  const triggerId = useId()
  const contentId = `accordion-content-${value}`

  const handleClick = () => {
    toggleItem(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleItem(value)
    }
  }

  return (
    <button
      id={triggerId}
      className={`${className} flex w-full items-center justify-between rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-controls={contentId}
      type="button"
    >
      {children}
      <svg
        className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
}

const AccordionContent = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const { openItems } = useAccordion()
  const isOpen = openItems.has(value)
  const contentId = `accordion-content-${value}`

  return (
    <div
      id={contentId}
      className={`${className} overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
      role="region"
      aria-labelledby={`accordion-trigger-${value}`}
    >
      <div className="pb-4 pt-2">{children}</div>
    </div>
  )
}

const FAQ = () => {
  const { ref: sectionRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  })

  // Hidden state before scroll reveal
  const hiddenClass = 'opacity-0 translate-y-6'

  const faqs = [
    {
      id: 'security',
      icon: Shield,
      question: 'Vos données sont-elles sécurisées ?',
      badge: 'Sécurité',
      answer: [
        'Absolument. La sécurité de vos données est notre priorité absolue :',
        '• **Hébergement français** : Nos serveurs sont situés en France (Paris et Lille)',
        '• **Chiffrement AES-256** : Toutes vos données sont chiffrées en transit et au repos',
        '• **Conformité RGPD** : Respect total du règlement européen sur la protection des données',
        '• **Certifications** : ISO 27001, SOC 2 Type II, et audits de sécurité réguliers',
        '• **Sauvegarde** : Sauvegardes automatiques quotidiennes avec rétention 30 jours',
        "• **Accès contrôlé** : Authentification multi-facteurs et gestion des droits d'accès",
      ],
    },
    {
      id: 'integration',
      icon: Wrench,
      question: 'Comment intégrer avec nos outils existants ?',
      badge: 'Intégration',
      answer: [
        "TCDynamics s'intègre facilement avec vos outils actuels :",
        '• **Connecteurs natifs** : Office 365, Google Workspace, Salesforce, HubSpot',
        '• **APIs REST** : Plus de 200 intégrations disponibles via notre marketplace',
        '• **Import de données** : Migration assistée depuis vos fichiers Excel, CSV, PDF',
        '• **Webhooks** : Synchronisation en temps réel avec vos systèmes métier',
        '• **Formation incluse** : Notre équipe vous accompagne dans la mise en place',
        "• **Support technique** : Assistance dédiée pendant toute la phase d'intégration",
        '• **Temps de déploiement** : Généralement 24-48h pour une configuration standard',
      ],
    },
    {
      id: 'support',
      icon: HeadphonesIcon,
      question: 'Quel support technique proposez-vous ?',
      badge: 'Support',
      answer: [
        'Notre support technique français est disponible quand vous en avez besoin :',
        '• **Équipe francophone** : Support 100% en français par des experts locaux',
        '• **Horaires étendus** : Lundi-Vendredi 8h-19h, Samedi 9h-17h',
        '• **Canaux multiples** : Téléphone, chat, email, visioconférence',
        '• **Intervention sur site** : Possible dans la région Île-de-France',
        '• **Documentation complète** : Base de connaissances, tutoriels vidéo, FAQ',
        '• **Formation personnalisée** : Sessions individuelles ou en groupe',
        '• **Temps de réponse** : Moins de 2h en moyenne, 30min pour les urgences',
      ],
    },
    {
      id: 'trial',
      icon: Gift,
      question: 'Puis-je essayer gratuitement ?',
      badge: 'Essai gratuit',
      answer: [
        'Bien sûr ! Nous proposons plusieurs options pour découvrir TCDynamics :',
        '• **Essai gratuit 30 jours** : Accès complet sans engagement ni carte bancaire',
        '• **Démonstration personnalisée** : Présentation adaptée à vos besoins (1h)',
        '• **Environnement de test** : Testez avec vos propres données en toute sécurité',
        "• **Support pendant l'essai** : Accompagnement complet de notre équipe",
        '• **Migration des données** : Import gratuit de vos données existantes',
        '• **Formation incluse** : Sessions de prise en main personnalisées',
        "• **Pas d'engagement** : Résiliation possible à tout moment sans frais",
      ],
    },
  ]

  const additionalFaqs = [
    {
      id: 'pricing',
      icon: Clock,
      question: 'Quels sont vos tarifs et conditions ?',
      badge: 'Tarifs',
      answer: [
        'Nos tarifs sont transparents et adaptés aux entreprises françaises :',
        '• **Starter 29$/mois** : Parfait pour les petites entreprises (1-10 utilisateurs)',
        "• **Professional 79$/mois** : Idéal pour les PME (jusqu'à 50 utilisateurs)",
        '• **Enterprise sur mesure** : Solutions personnalisées pour les grandes entreprises',
        "• **Facturation mensuelle** : Pas d'engagement annuel obligatoire",
        "• **Réduction annuelle** : -20% sur les abonnements payés à l'année",
        '• **Formation incluse** : Prise en main gratuite avec tous les plans',
      ],
    },
    {
      id: 'team',
      icon: Users,
      question: "Combien d'utilisateurs peuvent utiliser la plateforme ?",
      badge: 'Utilisateurs',
      answer: [
        "TCDynamics s'adapte à la taille de votre équipe :",
        "• **Gestion flexible** : Ajout/suppression d'utilisateurs en quelques clics",
        '• **Rôles personnalisés** : Administrateur, utilisateur, invité, consultant',
        '• **Droits granulaires** : Contrôle précis des accès par département/projet',
        '• **Facturation proportionnelle** : Payez uniquement pour les utilisateurs actifs',
        '• **Comptes invités** : Collaboration gratuite avec vos partenaires externes',
        "• **Single Sign-On** : Connexion simplifiée via votre annuaire d'entreprise",
      ],
    },
  ]

  const allFaqs = [...faqs, ...additionalFaqs]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-background/50 to-background py-24"
    >
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="faq-network"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="30"
                cy="30"
                r="1.5"
                fill="hsl(var(--primary))"
                opacity="0.4"
              />
              <path
                d="M30,30 L60,0 M30,30 L60,60 M30,30 L0,60"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-network)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div
          className={`mb-16 text-center ${hasIntersected ? 'fade-in-up' : hiddenClass}`}
        >
          <Badge
            variant="outline"
            className="mb-6 border-primary/40 font-mono text-primary"
          >
            Questions fréquentes
          </Badge>
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Vos questions, nos réponses
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Tout ce que vous devez savoir sur TCDynamics avant de commencer
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-4xl">
          <Card
            className={`border-primary/20 bg-card/60 p-8 backdrop-blur-sm ${hasIntersected ? 'fade-in-up fade-delay-02' : hiddenClass}`}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {allFaqs.map(faq => {
                const IconComponent = faq.icon
                return (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="rounded-lg border border-primary/10 px-6 py-2 transition-colors hover:border-primary/30"
                  >
                    <AccordionTrigger
                      value={faq.id}
                      className="group py-6 text-left hover:no-underline"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="shrink-0 rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                          <IconComponent className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-3">
                            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                              {faq.question}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="border-primary/20 bg-primary/10 font-mono text-xs text-primary"
                            >
                              {faq.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent value={faq.id} className="pb-6 pt-2">
                      <div className="ml-14 space-y-3">
                        {faq.answer.map((line, lineIndex) => {
                          if (line.includes('**')) {
                            // Handle bold text
                            const parts = line.split('**')
                            return (
                              <p
                                key={lineIndex}
                                className="leading-relaxed text-muted-foreground"
                              >
                                {parts.map((part, partIndex) =>
                                  partIndex % 2 === 1 ? (
                                    <strong
                                      key={partIndex}
                                      className="font-semibold text-foreground"
                                    >
                                      {part}
                                    </strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </p>
                            )
                          }
                          return (
                            <p
                              key={lineIndex}
                              className="leading-relaxed text-muted-foreground"
                            >
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </Card>
        </div>

        {/* Contact CTA */}
        <div
          className={`mt-12 text-center ${hasIntersected ? 'fade-in-up fade-delay-04' : hiddenClass}`}
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card/30 p-8 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Phone className="size-6 text-primary" />
              <h3 className="text-xl font-bold">Une autre question ?</h3>
            </div>
            <p className="mb-6 font-mono text-muted-foreground">
              Notre équipe française est là pour vous répondre
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <CheckCircle className="size-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  📞 01 39 44 75 00
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <CheckCircle className="size-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  ✉️ contact@tcdynamics.fr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
