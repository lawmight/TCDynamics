import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Check,
  CreditCard,
  Shield,
  Lock,
  ArrowLeft,
  Star,
  Loader2,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'

// Configuration Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
)

interface Plan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  priceId?: string
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29€',
    period: '/mois',
    description:
      'Parfait pour les petites entreprises qui commencent leur digitalisation',
    priceId: 'price_1Qabcdefghijk', // À remplacer par le vrai price ID Stripe
    features: [
      'Traitement de 50 documents/mois',
      'Chatbot client basique',
      'Tableau de bord analytique',
      'Support email',
      'Conformité RGPD',
      "14 jours d'essai gratuit",
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '79€',
    period: '/mois',
    description:
      'Idéal pour les PME qui veulent automatiser leurs processus métier',
    priceId: 'price_1Qabcdefghijl', // À remplacer par le vrai price ID Stripe
    popular: true,
    features: [
      'Traitement de 500 documents/mois',
      'Chatbot client avancé + IA',
      'Tableau de bord personnalisé',
      'Support email prioritaire',
      'Conformité RGPD',
      'API intégrations',
      'Support téléphonique',
      "14 jours d'essai gratuit",
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description:
      'Solution complète pour les grandes entreprises avec besoins spécifiques',
    features: [
      'Traitement illimité',
      'IA personnalisée',
      'Tableau de bord multi-sites',
      'Support dédié 24/7',
      'Conformité RGPD + audit',
      'API intégrations complètes',
      'Support téléphonique prioritaire',
      'Formation personnalisée',
      'Déploiement sur site',
    ],
  },
]

// Fonction pour créer une session de checkout Stripe
const createCheckoutSession = async (
  plan: Plan
): Promise<{ clientSecret: string }> => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId: plan.priceId,
      planId: plan.id,
      successUrl: `${window.location.origin}/checkout/success`,
      cancelUrl: `${window.location.origin}/checkout`,
    }),
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la session de paiement')
  }

  return response.json()
}

const Checkout = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get plan from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const planParam = urlParams.get('plan')
    if (planParam) {
      const plan = plans.find(p => p.id === planParam)
      if (plan) {
        setSelectedPlan(plan)
      }
    }
  }, [])

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === 'enterprise') {
      // Redirect to contact for enterprise
      navigate('/#contact')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const session = await createCheckoutSession(plan)
      setSelectedPlan(plan)
      setClientSecret(session.clientSecret)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur lors de la création de la session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedPlan(null)
                  setClientSecret(null)
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux tarifs
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-muted-foreground">
                  Paiement sécurisé par Stripe
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Embedded Checkout */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-mono font-bold text-foreground mb-2">
                Finaliser votre abonnement {selectedPlan.name}
              </h2>
              <p className="text-muted-foreground font-mono">
                {selectedPlan.price}
                {selectedPlan.period} • 14 jours d'essai gratuit
              </p>
            </div>

            {/* Order Summary Sidebar */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-card/30 border-primary/20 backdrop-blur-sm sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Récapitulatif
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">
                        {selectedPlan.name}
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        {selectedPlan.price}
                        {selectedPlan.period}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {selectedPlan.features.slice(0, 6).map(feature => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="text-xs font-mono">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="font-mono">
                          Chiffrement SSL 256-bit
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="font-mono">PCI DSS compliant</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    onComplete: () => {
                      // Redirect to success page
                      navigate('/checkout/success')
                    },
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">
                Paiement sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-mono font-bold text-foreground mb-4">
              Choisissez votre <span className="text-gradient">plan</span>
            </h1>
            <p className="text-muted-foreground font-mono text-lg max-w-2xl mx-auto">
              Commencez votre transformation digitale avec 14 jours d'essai
              gratuit. Annulez à tout moment.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.map(plan => (
              <Card
                key={plan.id}
                className={`relative bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 cursor-pointer ${
                  plan.popular ? 'ring-2 ring-primary/50 scale-105' : ''
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-mono font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
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
                    {plan.features.slice(0, 5).map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-mono text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                      <div className="text-xs text-muted-foreground font-mono">
                        +{plan.features.length - 5} fonctionnalités
                        supplémentaires
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'hero' : 'hero-outline'}
                    size="lg"
                    className="w-full"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création de la session...
                      </>
                    ) : plan.id === 'enterprise' ? (
                      'Contactez-nous'
                    ) : (
                      `Commencer l'essai - ${plan.price}${plan.period}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Trust Signals */}
          <div className="text-center">
            <Card className="bg-card/20 border-primary/20 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <Shield className="w-8 h-8 text-primary mb-2" />
                    <p className="font-mono font-semibold text-sm">Sécurisé</p>
                    <p className="text-xs text-muted-foreground">
                      Chiffrement bancaire
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Lock className="w-8 h-8 text-primary mb-2" />
                    <p className="font-mono font-semibold text-sm">RGPD</p>
                    <p className="text-xs text-muted-foreground">
                      Conforme RGPD
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Star className="w-8 h-8 text-primary mb-2" />
                    <p className="font-mono font-semibold text-sm">Support</p>
                    <p className="text-xs text-muted-foreground">
                      Support local
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  Essayez gratuitement pendant 14 jours. Pas de carte bancaire
                  requise pour commencer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
