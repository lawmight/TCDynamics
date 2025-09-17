import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  TrendingUp,
  Users,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
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
      className="relative py-24 bg-gradient-to-b from-background/50 to-background overflow-hidden"
      role="region"
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
            className="absolute inset-0 w-full h-full"
            xmlns="process.env.API_URL || 'process.env.API_URL || 'http://www.w3.org/2000/svg''"
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 ${isIntersecting ? 'fade-in-up' : 'opacity-0'}`}
        >
          <Badge
            variant="outline"
            className="border-primary/40 text-primary font-mono mb-6"
          >
            Témoignages clients
          </Badge>
          <h2
            id="social-proof-title"
            className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
          >
            Ils nous font confiance
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            Découvrez comment les entreprises françaises transforment leurs
            processus avec WorkFlowAI
          </p>
        </div>

        {/* Metrics */}
        <div
          className={`grid md:grid-cols-3 gap-8 mb-16 stagger-fade ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <Card
                key={index}
                className="bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-500 card-hover group"
              >
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    <AnimatedCounter
                      end={metric.value}
                      suffix={metric.suffix}
                      duration={2500}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {metric.label}
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Testimonials */}
        <div
          className={`grid md:grid-cols-3 gap-8 mb-16 stagger-fade ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-500 card-hover group"
              role="article"
              aria-labelledby={`testimonial-${index}-author`}
            >
              <CardContent className="p-6">
                <div
                  className="flex items-center gap-1 mb-4"
                  aria-label={`${testimonial.rating} étoiles sur 5`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <cite
                      id={`testimonial-${index}-author`}
                      className="font-semibold text-foreground not-italic group-hover:text-primary transition-colors"
                    >
                      {testimonial.author}
                    </cite>
                    <p className="text-sm text-muted-foreground font-mono">
                      {testimonial.position}
                    </p>
                    <p className="text-sm text-primary font-mono">
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
          className={`mb-16 fade-in-up ${isIntersecting ? '' : 'opacity-0'}`}
        >
          <h3 className="text-center text-lg font-semibold mb-8 text-muted-foreground">
            Ils nous font déjà confiance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-card/40 backdrop-blur-sm border border-primary/10 rounded-lg p-4 text-center hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div
          className={`grid md:grid-cols-2 gap-8 stagger-fade ${isIntersecting ? '' : 'opacity-0'}`}
        >
          {trustIndicators.map((indicator, index) => {
            const IconComponent = indicator.icon
            return (
              <Card
                key={index}
                className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {indicator.title}
                      </h4>
                      <p className="text-muted-foreground font-mono text-sm">
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
          className={`text-center mt-16 fade-in-up ${isIntersecting ? '' : 'opacity-0'}`}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 group hover:bg-primary/15 transition-colors cursor-pointer">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-primary font-mono font-medium">
              Rejoignez plus de 500 entreprises françaises
            </span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
