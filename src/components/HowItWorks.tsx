import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Link, Settings, TrendingUp } from 'lucide-react'

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
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, hsl(var(--primary)) 0%, transparent 50%)`,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="process.env.API_URL || 'http://www.w3.org/2000/svg'"
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Comment ça marche
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            Trois étapes simples pour transformer votre entreprise avec l'IA
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div
                key={index}
                className="relative fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-8">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-6xl font-mono font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                        {step.number}
                      </span>
                      <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center text-sm font-mono"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
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
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="bg-background border border-primary/20 rounded-full p-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="text-center mt-16 fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <p className="text-lg text-muted-foreground font-mono mb-6">
            Prêt à automatiser votre entreprise ?
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary font-mono font-medium">
              Démarrez en moins de 5 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
