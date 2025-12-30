import { ArrowLeft, CheckCircle, CreditCard, Lock, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { redirectToCheckout, type PlanType } from '@/utils/polar'

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const planParam = searchParams.get('plan') || 'starter'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate plan parameter
  const plan = (
    ['starter', 'professional', 'enterprise'].includes(planParam)
      ? planParam
      : 'starter'
  ) as PlanType

  const planDetails = {
    starter: {
      name: 'Starter',
      price: '29€',
      period: '/mois',
      features: [
        'Traitement de 50 documents/mois',
        'Chatbot client basique',
        'Tableau de bord analytique',
        'Support email',
        'Conformité RGPD',
      ],
    },
    professional: {
      name: 'Professional',
      price: '79€',
      period: '/mois',
      features: [
        'Traitement de 500 documents/mois',
        'Chatbot client avancé + IA',
        'Tableau de bord personnalisé',
        'Support email prioritaire',
        'Conformité RGPD',
        'API intégrations',
        'Support téléphonique',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
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
  }

  const currentPlan = planDetails[plan]

  // Redirect to contact for Enterprise plan
  useEffect(() => {
    if (plan === 'enterprise') {
      navigate('/contact')
    }
  }, [plan, navigate])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Enterprise plan should redirect to contact, not checkout
      if (plan === 'enterprise') {
        navigate('/contact')
        return
      }

      const result = await redirectToCheckout(plan, session)

      if (result.authRequired) {
        // Redirect to login with return URL
        navigate(
          `/login?returnTo=${encodeURIComponent(`/checkout?plan=${plan}`)}`
        )
        return
      }

      if (result.error) {
        setError(
          result.error.message ||
            'Une erreur est survenue lors de la création de la session de paiement'
        )
        setIsLoading(false)
      }
      // If successful, user will be redirected to Polar Checkout
    } catch {
      setError(
        'Une erreur est survenue. Veuillez réessayer ou contacter notre support.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8" size="sm">
            <Link to="/#pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux tarifs
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-12 text-center">
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 text-primary"
            >
              <Lock className="mr-1 h-3 w-3" />
              Paiement sécurisé
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
              Finaliser votre abonnement
            </h1>
            <p className="text-xl text-muted-foreground">
              Vous êtes à un clic de transformer votre entreprise
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Plan Summary */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Info */}
                  <div className="rounded-lg border border-primary/10 bg-primary/5 p-6">
                    <div className="mb-4 flex items-baseline justify-between">
                      <h3 className="text-2xl font-bold text-foreground">
                        {currentPlan.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">
                          {currentPlan.price}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          {currentPlan.period}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Abonnement mensuel
                      </span>
                      <span className="font-medium">{currentPlan.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        14 jours d'essai
                      </span>
                      <span className="font-medium text-primary">Gratuit</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
                      <span>À payer aujourd'hui</span>
                      <span className="text-primary">0€</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vous serez facturé {currentPlan.price} après la période
                      d'essai de 14 jours. Annulation possible à tout moment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-primary/10 bg-card/40">
                  <CardContent className="p-4 text-center">
                    <Shield className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">Paiement sécurisé</p>
                    <p className="text-xs text-muted-foreground">
                      Chiffrement SSL
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 bg-card/40">
                  <CardContent className="p-4 text-center">
                    <Lock className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">Conformité RGPD</p>
                    <p className="text-xs text-muted-foreground">
                      Données protégées
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* TODO: Integrate Stripe Embedded Checkout here */}
                  <div className="space-y-4 rounded-lg bg-muted/30 p-8 text-center">
                    <CreditCard className="mx-auto h-16 w-16 text-primary/50" />
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Paiement sécurisé par Polar
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Vos informations de paiement sont traitées de manière
                        sécurisée. Nous n'enregistrons pas vos données
                        bancaires.
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-left">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      size="lg"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Redirection...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Procéder au paiement sécurisé
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      En cliquant sur "Procéder au paiement", vous acceptez nos
                      conditions générales de vente et notre politique de
                      confidentialité.
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <p className="mb-3 text-center text-sm text-muted-foreground">
                      Méthodes de paiement acceptées
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        Visa
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        Mastercard
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        American Express
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        CB
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <p className="mb-4 text-center text-sm">
                    Des questions sur votre abonnement ?
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Link to="/#contact">Contactez-nous</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Link to="/demo">Demander une démo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <Card className="mt-8 border-primary/20 bg-primary/10">
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-bold">
                Garantie satisfait ou remboursé
              </h3>
              <p className="text-muted-foreground">
                Essayez WorkFlowAI pendant 14 jours. Si vous n'êtes pas
                satisfait, annulez avant la fin de la période d'essai sans
                frais.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Checkout
