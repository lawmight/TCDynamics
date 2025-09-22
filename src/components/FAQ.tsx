import React, { createContext, useContext, useState, useId } from 'react'

// Accordion Context for state management
interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider')
  }
  return context
}

// Main Accordion component
const Accordion = ({
  children,
  type = 'single',
  collapsible = true
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
      <div className="space-y-4" role="region" aria-label="Questions fréquentes">
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
      className={`${className} w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-controls={contentId}
      role="button"
      tabIndex={0}
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Wrench,
  HeadphonesIcon,
  Gift,
  Clock,
  Users,
  CheckCircle,
  Phone,
} from 'lucide-react'

const FAQ = () => {
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
        "WorkFlowAI s'intègre facilement avec vos outils actuels :",
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
        'Bien sûr ! Nous proposons plusieurs options pour découvrir WorkFlowAI :',
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
        '• **Starter 29€/mois** : Parfait pour les petites entreprises (1-10 utilisateurs)',
        "• **Professional 79€/mois** : Idéal pour les PME (jusqu'à 50 utilisateurs)",
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
        "WorkFlowAI s'adapte à la taille de votre équipe :",
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
    <section className="relative py-24 bg-gradient-to-b from-background/50 to-background overflow-hidden">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 w-full h-full"
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <Badge
            variant="outline"
            className="border-primary/40 text-primary font-mono mb-6"
          >
            Questions fréquentes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Vos questions, nos réponses
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            Tout ce que vous devez savoir sur WorkFlowAI avant de commencer
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Card
            className="bg-card/60 backdrop-blur-sm border-primary/20 p-8 fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {allFaqs.map(faq => {
                const IconComponent = faq.icon
                return (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-primary/10 rounded-lg px-6 py-2 hover:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger value={faq.id} className="text-left hover:no-underline group py-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {faq.question}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="text-xs font-mono bg-primary/10 text-primary border-primary/20"
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
                                className="text-muted-foreground leading-relaxed"
                              >
                                {parts.map((part, partIndex) =>
                                  partIndex % 2 === 1 ? (
                                    <strong
                                      key={partIndex}
                                      className="text-foreground font-semibold"
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
                              className="text-muted-foreground leading-relaxed"
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
          className="text-center mt-12 fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-primary/20 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Une autre question ?</h3>
            </div>
            <p className="text-muted-foreground mb-6 font-mono">
              Notre équipe française est là pour vous répondre
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  📞 01 39 44 75 00
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  ✉️ contact@workflowai.fr
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
