import { Card, CardContent } from '@/components/ui/card'
import ArrowRight from '~icons/lucide/arrow-right'
import Link from '~icons/lucide/link'
import Settings from '~icons/lucide/settings'
import TrendingUp from '~icons/lucide/trending-up'


const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Link,
      title: 'Connectez vos outils',
      description:
        'Intégrez facilement vos emails, documents et systèmes existants en quelques clics.',
      details: [
        'Emails Outlook/Gmail',
        'Documents PDF/Word',
        'CRM et ERP',
        'APIs personnalisées',
      ],
    },
    {
      number: '02',
      icon: Settings,
      title: "Configurez l'IA",
      description:
        'Personnalisez vos workflows automatisés selon vos besoins métier spécifiques.',
      details: [
        'Règles intelligentes',
        'Templates personnalisés',
        'Validation humaine',
        'Notifications',
      ],
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Automatisez et économisez',
      description:
        'Profitez des résultats en temps réel et libérez votre équipe des tâches répétitives.',
      details: [
        'Gain de temps 75%',
        'ROI positif 3 mois',
        'Monitoring 24/7',
        'Support français',
      ],
    },
  ]

  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="network-background-gradient absolute inset-0">
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="network-how"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="1.5"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M30,30 L60,0 M30,30 L60,60 M30,30 L0,60"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network-how)" />
          </svg>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="fade-in-up mb-16 text-center">
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Comment ça marche
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Trois étapes simples pour transformer votre entreprise avec l'IA
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div
                key={index}
                className={`fade-in-up relative ${
                  index === 0
                    ? 'fade-delay-00'
                    : index === 1
                      ? 'fade-delay-02'
                      : index === 2
                        ? 'fade-delay-04'
                        : ''
                }`}
              >
                <Card className="group h-full border-primary/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/40">
                  <CardContent className="p-8">
                    {/* Step Number */}
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-mono text-6xl font-bold text-primary/20 transition-colors group-hover:text-primary/40">
                        {step.number}
                      </span>
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center font-mono text-sm"
                        >
                          <div className="mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          <span className="text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 transform lg:block">
                    <div className="rounded-full border border-primary/20 bg-background p-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="fade-in-up fade-delay-06 mt-16 text-center">
          <p className="mb-6 font-mono text-lg text-muted-foreground">
            Prêt à automatiser votre entreprise ?
          </p>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-6 py-3">
            <span className="font-mono font-medium text-primary">
              Démarrez en moins de 5 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
