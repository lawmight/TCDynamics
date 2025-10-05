import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, MapPin, Phone, X } from 'lucide-react'
import { useState } from 'react'

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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    setShowCheckout(true)
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Network Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-primary/40 to-transparent"></div>
        <div className="absolute top-16 right-1/3 w-px h-24 bg-gradient-to-b from-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 w-px h-40 bg-gradient-to-t from-primary/30 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-24 h-px bg-gradient-to-l from-accent/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-mono font-bold text-foreground mb-4">
            Tarifs <span className="text-primary">Transparents</span>
          </h2>
          <p className="text-muted-foreground font-mono text-lg max-w-2xl mx-auto">
            Choisissez la solution qui correspond à votre entreprise. Tous nos
            plans incluent 14 jours d'essai gratuit.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 fade-in-up ${
                plan.popular ? 'ring-2 ring-primary/50 scale-105' : ''
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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-mono font-bold">
                    Plus populaire
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="font-mono text-2xl text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-mono font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
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
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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

        {/* Payment Checkout */}
        {showCheckout && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  Finaliser votre abonnement
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCheckout(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Contactez-nous pour finaliser votre abonnement {selectedPlan}
                </p>
                <Button
                  onClick={() => {
                    window.location.href = '/#contact'
                    setShowCheckout(false)
                  }}
                  className="w-full"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Support Information */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-mono font-bold text-foreground mb-8">
            Support <span className="text-primary">Local</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {supportInfo.map((info, index) => (
              <Card
                key={index}
                className="bg-card/20 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-mono font-bold text-foreground mb-2">
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
          <Card className="bg-card/20 border-primary/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h4 className="font-mono font-bold text-foreground mb-4">
                Des questions sur nos tarifs ?
              </h4>
              <p className="text-muted-foreground font-mono text-sm mb-6">
                Contactez notre équipe commerciale pour une démonstration
                personnalisée et un devis adapté à vos besoins spécifiques.
              </p>
              <Button variant="hero-outline">Planifier une démo</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Pricing
