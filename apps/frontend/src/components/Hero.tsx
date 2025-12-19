import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Cpu,
  Database,
  Network,
  Pause,
  Play,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import heroAutomationVideo from '@/assets/hero-automation-video.mp4'
import heroAutomationPoster from '@/assets/hero-automation.jpg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const navigate = useNavigate()
  const demoLink = import.meta.env.VITE_DEMO_URL || '/demo'
  const contactLink = '/#contact'
  const securityLink = '/security'
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const [isVideoEnded, setIsVideoEnded] = useState(false)

  const goTo = (target: string) => {
    if (target.startsWith('http')) {
      window.location.href = target
      return
    }
    navigate(target)
  }

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await videoRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.error('Playback failed:', error)
          // Keep isPlaying as false since play failed
        }
      }
    }
  }

  const handleRetry = () => {
    setVideoError(false)
    setErrorMessage(null)
    videoRef.current?.load()
  }

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
                onClick={() => goTo(demoLink)}
              >
                VOIR LA DÉMO
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
                onClick={() => goTo(contactLink)}
              >
                <Play
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:scale-110"
                />
                PARLER À UN EXPERT
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="fade-in-up-delay-2 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Database size={14} aria-hidden="true" />
                <span className="font-mono">Données hébergées en France</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} aria-hidden="true" />
                <span className="font-mono">RGPD prêt + chiffrement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={14}
                  aria-hidden="true"
                  className="text-primary"
                />
                <span className="font-mono">Disponibilité 99.9% (SLA)</span>
              </div>
              <button
                onClick={() => goTo(securityLink)}
                className="font-mono text-xs uppercase tracking-wide text-primary underline-offset-4 hover:underline"
              >
                Security & Availability
              </button>
            </div>
          </div>

          {/* Right Column - Hero Visualization */}
          <div className="fade-in-up-delay-2 relative">
            <div className="relative z-10 overflow-hidden rounded-xl border border-border bg-card/60 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Démonstration en direct
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => goTo(demoLink)}
                >
                  Voir la démo
                </Button>
              </div>
              <div
                className="relative"
                onMouseEnter={() => setIsVideoHovered(true)}
                onMouseLeave={() => setIsVideoHovered(false)}
              >
                {videoError ? (
                  <div className="flex min-h-[400px] items-center justify-center p-8">
                    <Alert
                      variant="destructive"
                      className="w-full max-w-md border-destructive/50 bg-destructive/10"
                    >
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <AlertTitle className="font-mono text-base font-semibold">
                        Erreur de chargement
                      </AlertTitle>
                      <AlertDescription className="mt-2 space-y-4">
                        <p className="text-sm">
                          La vidéo de démonstration n'a pas pu être chargée.
                        </p>
                        {errorMessage && (
                          <p className="text-xs text-muted-foreground">
                            {errorMessage}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Veuillez vérifier votre connexion ou réessayer plus
                          tard.
                        </p>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleRetry}
                          aria-label="Réessayer de charger la vidéo"
                          className="mt-2 font-mono"
                        >
                          <RefreshCw size={16} aria-hidden="true" />
                          Réessayer
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={heroAutomationVideo}
                      aria-label="Démonstration en direct de l'automatisation des workflows avec l'IA"
                      poster={heroAutomationPoster}
                      controls
                      preload="metadata"
                      autoPlay
                      muted
                      playsInline
                      onPlay={() => {
                        setIsPlaying(true)
                        setIsVideoEnded(false)
                      }}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsVideoEnded(true)}
                      onError={e => {
                        const error = e.currentTarget.error
                        const message =
                          error?.message || 'Erreur de chargement de la vidéo'
                        setVideoError(true)
                        setErrorMessage(message)
                      }}
                      className="h-auto w-full object-cover"
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-background/10"></div>
                    {/* Accessible Pause/Play Control Overlay */}
                    <div className="absolute right-4 top-4 z-20">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={togglePlayPause}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            togglePlayPause()
                          }
                        }}
                        aria-label={
                          isPlaying
                            ? 'Mettre en pause la vidéo de démonstration'
                            : 'Reprendre la lecture de la vidéo de démonstration'
                        }
                        className="flex items-center gap-2 bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {isPlaying ? (
                          <>
                            <Pause size={16} aria-hidden="true" />
                            <span className="font-mono text-xs">Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={16} aria-hidden="true" />
                            <span className="font-mono text-xs">Play</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div
                      className={`absolute bottom-4 left-4 rounded-lg border border-border/60 bg-background/70 px-4 py-3 shadow-lg backdrop-blur transition-opacity duration-200 ${
                        isVideoHovered || !isPlaying || isVideoEnded
                          ? 'pointer-events-none opacity-0'
                          : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                        <Network size={14} />
                        Workflow en direct
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Extraction + réponses IA orchestrées
                      </p>
                    </div>
                  </>
                )}
              </div>
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
