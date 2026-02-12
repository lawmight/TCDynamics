import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import heroAutomationVideo from '@/assets/hero-automation-video.mp4'
import heroPosterImage from '@/assets/hero-network.jpg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { trackContactClick, trackDemoClick } from '@/utils/facebookEvents'
import AlertCircle from '~icons/lucide/alert-circle'
import ArrowRight from '~icons/lucide/arrow-right'
import CheckCircle from '~icons/lucide/check-circle'
import Cpu from '~icons/lucide/cpu'
import Database from '~icons/lucide/database'
import Network from '~icons/lucide/network'
import Play from '~icons/lucide/play'
import RefreshCw from '~icons/lucide/refresh-cw'
import Shield from '~icons/lucide/shield'

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const Hero = () => {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const demoLink = import.meta.env.VITE_DEMO_URL || '/demo'
  const contactLink = '/#contact'
  const securityLink = '/security'
  const { hasMarketingConsent } = useCookieConsent()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices and user interaction
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check for user interaction to allow autoplay
    const handleInteraction = () => {
      setHasUserInteracted(true)
    }
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('scroll', handleInteraction, { once: true })

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const goTo = (target: string) => {
    if (target.startsWith('http')) {
      window.location.href = target
      return
    }
    navigate(target)
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
        <div className="absolute left-1/4 top-1/4 size-2 animate-pulse rounded-full bg-primary opacity-60"></div>
        <div className="absolute right-1/3 top-1/3 size-1 rounded-full bg-primary-glow opacity-40"></div>
        <div className="fade-delay-10 absolute bottom-1/4 left-1/3 size-1.5 animate-pulse rounded-full bg-primary opacity-50"></div>
        <div className="absolute right-1/4 top-1/2 size-1 rounded-full bg-primary-glow opacity-30"></div>

        {/* Connection Lines */}
        <svg
          className="absolute inset-0 size-full opacity-10"
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

      {/* Subtle grain for depth */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Main Content - asymmetric spacing: more bottom padding so video card can overlap next section */}
      <div className="container relative z-10 mx-auto px-6 py-20 pb-28 lg:py-32 lg:pb-40">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left Column - Content (orchestrated stagger) */}
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="initial"
            animate="animate"
            transition={{ duration: reduceMotion ? 0 : undefined }}
          >
            {/* Overline */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Network size={14} aria-hidden="true" />
              <span>WORKFLOW INTELLECT</span>
              <span className="text-border">·</span>
              <abbr
                title="MCP (Model Context Protocol) : protocole ouvert pour connecter l'IA à vos outils, données et APIs."
                className="cursor-help no-underline"
              >
                MCP
              </abbr>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              className="space-y-4"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <h1 className="text-5xl font-bold leading-[0.9] tracking-tight text-foreground lg:text-7xl">
                Automatisez Votre{' '}
                <span className="text-gradient">Entreprise avec l'IA</span>
              </h1>
              <p className="text-lg font-light tracking-wide text-muted-foreground">
                WorkFlowAI - L'automatisation intelligente de vos processus
                métier
              </p>
            </motion.div>

            {/* Subheading */}
            <motion.p
              className="max-w-lg text-xl leading-relaxed text-muted-foreground lg:text-2xl"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              Finies les heures perdues en process manuels. Gagnez{' '}
              <span className="text-gradient font-bold">10h</span> par semaine
              avec l'IA — spécialement conçu pour les entreprises françaises.
            </motion.p>

            {/* Value Proposition Box */}
            <motion.div
              className="rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/20">
                  <Cpu size={16} className="text-primary" aria-hidden="true" />
                </div>
                <span className="text-lg font-medium text-foreground">
                  Transformez vos processus métier en{' '}
                  <span className="text-gradient">3 clics</span>
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Button
                variant="default"
                size="xl"
                className="group font-mono"
                onClick={() => {
                  if (hasMarketingConsent) {
                    trackDemoClick()
                  }
                  goTo(demoLink)
                }}
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
                onClick={() => {
                  if (hasMarketingConsent) {
                    trackContactClick()
                  }
                  goTo(contactLink)
                }}
              >
                <Play
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:scale-110"
                />
                PARLER À UN EXPERT
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
              variants={fadeInUp}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
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
              <Link
                to={securityLink}
                className="font-mono text-xs uppercase tracking-wide text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Security & Availability
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Visualization (overlaps bottom for asymmetric layout) */}
          <motion.div
            className="relative lg:-mb-16"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              delay: reduceMotion ? 0 : 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="relative z-10 overflow-hidden rounded-xl border border-border bg-card/60 shadow-xl shadow-primary/10 backdrop-blur lg:shadow-elegant">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-primary"></span>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Démonstration en direct
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    if (hasMarketingConsent) {
                      trackDemoClick()
                    }
                    goTo(demoLink)
                  }}
                >
                  Voir la démo
                </Button>
              </div>
              <div className="relative">
                {videoError ? (
                  <div className="flex min-h-[400px] items-center justify-center p-8">
                    <Alert
                      variant="destructive"
                      className="w-full max-w-md border-destructive/50 bg-destructive/10"
                    >
                      <AlertCircle className="size-5 text-destructive" />
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
                      poster={heroPosterImage}
                      aria-label="Démonstration en direct de l'automatisation des workflows avec l'IA"
                      controls
                      preload={
                        isMobile && !hasUserInteracted ? 'none' : 'metadata'
                      }
                      autoPlay={hasUserInteracted && !isMobile}
                      muted
                      playsInline
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
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-background/10"></div>
                  </>
                )}
              </div>
            </div>

            {/* Background Glow Effect */}
            <div className="bg-gradient-network absolute inset-0 -z-10 rounded-lg"></div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  )
}

export default Hero
