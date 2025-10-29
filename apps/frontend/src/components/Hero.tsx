import heroImage from '@/assets/hero-network.jpg'
import { Button } from '@/components/ui/button'
import { ArrowRight, Cpu, Database, Network, Play, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Network Patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary-glow rounded-full opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full opacity-50 animate-pulse fade-delay-10"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary-glow rounded-full opacity-30"></div>

        {/* Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="line-gradient"
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
            x1="25%"
            y1="25%"
            x2="33%"
            y2="33%"
            stroke="url(#line-gradient)"
            strokeWidth="1"
          />
          <line
            x1="66%"
            y1="33%"
            x2="75%"
            y2="50%"
            stroke="url(#line-gradient)"
            strokeWidth="1"
          />
          <line
            x1="33%"
            y1="75%"
            x2="75%"
            y2="50%"
            stroke="url(#line-gradient)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Overline */}
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground fade-in-up">
              <Network size={14} />
              WORKFLOW INTELLECT
            </div>

            {/* Main Headline */}
            <div className="space-y-4 fade-in-up">
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-[0.9] tracking-tight">
                Automatisez Votre{' '}
                <span className="text-gradient">Entreprise avec l'IA</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed fade-in-up-delay max-w-lg">
              Gagnez{' '}
              <strong className="text-foreground">10h par semaine</strong> avec
              notre intelligence artificielle.{' '}
              <span className="text-primary-glow">
                Spécialement conçu pour les entreprises françaises.
              </span>
            </p>

            {/* Value Proposition Box */}
            <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-6 fade-in-up-delay">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-md flex items-center justify-center">
                  <Cpu size={16} className="text-primary" />
                </div>
                <span className="text-lg font-medium text-foreground">
                  Transformez vos processus métier en 3 clics
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 fade-in-up-delay-2">
              <Button
                variant="default"
                size="xl"
                className="group font-mono"
                onClick={() => navigate('/get-started')}
              >
                GET COMPUTE
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="group font-mono"
                onClick={() => navigate('/demo')}
              >
                <Play
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                VOIR LA DÉMO
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground fade-in-up-delay-2">
              <div className="flex items-center gap-2">
                <Database size={14} />
                <span className="font-mono">Hébergement France</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span className="font-mono">Sécurité Bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="font-mono">4.9/5 sur 200+ avis</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Visualization */}
          <div className="relative fade-in-up-delay-2">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Réseau d'intelligence artificielle pour l'automatisation d'entreprise - WorkFlowAI"
                className="w-full h-auto rounded-lg shadow-glow"
              />

              {/* Floating Status Indicators - Prime Intellect Style */}
              <div className="absolute -top-4 -left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
                <div className="flex items-center gap-2 text-foreground">
                  <div className="w-2 h-2 bg-primary-glow rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono">IA ACTIVE</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-border">
                <div className="text-xs text-muted-foreground font-mono">
                  TEMPS ÉCONOMISÉ
                </div>
                <div className="text-xl font-bold text-primary font-mono">
                  +10.5h
                </div>
              </div>

              {/* Additional network nodes */}
              <div className="absolute top-1/4 -right-2 w-3 h-3 bg-primary rounded-full opacity-80 animate-pulse fade-delay-05"></div>
              <div className="absolute bottom-1/3 -left-2 w-2 h-2 bg-primary-glow rounded-full opacity-60 animate-pulse fade-delay-20"></div>
            </div>

            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-network rounded-lg -z-10"></div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  )
}

export default Hero
