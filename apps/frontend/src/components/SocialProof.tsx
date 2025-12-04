import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const SocialProof = () => {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
  })

  const testimonials = [
    {
      quote:
        'WorkFlowAI a révolutionné notre gestion documentaire. Nous économisons 15h par semaine sur le traitement des factures.',
      author: 'Marie Dubois',
      position: 'Directrice Administrative',
      company: 'TechSolutions Montigny',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1494790108755-2616b2e4b4b4?w=64&h=64&fit=crop&crop=face',
    },
    {
      quote:
        "L'équipe française de WorkFlowAI nous accompagne parfaitement. Le support local fait toute la différence.",
      author: 'Pierre Martin',
      position: 'CEO',
      company: 'InnovConseil Guyancourt',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    },
    {
      quote:
        'La conformité RGPD était notre priorité. WorkFlowAI respecte parfaitement nos exigences de sécurité.',
      author: 'Sophie Leroy',
      position: 'DPO',
      company: 'SecureData Versailles',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    },
  ]

  const companies = [
    'TechSolutions Montigny',
    'InnovConseil Guyancourt',
    'SecureData Versailles',
    'BusinessFlow SQY',
    'AutomatePro Vélizy',
    'DataFrance Élancourt',
  ]

  const metrics = [
    {
      value: 75,
      suffix: '%',
      label: 'Temps économisé',
      icon: Clock,
      description: 'en moyenne par processus',
    },
    {
      value: 300,
      suffix: '%',
      label: 'ROI moyen',
      icon: TrendingUp,
      description: 'sur 12 mois',
    },
    {
      value: 500,
      suffix: '+',
      label: 'Entreprises françaises',
      icon: Users,
      description: 'nous font confiance',
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
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, hsl(var(--primary)) 0%, transparent 50%)`,
          }}
        >
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
            Découvrez comment les entreprises françaises transforment leurs
            processus avec WorkFlowAI
          </p>
        </div>

        {/* Metrics */}
        <div
          className={`stagger-fade mb-16 grid gap-8 md:grid-cols-3 ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <Card
                key={index}
                className="card-hover group border-primary/20 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/40"
              >
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 w-fit rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">
                    <AnimatedCounter
                      end={metric.value}
                      suffix={metric.suffix}
                      duration={2500}
                    />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-primary">
                    {metric.label}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Testimonials */}
        <div
          className={`stagger-fade mb-16 grid gap-8 md:grid-cols-3 ${isIntersecting ? '' : 'opacity-0'}`}
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
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.author}, ${testimonial.position} chez ${testimonial.company}`}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
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

        {/* Company Logos */}
        <div
          className={`fade-in-up mb-16 ${isIntersecting ? '' : 'opacity-0'}`}
        >
          <h3 className="mb-8 text-center text-lg font-semibold text-muted-foreground">
            Ils nous font déjà confiance
          </h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {companies.map((company, index) => (
              <div
                key={index}
                className="group rounded-lg border border-primary/10 bg-card/40 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
              >
                <div className="font-mono text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {company}
                </div>
              </div>
            ))}
          </div>
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
          <div className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-3 transition-colors hover:bg-primary/15">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="font-mono font-medium text-primary">
              Rejoignez plus de 500 entreprises françaises
            </span>
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
