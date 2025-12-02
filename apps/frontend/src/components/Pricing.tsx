import { Check, MapPin, Phone, X, Users, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const pricingPlans = [
  {
    name: 'Starter',
    price: '29€',
    period: '/mois',
    description:
      'Parfait pour les petites entreprises qui commencent leur digitalisation',
    testimonial: {
      quote: 'WorkFlowAI a révolutionné notre gestion documentaire. Nous économisons 15h par semaine.',
      author: 'Marie Dubois',
      position: 'Directrice Administrative, TechSolutions Montigny'
    },
    features: [
      { name: 'Traitez 50 documents/mois automatiquement', included: true },
      { name: 'Répondez aux clients via chatbot basique', included: true },
      { name: 'Analysez KPIs via tableau de bord', included: true },
      { name: 'Bénéficiez d\'un support email rapide', included: true },
      { name: 'Respectez la conformité RGPD intégrée', included: true },
      { name: 'Intégrez via API avancées', included: false },
      { name: 'Appelez un support téléphonique', included: false },
      { name: 'Suivez une formation personnalisée', included: false },
      { name: 'Déployez sur votre site interne', included: false },
    ],
    cta: "Économisez 10h/semaine - Essai gratuit 14j",
    popular: false,
  },
  {
    name: 'Professional',
    price: '79€',
    period: '/mois',
    description:
      'Idéal pour les PME qui veulent automatiser leurs processus métier',
    testimonial: {
      quote: "L'équipe française nous accompagne parfaitement. Le support local fait toute la différence.",
      author: 'Pierre Martin',
      position: 'CEO, InnovConseil Guyancourt'
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
    cta: 'Automatisez tout - ROI 300% garanti',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description:
      'Solution complète pour les grandes entreprises avec besoins spécifiques',
    testimonial: {
      quote: 'La conformité RGPD était notre priorité. WorkFlowAI respecte parfaitement nos exigences.',
      author: 'Sophie Leroy',
      position: 'DPO, SecureData Versailles'
    },
    features: [
      { name: 'Traitez un volume illimité de documents', included: true },
      { name: 'Déployez une IA 100% personnalisée', included: true },
      { name: 'Supervisez plusieurs sites via dashboard', included: true },
      { name: 'Bénéficiez d\'un support 24/7 dédié', included: true },
      { name: 'Assurez conformité RGPD + audits', included: true },
      { name: 'Intégrez via API enterprise complètes', included: true },
      { name: 'Appelez support téléphonique prioritaire', included: true },
      { name: 'Suivez formations personnalisées', included: true },
      { name: 'Déployez entièrement sur site', included: true },
    ],
    cta: 'Démo personnalisée - ROI calculé en 15min',
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

  const handlePlanSelect = (planName: string) => {
    // Navigate to checkout page with plan parameter
    navigate(`/checkout?plan=${planName}`)
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
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">⭐</span>
                <span className="font-mono">4.9/5 (200+ avis)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} aria-hidden="true" />
                <span className="font-mono">500+ entreprises françaises</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} aria-hidden="true" />
                <span className="font-mono">ROI 300% moyen</span>
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-6 py-2 border border-primary/20 font-mono text-sm font-semibold text-primary mx-auto mb-4">
              Automatisation IA Française • Conformité RGPD
            </div>
          </div>
          <h2 className="mb-4 font-mono text-4xl font-bold text-foreground">
            Plans IA qui Économisent 10h/Semaine Dès le Jour 1 <span className="text-primary">à Partir de 29€</span>
          </h2>
          <p className="mx-auto max-w-2xl font-mono text-lg text-muted-foreground">
            Automatisez documents et support client en 3 clics. Essai gratuit 14 jours, sans carte – annulez n'importe quand.
          </p>
        </div>

        {/* Pain Points - Old Way vs New Way */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 font-mono text-sm text-destructive mb-6">
                  <X size={16} />
                  L'ANCIENNE MÉTHODE
                </div>
                <h3 className="mb-4 text-3xl font-bold text-foreground">Saisie manuelle interminable</h3>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li>• 10h/semaine perdues sur factures</li>
                  <li>• Erreurs humaines (2-5%)</li>
                  <li>• Support client réactif 9-17h</li>
                  <li>• KPIs manuels en Excel</li>
                </ul>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-sm text-primary mb-6">
                  <Check size={16} className="text-primary" />
                  AVEC WORKFLOWAI
                </div>
                <h3 className="mb-4 text-3xl font-bold text-primary">Automatisation IA en 3 clics</h3>
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
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm mb-4 mx-auto">
              <Play size={14} aria-hidden="true" />
              COMMENT ÇA MARCHE
            </div>
            <h3 className="mb-4 text-3xl font-bold text-foreground">1. Onboard en 3 minutes</h3>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Uploadez vos documents, activez le chatbot. Pas de migration, pas de downtime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="mb-4 font-mono text-2xl font-bold text-primary">2. Débloquez vos super-pouvoirs</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Traitez 500+ docs/mois automatiquement</li>
                <li>• Répondez 80% des clients sans humain</li>
                <li>• Analysez KPIs en temps réel</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-mono text-2xl font-bold text-primary-glow">3. Atteignez vos objectifs business</h4>
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
              className={`fade-in-up relative border-primary/20 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 ${
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
                  {plan.price.includes('€') ? (
                    <data
                      value={plan.price.replace(/[€/]/g, '')}
                      className="font-mono text-4xl font-bold text-foreground drop-shadow-sm group-hover:text-primary transition-colors duration-200"
                    >
                      {plan.price}
                    </data>
                  ) : (
                    <span className="font-mono text-4xl font-bold text-foreground drop-shadow-sm group-hover:text-primary transition-colors duration-200">
                      {plan.price}
                    </span>
                  )}
                  <span className="font-mono text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
                {plan.testimonial && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
                    <blockquote className="italic text-sm text-muted-foreground mb-2">
                      "{plan.testimonial.quote}"
                    </blockquote>
                    <cite className="text-xs font-semibold text-foreground not-italic">
                      – {plan.testimonial.author}
                    </cite>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
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
                  className="w-full"
                  onClick={() =>
                    plan.name !== 'Enterprise' &&
                    handlePlanSelect(plan.name.toLowerCase())
                  }
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
                Contactez notre équipe commerciale pour une démonstration
                personnalisée et un devis adapté à vos besoins spécifiques.
              </p>
              <Button variant="hero-outline" onClick={() => navigate('/demo')}>
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
