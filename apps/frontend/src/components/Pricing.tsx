import { Check, MapPin, Phone, X } from 'lucide-react'
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
    features: [
      { name: 'Traitement de 50 documents/mois', included: true },
      { name: 'Chatbot client basique', included: true },
      { name: 'Tableau de bord analytique', included: true },
      { name: 'Support email', included: true },
      { name: 'Conformité RGPD', included: true },
      { name: 'API intégrations', included: false },
      { name: 'Support téléphonique', included: false },
      { name: 'Formation personnalisée', included: false },
      { name: 'Déploiement sur site', included: false },
    ],
    cta: "Commencer l'essai",
    popular: false,
  },
  {
    name: 'Professional',
    price: '79€',
    period: '/mois',
    description:
      'Idéal pour les PME qui veulent automatiser leurs processus métier',
    features: [
      { name: 'Traitement de 500 documents/mois', included: true },
      { name: 'Chatbot client avancé + IA', included: true },
      { name: 'Tableau de bord personnalisé', included: true },
      { name: 'Support email prioritaire', included: true },
      { name: 'Conformité RGPD', included: true },
      { name: 'API intégrations', included: true },
      { name: 'Support téléphonique', included: true },
      { name: 'Formation personnalisée', included: false },
      { name: 'Déploiement sur site', included: false },
    ],
    cta: 'Choisir Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description:
      'Solution complète pour les grandes entreprises avec besoins spécifiques',
    features: [
      { name: 'Traitement illimité', included: true },
      { name: 'IA personnalisée', included: true },
      { name: 'Tableau de bord multi-sites', included: true },
      { name: 'Support dédié 24/7', included: true },
      { name: 'Conformité RGPD + audit', included: true },
      { name: 'API intégrations complètes', included: true },
      { name: 'Support téléphonique prioritaire', included: true },
      { name: 'Formation personnalisée', included: true },
      { name: 'Déploiement sur site', included: true },
    ],
    cta: 'Contactez-nous',
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
          <h2 className="mb-4 font-mono text-4xl font-bold text-foreground">
            Tarifs <span className="text-primary">Transparents</span>
          </h2>
          <p className="mx-auto max-w-2xl font-mono text-lg text-muted-foreground">
            Choisissez la solution qui correspond à votre entreprise. Tous nos
            plans incluent 14 jours d'essai gratuit.
          </p>
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
                      className="font-mono text-4xl font-bold text-primary"
                    >
                      {plan.price}
                    </data>
                  ) : (
                    <span className="font-mono text-4xl font-bold text-primary">
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
                  {plan.name === 'Enterprise'
                    ? plan.cta
                    : `S'abonner - ${plan.price}`}
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
                Planifier une démo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Pricing
