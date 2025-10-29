import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirectToCheckout, type PlanType } from '@/utils/stripe'
import { ArrowLeft, CheckCircle, CreditCard, Lock, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
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

      const result = await redirectToCheckout(plan)

      if (result.error) {
        setError(
          result.error.message ||
            'Une erreur est survenue lors de la création de la session de paiement'
        )
        setIsLoading(false)
      }
      // If successful, user will be redirected to Stripe Checkout
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
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8" size="sm">
            <Link to="/pricing">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tarifs
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 text-primary"
            >
              <Lock className="w-3 h-3 mr-1" />
              Paiement sécurisé
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Finaliser votre abonnement
            </h1>
            <p className="text-xl text-muted-foreground">
              Vous êtes à un clic de transformer votre entreprise
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="space-y-6">
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Info */}
                  <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                    <div className="flex items-baseline justify-between mb-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {currentPlan.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">
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
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-border">
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
                      <span className="font-medium text-green-600">
                        Gratuit
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
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
                <Card className="bg-card/40 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Paiement sécurisé</p>
                    <p className="text-xs text-muted-foreground">
                      Chiffrement SSL
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/40 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
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
              <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* TODO: Integrate Stripe Embedded Checkout here */}
                  <div className="bg-muted/30 rounded-lg p-8 text-center space-y-4">
                    <CreditCard className="w-16 h-16 text-primary/50 mx-auto" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Paiement sécurisé par Stripe
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vos informations de paiement sont traitées de manière
                        sécurisée. Nous n'enregistrons pas vos données
                        bancaires.
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                        <p className="text-sm text-red-800 dark:text-red-400">
                          {error}
                        </p>
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Redirection...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
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
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      Méthodes de paiement acceptées
                    </p>
                    <div className="flex justify-center gap-2 flex-wrap">
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
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <p className="text-sm text-center mb-4">
                    Des questions sur votre abonnement ?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Link to="/contact">Contactez-nous</Link>
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
          <Card className="mt-8 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
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
