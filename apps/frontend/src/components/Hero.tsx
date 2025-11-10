import { ArrowRight, Cpu, Database, Network, Play, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import heroImage from '@/assets/hero-network.jpg'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Network Patterns */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-2 w-2 animate-pulse rounded-full bg-primary opacity-60"></div>
        <div className="absolute right-1/3 top-1/3 h-1 w-1 rounded-full bg-primary-glow opacity-40"></div>
        <div className="fade-delay-10 absolute bottom-1/4 left-1/3 h-1.5 w-1.5 animate-pulse rounded-full bg-primary opacity-50"></div>
        <div className="absolute right-1/4 top-1/2 h-1 w-1 rounded-full bg-primary-glow opacity-30"></div>

        {/* Connection Lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
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
      <div className="container relative z-10 mx-auto px-6 py-20 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Overline */}
            <div className="fade-in-up inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
              <Network size={14} aria-hidden="true" />
              WORKFLOW INTELLECT
            </div>

            {/* Main Headline */}
            <div className="fade-in-up space-y-4">
              <h1 className="text-5xl font-bold leading-[0.9] tracking-tight text-foreground lg:text-7xl">
                Automatisez Votre{' '}
                <span className="text-gradient">Entreprise avec l'IA</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="fade-in-up-delay max-w-lg text-xl leading-relaxed text-muted-foreground lg:text-2xl">
              Gagnez{' '}
              <strong className="text-foreground">10h par semaine</strong> avec
              notre intelligence artificielle.{' '}
              <span className="text-primary-glow">
                Spécialement conçu pour les entreprises françaises.
              </span>
            </p>

            {/* Value Proposition Box */}
            <div className="fade-in-up-delay rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20">
                  <Cpu size={16} className="text-primary" aria-hidden="true" />
                </div>
                <span className="text-lg font-medium text-foreground">
                  Transformez vos processus métier en 3 clics
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="fade-in-up-delay-2 flex flex-col gap-4 sm:flex-row">
              <Button
                variant="default"
                size="xl"
                className="group font-mono"
                onClick={() => navigate('/get-started')}
              >
                GET COMPUTE
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
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
                  aria-hidden="true"
                  className="transition-transform group-hover:scale-110"
                />
                VOIR LA DÉMO
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="fade-in-up-delay-2 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Database size={14} aria-hidden="true" />
                <span className="font-mono">Hébergement France</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} aria-hidden="true" />
                <span className="font-mono">Sécurité Bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">⭐</span>
                <span className="font-mono">4.9/5 sur 200+ avis</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Visualization */}
          <div className="fade-in-up-delay-2 relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Réseau d'intelligence artificielle pour l'automatisation d'entreprise - WorkFlowAI"
                className="h-auto w-full rounded-lg shadow-glow"
              />

              {/* Floating Status Indicators - Prime Intellect Style */}
              <div className="absolute -left-4 -top-4 hidden rounded-lg border border-border bg-card/90 px-3 py-2 backdrop-blur-sm md:block">
                <div className="flex items-center gap-2 text-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary-glow"></div>
                  <span className="font-mono text-xs">IA ACTIVE</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 hidden rounded-lg border border-border bg-card/90 px-4 py-3 backdrop-blur-sm md:block">
                <div className="font-mono text-xs text-muted-foreground">
                  TEMPS ÉCONOMISÉ
                </div>
                <div className="font-mono text-xl font-bold text-primary">
                  <data value="10.5">+10.5h</data>
                </div>
              </div>

              {/* Additional network nodes */}
              <div className="fade-delay-05 absolute -right-2 top-1/4 hidden h-3 w-3 animate-pulse rounded-full bg-primary opacity-80 md:block"></div>
              <div className="fade-delay-20 absolute -left-2 bottom-1/3 hidden h-2 w-2 animate-pulse rounded-full bg-primary-glow opacity-60 md:block"></div>
            </div>

            {/* Background Glow Effect */}
            <div className="bg-gradient-network absolute inset-0 -z-10 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  )
}

export default Hero
