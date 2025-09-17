import {
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  ArrowRight,
  Zap,
  Brain,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: 'IA Documentaire',
      subtitle: 'TRAITEMENT INTELLIGENT',
      description:
        'Analysez automatiquement vos factures, contrats et documents légaux. Notre IA extrait les données clés en quelques secondes.',
      benefits: [
        '99.7% de précision',
        'Traitement en temps réel',
        'Export vers vos outils',
      ],
      color: 'primary',
      delay: '0s',
    },
    {
      icon: MessageSquare,
      title: 'Service Client IA',
      subtitle: 'SUPPORT AUTOMATISÉ',
      description:
        'Chatbots intelligents qui comprennent vos clients et résolvent 80% des demandes sans intervention humaine.',
      benefits: [
        '24h/7j disponible',
        'Multilingue FR/EN',
        'Escalade automatique',
      ],
      color: 'primary-glow',
      delay: '0.1s',
    },
    {
      icon: BarChart3,
      title: 'Analytics Métier',
      subtitle: 'BUSINESS INTELLIGENCE',
      description:
        'Tableaux de bord en temps réel pour piloter votre entreprise. KPIs automatiques et alertes intelligentes.',
      benefits: ['Prédictions IA', 'Alertes proactives', 'ROI mesurable'],
      color: 'primary',
      delay: '0.2s',
    },
    {
      icon: Shield,
      title: 'Conformité RGPD',
      subtitle: 'SÉCURITÉ GARANTIE',
      description:
        'Protection maximale de vos données. Audit automatique de conformité et chiffrement bancaire.',
      benefits: ['Hébergement France', 'Audit continu', 'Certification ISO'],
      color: 'primary-glow',
      delay: '0.3s',
    },
  ]

  return (
    <section className="relative py-20 lg:py-32 bg-background overflow-hidden">
      {/* Background Network Patterns */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/6 left-1/5 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        <div
          className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-primary-glow rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Subtle connection lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="process.env.API_URL || 'http://www.w3.org/2000/svg'"
        >
          <defs>
            <linearGradient
              id="features-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="hsl(284 100% 67%)" />
              <stop offset="100%" stopColor="hsl(142 76% 36%)" />
            </linearGradient>
          </defs>
          <line
            x1="20%"
            y1="16%"
            x2="50%"
            y2="33%"
            stroke="url(#features-gradient)"
            strokeWidth="1"
          />
          <line
            x1="75%"
            y1="66%"
            x2="50%"
            y2="33%"
            stroke="url(#features-gradient)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground fade-in-up">
            <Brain size={14} />
            INTELLIGENCE MODULES
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight fade-in-up-delay">
            Modules IA pour{' '}
            <span className="text-gradient">Entreprises Françaises</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto fade-in-up-delay-2">
            Solutions d'automatisation conçues spécifiquement pour les TPE/PME
            françaises.
            <span className="text-primary-glow">
              {' '}
              Conformité garantie, efficacité maximale.
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card/30 backdrop-blur-sm border border-border rounded-lg p-8 hover:bg-card/50 transition-all duration-500 hover:border-primary/30 fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              {/* Icon Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 bg-${feature.color}/20 rounded-lg flex items-center justify-center group-hover:bg-${feature.color}/30 transition-colors`}
                >
                  <feature.icon size={24} className={`text-${feature.color}`} />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {feature.subtitle}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                {feature.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 bg-${feature.color} rounded-full`}
                    ></div>
                    <span className="text-sm font-mono text-foreground">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hover indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                <Zap size={12} />
                <span>ACTIVER MODULE</span>
                <ArrowRight
                  size={12}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>

              {/* Background glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${feature.color}/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
              ></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-card/20 backdrop-blur-sm border border-border rounded-lg p-8 fade-in-up-delay-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock size={16} className="text-primary-glow" />
            <span className="text-sm font-mono text-muted-foreground">
              DONNÉES SÉCURISÉES EN FRANCE
            </span>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-4">
            Prêt à transformer votre entreprise ?
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" className="group font-mono">
              DÉMARRER L'ESSAI
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button variant="outline" size="lg" className="font-mono">
              PARLER À UN EXPERT
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
