import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { redirectToCheckout, type PlanType } from '@/utils/polar'
import ArrowLeft from '~icons/lucide/arrow-left'
import CheckCircle from '~icons/lucide/check-circle'
import CreditCard from '~icons/lucide/credit-card'
import Lock from '~icons/lucide/lock'
import Shield from '~icons/lucide/shield'

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()
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
      price: '29$',
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
      price: '79$',
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

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await redirectToCheckout(plan, getToken)

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
    <div className="from-background to-background/50 min-h-screen bg-gradient-to-b py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8" size="sm">
            <Link to="/#pricing">
              <ArrowLeft className="mr-2 size-4" />
              Retour aux tarifs
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-12 text-center">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary mb-4"
            >
              <Lock className="mr-1 size-3" />
              Paiement sécurisé
            </Badge>
            <h1 className="text-foreground mb-4 text-4xl font-bold lg:text-5xl">
              Finaliser votre abonnement
            </h1>
            <p className="text-muted-foreground text-xl">
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
                  <div className="border-primary/10 bg-primary/5 rounded-lg border p-6">
                    <div className="mb-4 flex items-baseline justify-between">
                      <h3 className="text-foreground text-2xl font-bold">
                        {currentPlan.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-primary text-3xl font-bold">
                          {currentPlan.price}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {currentPlan.period}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="text-primary mt-0.5 size-4 shrink-0" />
                          <span className="text-muted-foreground text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-border space-y-3 border-t pt-4">
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
                      <span className="text-primary font-medium">Gratuit</span>
                    </div>
                    <div className="border-border flex justify-between border-t pt-3 text-lg font-bold">
                      <span>À payer aujourd'hui</span>
                      <span className="text-primary">0$</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
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
                    <Shield className="text-primary mx-auto mb-2 size-8" />
                    <p className="text-sm font-medium">Paiement sécurisé</p>
                    <p className="text-muted-foreground text-xs">
                      Chiffrement SSL
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 bg-card/40">
                  <CardContent className="p-4 text-center">
                    <Lock className="text-primary mx-auto mb-2 size-8" />
                    <p className="text-sm font-medium">Conformité RGPD</p>
                    <p className="text-muted-foreground text-xs">
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
                    <CreditCard className="text-primary size-6" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/30 space-y-4 rounded-lg p-8 text-center">
                    <CreditCard className="text-primary/50 mx-auto size-16" />
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Paiement sécurisé par Polar
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Vos informations de paiement sont traitées de manière
                        sécurisée. Nous n'enregistrons pas vos données
                        bancaires.
                      </p>
                    </div>

                    {error && (
                      <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4 text-left">
                        <p className="text-destructive text-sm">{error}</p>
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
                          <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Redirection...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 size-4" />
                          Procéder au paiement sécurisé
                        </>
                      )}
                    </Button>

                    <p className="text-muted-foreground text-xs">
                      En cliquant sur "Procéder au paiement", vous acceptez nos
                      conditions générales de vente et notre politique de
                      confidentialité.
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <p className="text-muted-foreground mb-3 text-center text-sm">
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
              <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-r">
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
          <Card className="border-primary/20 bg-primary/10 mt-8">
            <CardContent className="p-6 text-center">
              <CheckCircle className="text-primary mx-auto mb-4 size-12" />
              <h3 className="mb-2 text-xl font-bold">
                Garantie satisfait ou remboursé
              </h3>
              <p className="text-muted-foreground">
                Essayez TCDynamics pendant 14 jours. Si vous n'êtes pas
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
