import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Check from '~icons/lucide/check'
import MapPin from '~icons/lucide/map-pin'
import Phone from '~icons/lucide/phone'
import Play from '~icons/lucide/play'
import Shield from '~icons/lucide/shield'
import X from '~icons/lucide/x'

const pricingPlans = [
  {
    name: 'Starter',
    price: '29$',
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
    cta: "Démarrer l'essai gratuit",
    popular: false,
  },
  {
    name: 'Professional',
    price: '79$',
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
    cta: "Démarrer l'essai gratuit",
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
    cta: 'Nous contacter',
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

  const goToCheckout = (planName: string) => {
    navigate(`/checkout?plan=${planName}`)
  }

  return (
    <section className="bg-background relative overflow-hidden py-24">
      {/* Background Network Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="from-primary/40 absolute left-1/4 top-0 h-32 w-px bg-gradient-to-b to-transparent"></div>
        <div className="from-accent/30 absolute right-1/3 top-16 h-24 w-px bg-gradient-to-b to-transparent"></div>
        <div className="from-primary/30 absolute bottom-0 left-1/2 h-40 w-px bg-gradient-to-t to-transparent"></div>
        <div className="from-primary/30 absolute left-0 top-1/2 h-px w-32 bg-gradient-to-r to-transparent"></div>
        <div className="from-accent/20 absolute right-0 top-1/3 h-px w-24 bg-gradient-to-l to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-16 text-center">
            {/* Above-fold social proof */}
            <div className="text-muted-foreground mb-12 flex flex-wrap items-center justify-center gap-6 text-sm">
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
            <div className="border-primary/20 bg-primary/10 text-primary mx-auto mb-4 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-2 font-mono text-sm font-semibold">
              Automatisation IA Française • Validation en démo
            </div>
          </div>
          <h2 className="text-foreground mb-4 font-mono text-4xl font-bold">
            Plans IA, activation après démo guidée
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl font-mono text-lg">
            14 jours d'essai gratuit. Aucune carte bancaire requise. Annulez à
            tout moment.
          </p>
        </div>

        {/* Bento Grid: Old Way vs New Way + How it Works */}
        <div className="mb-16">
          <div className="mx-auto max-w-6xl">
            {/* Bento Grid Container */}
            <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-2">
              {/* Old Way - Smaller, Muted Card */}
              <div className="border-destructive/20 bg-destructive/5 relative overflow-hidden rounded-lg border p-6 backdrop-blur-sm md:col-span-1 lg:col-span-1">
                {/* Subtle diagonal strikethrough overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute left-0 top-0 size-full">
                    <div className="bg-destructive absolute left-0 top-1/2 h-px w-full origin-left -rotate-12"></div>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="border-destructive/20 bg-destructive/10 text-destructive mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs">
                    <X size={14} />
                    L'ANCIENNE MÉTHODE
                  </div>
                  <h3 className="text-muted-foreground mb-3 text-xl font-bold lg:text-2xl">
                    Saisie manuelle interminable
                  </h3>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• 10h/semaine perdues sur factures</li>
                    <li>• Erreurs humaines (2-5%)</li>
                    <li>• Support client réactif 9-17h</li>
                    <li>• KPIs manuels en Excel</li>
                  </ul>
                </div>
              </div>

              {/* New Way - Prominent, Larger Card */}
              <div className="border-primary/40 from-primary/10 via-primary/5 to-background shadow-primary/20 hover:border-primary/60 hover:shadow-primary/30 relative overflow-hidden rounded-lg border-2 bg-gradient-to-br p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl md:col-span-2 lg:col-span-2">
                <div className="border-primary/50 bg-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm font-semibold">
                  <Check size={16} className="text-primary" />
                  AVEC TCDYNAMICS
                </div>
                <h3 className="text-primary mb-4 text-3xl font-bold lg:text-4xl">
                  Automatisation IA en 3 clics
                </h3>
                <ul className="text-foreground space-y-3 text-base">
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>99.7% précision extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>Chatbot 24/7 résout 80%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>Dashboards temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>Économisez 10h/semaine</span>
                  </li>
                </ul>
              </div>

              {/* Step 1 - Onboard */}
              <div className="border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 relative overflow-hidden rounded-lg border p-6 backdrop-blur-sm transition-all duration-300 md:col-span-1 lg:col-span-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="border-primary bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full border-2 font-mono text-sm font-bold">
                    1
                  </div>
                  <div className="border-border bg-card/50 text-muted-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-1 font-mono text-xs">
                    <Play size={12} aria-hidden="true" />
                    COMMENT ÇA MARCHE
                  </div>
                </div>
                <h4 className="text-foreground mb-3 font-mono text-xl font-bold">
                  Onboard en 3 minutes
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Uploadez vos documents, activez le chatbot. Pas de migration,
                  pas de downtime.
                </p>
              </div>

              {/* Step 2 - Super-powers */}
              <div className="border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 relative overflow-hidden rounded-lg border p-6 backdrop-blur-sm transition-all duration-300 md:col-span-1 lg:col-span-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="border-primary bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full border-2 font-mono text-sm font-bold">
                    2
                  </div>
                  <div className="from-primary/20 h-px flex-1 bg-gradient-to-r to-transparent"></div>
                </div>
                <h4 className="text-primary mb-3 font-mono text-xl font-bold">
                  Débloquez vos super-pouvoirs
                </h4>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Traitez 500+ docs/mois automatiquement</li>
                  <li>• Répondez 80% des clients sans humain</li>
                  <li>• Analysez KPIs en temps réel</li>
                </ul>
              </div>

              {/* Step 3 - Goals */}
              <div className="border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 relative overflow-hidden rounded-lg border p-6 backdrop-blur-sm transition-all duration-300 md:col-span-1 lg:col-span-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="border-primary bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full border-2 font-mono text-sm font-bold">
                    3
                  </div>
                  <div className="from-primary/20 h-px flex-1 bg-gradient-to-r to-transparent"></div>
                </div>
                <h4 className="text-primary mb-3 font-mono text-xl font-bold">
                  Atteignez vos objectifs business
                </h4>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Économisez 10h/semaine dès jour 1</li>
                  <li>• ROI 300% en 12 mois</li>
                  <li>• Support local Île-de-France</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          id="pricing-cards"
          style={{ scrollMarginTop: '6rem' }}
          className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`fade-in-up border-primary/20 bg-card/30 hover:border-primary/40 relative flex h-full flex-col backdrop-blur-sm transition-all duration-300 ${
                plan.popular
                  ? 'border-primary relative z-10 border-2 shadow-2xl'
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground rounded-full px-4 py-1 font-mono text-sm font-bold">
                    Plus populaire
                  </div>
                </div>
              )}

              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-foreground mb-2 font-mono text-2xl">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-foreground group-hover:text-primary font-mono text-4xl font-bold drop-shadow-sm transition-colors duration-200">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  {plan.description}
                </p>
                {plan.testimonial && (
                  <div className="border-border/50 bg-muted/50 mt-4 flex min-h-[140px] flex-col justify-center rounded-lg border p-3">
                    <blockquote className="text-muted-foreground mb-2 text-sm italic">
                      "{plan.testimonial.quote}"
                    </blockquote>
                    <cite className="text-foreground text-xs font-semibold not-italic">
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
                        <Check className="text-primary size-4 shrink-0" />
                      ) : (
                        <X className="text-muted-foreground size-4 shrink-0" />
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
                  onClick={() => goToCheckout(plan.name.toLowerCase())}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Information */}
        <div className="mb-12 text-center">
          <h3 className="text-foreground mb-8 font-mono text-2xl font-bold">
            Support <span className="text-primary">Local</span>
          </h3>

          <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2">
            {supportInfo.map((info, index) => (
              <Card
                key={index}
                className="border-primary/20 bg-card/20 hover:border-primary/40 backdrop-blur-sm transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-lg p-3">
                    <info.icon
                      className="text-primary size-6"
                      aria-hidden="true"
                    />
                  </div>
                  <h4 className="text-foreground mb-2 font-mono font-bold">
                    {info.title}
                  </h4>
                  <p className="text-muted-foreground font-mono text-sm">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Notice */}
        <div className="text-center">
          <Card className="border-primary/20 bg-card/20 mx-auto max-w-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <h4 className="text-foreground mb-4 font-mono font-bold">
                Des questions sur nos tarifs ?
              </h4>
              <p className="text-muted-foreground mb-6 font-mono text-sm">
                Contactez notre équipe pour une démo personnalisée et un devis
                adapté à vos besoins spécifiques.
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
