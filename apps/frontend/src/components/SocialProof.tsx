import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import ArrowRight from '~icons/lucide/arrow-right'
import MapPin from '~icons/lucide/map-pin'
import Shield from '~icons/lucide/shield'
import Star from '~icons/lucide/star'


const SocialProof = () => {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
  })
  const demoLink = import.meta.env.VITE_DEMO_URL || '/demo'

  const logos = [
    {
      name: 'Client pilote A',
      tagline: 'Automatisation factures',
    },
    {
      name: 'Client pilote B',
      tagline: 'Support client IA',
    },
    {
      name: 'Client pilote C',
      tagline: 'Traitement documents',
    },
    {
      name: 'Client pilote D',
      tagline: 'Pilotage analytics',
    },
  ]

  const testimonials = [
    {
      quote:
        'WorkFlowAI structure nos dossiers et répond aux questions clés en quelques secondes. On déploie le pilote sur d’autres équipes.',
      author: 'Pilote Finance',
      position: 'Responsable Ops',
      company: 'PME Île-de-France',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&h=64&fit=crop&crop=face&auto=format&fm=webp',
    },
    {
      quote:
        "L'équipe nous accompagne sur la rédaction des prompts métiers et la gouvernance des données. Support local réactif.",
      author: 'Pilote Support',
      position: 'Head of CX',
      company: 'Scale-up SaaS',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&fm=webp',
    },
    {
      quote:
        'Nous préparons la mise en production après validation sécurité et RGPD. Les workflows sont prêts.',
      author: 'Pilote IT',
      position: 'IT & Sécurité',
      company: 'Industrie FR',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&fm=webp',
    },
  ]

  const trustIndicators = [
    {
      icon: Shield,
      title: 'Sécurité garantie',
      description: 'Données hébergées en France, conformité RGPD totale',
    },
    {
      icon: MapPin,
      title: 'Support local',
      description: 'Équipe française basée en Île-de-France',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-background/50 to-background py-24"
      aria-labelledby="social-proof-title"
    >
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="network-background-gradient absolute inset-0">
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="social-network"
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
            <rect width="100%" height="100%" fill="url(#social-network)" />
          </svg>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div
          className={`mb-16 text-center ${isIntersecting ? 'fade-in-up' : 'opacity-0'}`}
        >
          <Badge
            variant="outline"
            className="mb-6 border-primary/40 font-mono text-primary"
          >
            Témoignages clients
          </Badge>
          <h2
            id="social-proof-title"
            className="text-gradient mb-6 text-4xl font-bold md:text-5xl"
          >
            Ils nous font confiance
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Déploiements pilotes en cours (processus finance, support et
            documentation). Logos et cas clients vérifiés arrivent.
          </p>
        </div>

        {/* Logo Strip */}
        <div
          className={`fade-in-up mb-16 ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {import.meta.env.DEV && (
            <div className="mb-4 text-center font-mono text-sm text-muted-foreground">
              Remplacez par vos logos clients validés
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {logos.map(logo => (
              <div
                key={logo.name}
                className="rounded-lg border border-primary/10 bg-card/40 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
              >
                <div className="text-sm font-semibold text-foreground">
                  {logo.name}
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {logo.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div
          className={`stagger-fade mb-16 grid gap-8 lg:grid-cols-3 ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="card-hover group border-primary/20 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/40"
              role="article"
              aria-labelledby={`testimonial-${index}-author`}
            >
              <CardContent className="p-6">
                <div
                  className="mb-4 flex items-center gap-1"
                  aria-label={`${testimonial.rating} étoiles sur 5`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="mb-6 italic leading-relaxed text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex flex-wrap items-center gap-3">
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.author}, ${testimonial.position} chez ${testimonial.company}`}
                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    onError={e => {
                      if (e.currentTarget.dataset.fallbackApplied === 'true') {
                        return
                      }
                      e.currentTarget.dataset.fallbackApplied = 'true'
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <cite
                      id={`testimonial-${index}-author`}
                      className="font-semibold not-italic text-foreground transition-colors group-hover:text-primary"
                    >
                      {testimonial.author}
                    </cite>
                    <p className="font-mono text-sm text-muted-foreground">
                      {testimonial.position}
                    </p>
                    <p className="font-mono text-sm text-primary">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div
          className={`stagger-fade grid gap-8 md:grid-cols-2 ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {trustIndicators.map((indicator, index) => {
            const IconComponent = indicator.icon
            return (
              <Card
                key={index}
                className="group border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-300 hover:from-primary/15 hover:to-primary/10"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/20 p-3 transition-colors group-hover:bg-primary/30">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-bold transition-colors group-hover:text-primary">
                        {indicator.title}
                      </h4>
                      <p className="font-mono text-sm text-muted-foreground">
                        {indicator.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div
          className={`fade-in-up mt-16 text-center ${isIntersecting ? '' : 'opacity-0'}`}
        >
          <Button
            variant="hero"
            size="lg"
            className="inline-flex items-center gap-2"
            onClick={() => {
              if (demoLink.startsWith('http')) {
                window.location.href = demoLink
              } else {
                window.location.assign(demoLink)
              }
            }}
          >
            Voir la démo personnalisée
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Programmes pilotes ouverts — sécurité et conformité revues pendant
            le parcours démo.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
