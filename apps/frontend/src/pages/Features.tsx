import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { featureModules } from '@/data/productHighlights'
import CheckCircle2 from '~icons/lucide/check-circle-2'
import PlugZap from '~icons/lucide/plug-zap'
import ShieldCheck from '~icons/lucide/shield-check'
import Sparkles from '~icons/lucide/sparkles'
import Workflow from '~icons/lucide/workflow'

const integrationHighlights = [
  {
    title: 'Polar + Node.js',
    detail:
      'Checkout, Get Started et Demo sont prêts. La bascule production attend uniquement les clés LIVE et les webhooks.',
    benefits: [
      'Webhook signé et vérifié',
      'Connect et paiements classiques',
      'Expérience testée en local',
    ],
  },
  {
    title: 'Azure Vision & OpenAI',
    detail:
      'Fonctions Python isolées pour le traitement documentaire, la vision et le chat opérés depuis Azure Functions.',
    benefits: [
      'Python 3.11 managé',
      '99.7% de précision Vision',
      'Chatbot réactivable sur demande',
    ],
  },
  {
    title: 'Boucle de feedback MongoDB',
    detail:
      'Chaque formulaire déclenche un overlay PostSubmissionFeedback et alimente MongoDB + analytics Vercel.',
    benefits: [
      'Stockage centralisé',
      'Alertes dans le backend Node',
      'Roadmap customer-led',
    ],
  },
]

const reliabilityHighlights = [
  {
    title: 'Observabilité temps réel',
    detail:
      'Instrumentation @vercel/analytics + PerformanceMonitor interne pour suivre chargements, erreurs et réponses API.',
  },
  {
    title: 'RGPD et sécurité',
    detail:
      'Hébergement Vercel (conformité RGPD), politiques TermsFeed, chiffrement TLS et isolement des traitements IA côté Azure.',
  },
  {
    title: 'Équipe locale engagée',
    detail:
      'Support opéré en Île-de-France (Accès RER C) avec un SLA confirmé de réponse sous 2 heures.',
  },
]

const FeaturesPage = () => {
  return (
    <main
      id="features-page"
      aria-labelledby="features-page-title"
      className="bg-background text-foreground"
    >
      {/* Hero */}
      <section className="border-border/40 bg-card/20 border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/15 text-primary" variant="outline">
              Modules IA TCDynamics
            </Badge>
            <Badge variant="outline" className="font-mono">
              React 18 · Node 18 · Azure Functions
            </Badge>
          </div>
          <h1
            id="features-page-title"
            className="mb-6 text-4xl font-bold leading-tight md:text-5xl"
          >
            Toute la profondeur produit au-delà de la page d&apos;accueil
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Découvrez comment chaque module s&apos;intègre à l&apos;architecture
            hybride décrite dans PROJECT_MASTER.md : capture documentaire, IA
            conversationnelle, analytics métier et conformité RGPD.
          </p>
        </div>
      </section>

      {/* Detailed modules */}
      <section className="border-border/40 border-b py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Workflow className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">
                Modules détaillés TCDynamics
              </h2>
              <p className="text-muted-foreground">
                Même données que sur la home, mais avec leurs preuves
                opérationnelles.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            {featureModules.map(module => (
              <Card key={module.slug} className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
                    <module.icon aria-hidden="true" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-xs">
                      {module.subtitle}
                    </p>
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  {module.detail.mission}
                </p>
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold">
                      Ce que nous garantissons
                    </p>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      {module.detail.proofPoints.map(point => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2
                            size={16}
                            className="text-primary mt-1"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">
                      Intégrations natives
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {module.detail.integrations.map(integration => (
                        <Badge
                          key={integration}
                          variant="outline"
                          className="border-primary/20 text-primary text-xs"
                        >
                          {integration}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-muted-foreground mt-4 grid grid-cols-2 gap-3 text-sm">
                      {module.detail.metrics.map(metric => (
                        <div key={metric.label}>
                          <p className="text-xs uppercase tracking-wide">
                            {metric.label}
                          </p>
                          <p className="text-foreground text-lg font-semibold">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {module.benefits.map(benefit => (
                    <Badge
                      key={benefit}
                      variant="outline"
                      className="bg-card text-foreground font-mono text-xs"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="border-border/40 border-b py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <PlugZap className="text-primary-glow" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">
                Intégrations prêtes à déployer
              </h2>
              <p className="text-muted-foreground">
                Elles fonctionnent déjà en local ou en production partielle.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {integrationHighlights.map(item => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {item.detail}
                </p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {item.benefits.map(benefit => (
                    <li key={benefit} className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reliability */}
      <section className="border-border/40 border-b py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold">Fiabilité prouvée</h2>
              <p className="text-muted-foreground">
                Le socle décrit dans PROJECT_MASTER.md est déployé aujourd’hui.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reliabilityHighlights.map(item => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="border-border/40 rounded-lg border p-8 text-center">
            <div className="text-primary mb-4 flex items-center justify-center gap-2">
              <Sparkles aria-hidden="true" />
              <span className="font-mono text-xs uppercase">
                Roadmap 30 prochains jours
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold">
              Connectez vos équipes en moins d&apos;une semaine
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              Polar production, réactivation du chatbot et optimisation bundle
              &lt; 500 KB sont planifiés. Démarrons par une démo guidée ou un
              atelier de co-conception.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row">
              <Link
                to="/get-started"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-semibold transition-colors"
              >
                Démarrer maintenant
              </Link>
              <Link
                to="/contact"
                className="border-primary text-primary hover:bg-primary/10 rounded-full border px-8 py-3 font-semibold transition-colors"
              >
                Parler à un expert
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FeaturesPage
