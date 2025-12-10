import { Check, MapPin, Phone, Play, Shield, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const pricingPlans = [
  {
    name: 'Starter',
    price: '29€',
    period: '',
    description:
      'Parfait pour les petites entreprises qui commencent leur digitalisation',
    testimonial: {
      quote:
        'Pilote en cours : automatisation factures et réponses client. Cas complet présenté en démo.',
      author: 'Marie Dubois',
      position: 'Directrice Administrative, TechSolutions Montigny',
    },
    features: [
      { name: 'Traitez 50 documents/mois automatiquement', included: true },
      { name: 'Répondez aux clients via chatbot basique', included: true },
      { name: 'Analysez KPIs via tableau de bord', included: true },
      { name: "Bénéficiez d'un support email rapide", included: true },
      { name: 'Respectez la conformité RGPD intégrée', included: true },
      { name: 'Intégrez via API avancées', included: false },
      { name: 'Appelez un support téléphonique', included: false },
      { name: 'Suivez une formation personnalisée', included: false },
      { name: 'Déployez sur votre site interne', included: false },
    ],
    cta: 'Planifier une démo',
    popular: false,
  },
  {
    name: 'Professional',
    price: '79€',
    period: '',
    description:
      'Idéal pour les PME qui veulent automatiser leurs processus métier',
    testimonial: {
      quote:
        'Support local + workshops prompts métier pendant la phase pilote. Démo guidée disponible.',
      author: 'Pierre Martin',
      position: 'CEO, InnovConseil Guyancourt',
    },
    features: [
      { name: 'Traitez 500 documents/mois avec IA', included: true },
      { name: 'Répondez 24/7 via chatbot IA avancé', included: true },
      { name: 'Personnalisez votre tableau de bord', included: true },
      { name: 'Obtenez un support email prioritaire', included: true },
      { name: 'Respectez la conformité RGPD avancée', included: true },
      { name: 'Intégrez facilement via API complètes', included: true },
      { name: 'Appelez un support téléphonique dédié', included: true },
      { name: 'Suivez une formation personnalisée', included: false },
      { name: 'Déployez sur votre site interne', included: false },
    ],
    cta: 'Planifier une démo',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description:
      'Solution complète pour les grandes entreprises avec besoins spécifiques',
    testimonial: {
      quote:
        'Conformité et parcours de validation sécurité présentés pendant la démo.',
      author: 'Sophie Leroy',
      position: 'DPO, SecureData Versailles',
    },
    features: [
      { name: 'Traitez un volume illimité de documents', included: true },
      { name: 'Déployez une IA 100% personnalisée', included: true },
      { name: 'Supervisez plusieurs sites via dashboard', included: true },
      { name: "Bénéficiez d'un support 24/7 dédié", included: true },
      { name: 'Assurez conformité RGPD + audits', included: true },
      { name: 'Intégrez via API enterprise complètes', included: true },
      { name: 'Appelez support téléphonique prioritaire', included: true },
      { name: 'Suivez formations personnalisées', included: true },
      { name: 'Déployez entièrement sur site', included: true },
    ],
    cta: 'Parler à un expert',
    popular: false,
  },
]

const supportInfo = [
  {
    icon: Phone,
    title: 'Support Local',
    description: 'Équipe basée à Montigny-le-Bretonneux',
  },
  {
    icon: MapPin,
    title: 'Proximité',
    description: 'Interventions sur site en Île-de-France',
  },
]

const Pricing = () => {
  const navigate = useNavigate()
  const demoLink = import.meta.env.VITE_DEMO_URL || '/demo'

  const goToDemo = (planName?: string) => {
    if (demoLink.startsWith('http')) {
      window.location.href = demoLink
      return
    }
    if (planName) {
      navigate(`${demoLink}?plan=${planName}`)
      return
    }
    navigate(demoLink)
  }

  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Background Network Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/4 top-0 h-32 w-px bg-gradient-to-b from-primary/40 to-transparent"></div>
        <div className="absolute right-1/3 top-16 h-24 w-px bg-gradient-to-b from-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 h-40 w-px bg-gradient-to-t from-primary/30 to-transparent"></div>
        <div className="absolute left-0 top-1/2 h-px w-32 bg-gradient-to-r from-primary/30 to-transparent"></div>
        <div className="absolute right-0 top-1/3 h-px w-24 bg-gradient-to-l from-accent/20 to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-16 text-center">
            {/* Above-fold social proof */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield size={14} aria-hidden="true" />
                <span className="font-mono">
                  RGPD & revues sécurité en démo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} aria-hidden="true" />
                <span className="font-mono">Support local Île-de-France</span>
              </div>
              <div className="flex items-center gap-2">
                <Play size={14} aria-hidden="true" />
                <span className="font-mono">Parcours démo guidé</span>
              </div>
            </div>
            <div className="mx-auto mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-2 font-mono text-sm font-semibold text-primary">
              Automatisation IA Française • Validation en démo
            </div>
          </div>
          <h2 className="mb-4 font-mono text-4xl font-bold text-foreground">
            Plans IA, activation après démo guidée
          </h2>
          <p className="mx-auto max-w-2xl font-mono text-lg text-muted-foreground">
            Les paiements/Stripe arrivent. Aujourd'hui, réservez une démo pour
            valider le fit produit, la sécurité et la mise en place.
          </p>
        </div>

        {/* Pain Points - Old Way vs New Way */}
        <div className="mb-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 font-mono text-sm text-destructive">
                  <X size={16} />
                  L'ANCIENNE MÉTHODE
                </div>
                <h3 className="mb-4 text-3xl font-bold text-foreground">
                  Saisie manuelle interminable
                </h3>
                <ul className="mb-8 space-y-3 text-muted-foreground">
                  <li>• 10h/semaine perdues sur factures</li>
                  <li>• Erreurs humaines (2-5%)</li>
                  <li>• Support client réactif 9-17h</li>
                  <li>• KPIs manuels en Excel</li>
                </ul>
              </div>
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-sm text-primary">
                  <Check size={16} className="text-primary" />
                  AVEC WORKFLOWAI
                </div>
                <h3 className="mb-4 text-3xl font-bold text-primary">
                  Automatisation IA en 3 clics
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• 99.7% précision extraction</li>
                  <li>• Chatbot 24/7 résout 80%</li>
                  <li>• Dashboards temps réel</li>
                  <li>• Économisez 10h/semaine</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Product Walkthrough */}
        <div className="mb-16 space-y-12">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
              <Play size={14} aria-hidden="true" />
              COMMENT ÇA MARCHE
            </div>
            <h3 className="mb-4 text-3xl font-bold text-foreground">
              1. Onboard en 3 minutes
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Uploadez vos documents, activez le chatbot. Pas de migration, pas
              de downtime.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-4 font-mono text-2xl font-bold text-primary">
                2. Débloquez vos super-pouvoirs
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Traitez 500+ docs/mois automatiquement</li>
                <li>• Répondez 80% des clients sans humain</li>
                <li>• Analysez KPIs en temps réel</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-mono text-2xl font-bold text-primary-glow">
                3. Atteignez vos objectifs business
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Économisez 10h/semaine dès jour 1</li>
                <li>• ROI 300% en 12 mois</li>
                <li>• Support local Île-de-France</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`fade-in-up relative flex h-full flex-col border-primary/20 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 ${
                plan.popular
                  ? 'relative z-10 border-2 border-primary shadow-2xl'
                  : ''
              } ${
                index === 0
                  ? 'fade-delay-00'
                  : index === 1
                    ? 'fade-delay-02'
                    : index === 2
                      ? 'fade-delay-04'
                      : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="rounded-full bg-primary px-4 py-1 font-mono text-sm font-bold text-primary-foreground">
                    Plus populaire
                  </div>
                </div>
              )}

              <CardHeader className="pb-6 text-center">
                <CardTitle className="mb-2 font-mono text-2xl text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold text-foreground drop-shadow-sm transition-colors duration-200 group-hover:text-primary">
                    {plan.price}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
                {plan.testimonial && (
                  <div className="mt-4 rounded-lg border border-border/50 bg-muted/50 p-3">
                    <blockquote className="mb-2 text-sm italic text-muted-foreground">
                      "{plan.testimonial.quote}"
                    </blockquote>
                    <cite className="text-xs font-semibold not-italic text-foreground">
                      – {plan.testimonial.author}
                    </cite>
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex flex-1 flex-col space-y-6">
                {/* Features List */}
                <div className="flex-1 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      {feature.included ? (
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      ) : (
                        <X className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={`font-mono text-sm ${
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? 'hero' : 'hero-outline'}
                  size="lg"
                  className="mt-auto w-full"
                  onClick={() => goToDemo(plan.name.toLowerCase())}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Information */}
        <div className="mb-12 text-center">
          <h3 className="mb-8 font-mono text-2xl font-bold text-foreground">
            Support <span className="text-primary">Local</span>
          </h3>

          <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2">
            {supportInfo.map((info, index) => (
              <Card
                key={index}
                className="border-primary/20 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/40"
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 w-fit rounded-lg bg-primary/10 p-3">
                    <info.icon
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h4 className="mb-2 font-mono font-bold text-foreground">
                    {info.title}
                  </h4>
                  <p className="font-mono text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Notice */}
        <div className="text-center">
          <Card className="mx-auto max-w-2xl border-primary/20 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h4 className="mb-4 font-mono font-bold text-foreground">
                Des questions sur nos tarifs ?
              </h4>
              <p className="mb-6 font-mono text-sm text-muted-foreground">
                Contactez notre équipe pour une démo personnalisée et un devis
                adapté à vos besoins spécifiques. Stripe et essais auto arrivent
                après validation.
              </p>
              <Button variant="hero-outline" onClick={() => goToDemo()}>
                Découvrez votre ROI en 15 minutes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Pricing
