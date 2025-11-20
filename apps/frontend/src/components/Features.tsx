import { ArrowRight, Brain, Lock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { featureModules } from '@/data/productHighlights'

const Features = () => {
  const navigate = useNavigate()

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Color variant mappings for Tailwind purging
  const colorVariants = {
    primary: {
      bg: 'bg-primary/20',
      bgHover: 'group-hover:bg-primary/30',
      text: 'text-primary',
      bullet: 'bg-primary',
      gradient: 'from-primary/5',
    },
    'primary-glow': {
      bg: 'bg-primary-glow/20',
      bgHover: 'group-hover:bg-primary-glow/30',
      text: 'text-primary-glow',
      bullet: 'bg-primary-glow',
      gradient: 'from-primary-glow/5',
    },
  } as const

  // Delay class mappings
  const delayClasses = {
    '0s': 'fade-delay-00',
    '0.1s': 'fade-delay-01',
    '0.2s': 'fade-delay-02',
    '0.3s': 'fade-delay-03',
  } as const

  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Background Network Patterns */}
      <div className="absolute inset-0 opacity-40">
        <div className="top-1/6 left-1/5 absolute h-1 w-1 animate-pulse rounded-full bg-primary"></div>
        <div className="fade-delay-20 absolute right-1/4 top-2/3 h-1.5 w-1.5 animate-pulse rounded-full bg-primary-glow"></div>
        <div className="fade-delay-10 absolute bottom-1/3 left-1/2 h-1 w-1 animate-pulse rounded-full bg-primary"></div>

        {/* Subtle connection lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
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

      <div className="container relative z-10 mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 space-y-6 text-center">
          <div className="fade-in-up inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
            <Brain size={14} aria-hidden="true" />
            INTELLIGENCE MODULES
          </div>

          <h2 className="fade-in-up-delay text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
            Modules IA pour{' '}
            <span className="text-gradient">Entreprises Françaises</span>
          </h2>

          <p className="fade-in-up-delay-2 mx-auto max-w-3xl text-xl text-muted-foreground">
            Solutions d'automatisation conçues spécifiquement pour les TPE/PME
            françaises.
            <span className="text-primary-glow">
              {' '}
              Conformité garantie, efficacité maximale.
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          {featureModules.map((feature, index) => {
            const colors =
              colorVariants[feature.color as keyof typeof colorVariants]
            const delayClass =
              delayClasses[feature.delay as keyof typeof delayClasses]

            return (
              <div
                key={index}
                className={`fade-in-up group relative rounded-lg border border-border bg-card/30 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 ${delayClass}`}
              >
                {/* Icon Header */}
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`h-12 w-12 ${colors.bg} flex items-center justify-center rounded-lg ${colors.bgHover} transition-colors`}
                  >
                    <feature.icon
                      size={24}
                      className={colors.text}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {feature.subtitle}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Benefits */}
                <div className="mb-6 space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 ${colors.bullet} rounded-full`}
                      ></div>
                      <span className="font-mono text-sm text-foreground">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hover indicator */}
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors group-hover:text-primary">
                  <Zap size={12} aria-hidden="true" />
                  <span>ACTIVER MODULE</span>
                  <ArrowRight
                    size={12}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>

                {/* Background glow on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} -z-10 rounded-lg to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                ></div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="fade-in-up-delay-2 rounded-lg border border-border bg-card/20 p-8 text-center backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Lock size={16} className="text-primary-glow" aria-hidden="true" />
            <span className="font-mono text-sm text-muted-foreground">
              DONNÉES SÉCURISÉES EN FRANCE
            </span>
          </div>

          <h3 className="mb-4 text-2xl font-bold text-foreground">
            Prêt à transformer votre entreprise ?
          </h3>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              variant="default"
              size="lg"
              className="group font-mono"
              onClick={() => navigate('/get-started')}
            >
              DÉMARRER L'ESSAI
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-mono"
              onClick={scrollToContact}
            >
              PARLER À UN EXPERT
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
