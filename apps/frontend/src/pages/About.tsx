import {
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const missionPillars = [
  {
    title: 'Automatisation locale',
    description:
      'Simplifier le quotidien des PME françaises avec une IA adaptée à leurs processus et à leurs référentiels.',
    proof:
      "Basée sur l'expérience terrain collectée durant la phase de validation clients.",
    icon: Building2,
  },
  {
    title: 'Transparence & conformité',
    description:
      'Chaque flux de données est documenté, de la collecte Vercel aux traitements Azure Functions.',
    proof: 'Politique RGPD maintenue à jour via TermsFeed et audits réguliers.',
    icon: ShieldCheck,
  },
  {
    title: 'Support humain',
    description:
      "Une équipe française disponible sous 2h pour combiner expertise humaine et IA d'entreprise.",
    proof: 'Escalade directe via Zoho Mail pour les dossiers sensibles.',
    icon: Users,
  },
]

const deploymentFootprint = [
  {
    label: 'Frontend React 18',
    detail: 'Hébergé sur Vercel (https://tcdynamics.fr) avec Vite 7.1',
  },
  {
    label: 'API Routes',
    detail:
      'Routes serverless sécurisées déployées sur Vercel (`/api/**/*.js`) pour contact, demo, chat, vision et Polar.',
  },
  {
    label: 'Azure Functions',
    detail:
      'Python 3.11 pour le chat IA, la vision documentaire, les formulaires contact/demo et les traitements AI.',
  },
  {
    label: 'Base de données',
    detail:
      'MongoDB pour la persistance et le feedback post-soumission.',
  },
]

const complianceCommitments = [
  {
    title: 'Hébergement souverain',
    detail:
      'Les données clients restent en Europe via Vercel (conformité RGPD), avec redondance Azure limitée aux traitements IA.',
  },
  {
    title: 'Sécurité opérationnelle',
    detail:
      'Webhook Polar sécurisé, chiffrement TLS systématique et surveillance des routes critiques.',
  },
  {
    title: 'Gouvernance RGPD',
    detail:
      'Traçabilité complète, politiques TermsFeed (Privacy, CGU, EULA) et revue trimestrielle des accès.',
  },
]

const milestones = [
  {
    date: 'Octobre 2025',
    title: 'Phase Tinker',
    detail:
      '25% de réduction de code, 110 tests supplémentaires et instrumentation analytics sur toutes les routes.',
  },
  {
    date: 'Semaine 5-6',
    title: 'Customer Validation',
    detail:
      'Chatbot UI mis en pause pour prioriser les retours clients. Feedback modal connecté à MongoDB.',
  },
  {
    date: 'Novembre 2025',
    title: 'Polar prêt à basculer',
    detail:
      'Checkout, Demo et Get Started finalisés. Passage en production en attente des clés Polar LIVE.',
  },
  {
    date: 'Aujourd’hui',
    title: 'Architecture hybride live',
    detail:
      'Frontend Vercel, API routes serverless (Vercel), Azure Functions IA et emails Zoho tous opérationnels.',
  },
]

const stats = [
  {
    label: 'Tests automatisés',
    description: 'Ajoutés depuis la refonte Tinker Phase 1',
    end: 110,
    suffix: '',
  },
  {
    label: 'SLA support',
    description: 'Réponse moyenne constatée sur Zoho Mail',
    end: 2,
    suffix: 'h',
  },
  {
    label: 'Précision Vision',
    description: 'Mesurée sur Azure Computer Vision pour les documents',
    end: 99,
    suffix: '%',
  },
]

const About = () => {
  return (
    <main
      id="about-page"
      aria-labelledby="about-title"
      className="bg-background text-foreground"
    >
      {/* Hero */}
      <section className="border-b border-border/40 bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="font-mono">
              Made in France · Vercel + Azure
            </Badge>
            <Badge className="bg-primary/15 font-mono text-primary">
              Réponse sous 2h garantie
            </Badge>
          </div>
          <h1
            id="about-title"
            className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
          >
            L&apos;IA opérationnelle pensée pour les PME françaises
          </h1>
          <p className="mb-8 max-w-3xl text-lg text-muted-foreground">
            WorkFlowAI orchestre une architecture hybride React + Node + Azure
            Functions pour automatiser vos documents, vos workflows et vos
            interactions clients tout en restant pleinement conforme au RGPD.
          </p>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" aria-hidden="true" />
              <span className="font-mono text-sm text-muted-foreground">
                Frontend + backend live sur Vercel
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Server className="text-primary-glow" aria-hidden="true" />
              <span className="font-mono text-sm text-muted-foreground">
                Azure Functions Python 3.11 actives
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold">Notre mission</h2>
            <p className="text-muted-foreground">
              Des engagements concrets issus du plan PROJECT_MASTER.md.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {missionPillars.map(pillar => (
              <Card key={pillar.title} className="h-full p-6">
                <div className="mb-4 flex items-center gap-3 text-primary">
                  <pillar.icon aria-hidden="true" />
                  <h3 className="text-lg font-semibold">{pillar.title}</h3>
                </div>
                <p className="mb-3 text-muted-foreground">
                  {pillar.description}
                </p>
                <p className="font-mono text-xs text-foreground/70">
                  {pillar.proof}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map(stat => (
              <Card
                key={stat.label}
                className="flex flex-col items-start gap-3 p-6"
              >
                <span className="text-sm uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </span>
                <AnimatedCounter
                  end={stat.end}
                  suffix={stat.suffix}
                  className="text-4xl font-bold text-primary"
                />
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center gap-3">
            <Globe className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">Empreinte technique</h2>
              <p className="text-muted-foreground">
                Architecture hybride confirmée dans PROJECT_MASTER.md.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {deploymentFootprint.map(item => (
              <Card key={item.label} className="p-6">
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="border-b border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center gap-3">
            <ShieldCheck className="text-primary-glow" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">Conformité & confiance</h2>
              <p className="text-muted-foreground">
                RGPD, souveraineté et gouvernance opérationnelle.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {complianceCommitments.map(item => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <MapPin className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">Repères clés</h2>
              <p className="text-muted-foreground">
                Mise à jour au 19 novembre 2025.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            {milestones.map(milestone => (
              <Card key={milestone.title} className="p-6">
                <div className="mb-2 font-mono text-xs uppercase tracking-wide text-primary">
                  {milestone.date}
                </div>
                <h3 className="text-lg font-semibold">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {milestone.detail}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-border/40 p-8 text-center">
            <p className="mb-4 font-mono text-sm text-muted-foreground">
              Une équipe basée en Île-de-France · Accès RER C
            </p>
            <h2 className="mb-6 text-3xl font-semibold">
              Parlons de votre prochain workflow
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Contactez-nous pour une démo guidée ou pour relancer le chatbot IA
              sur votre périmètre métier. Nous nous engageons à répondre sous
              deux heures ouvrées.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link
                to="/contact"
                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Contacter l&apos;équipe
              </Link>
              <Link
                to="/demo"
                className="rounded-full border border-primary px-8 py-3 font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Programmer une démo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
