import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react'
import { paymentAPI } from '@/api/azureServices'

// Configuration Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
)

interface StripeCheckoutProps {
  plan: 'starter' | 'professional' | 'enterprise'
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: string) => void
}

interface PaymentFormProps {
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: string) => void
}

const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()

      if (submitError) {
        setError(
          submitError.message || 'Erreur lors de la soumission du formulaire'
        )
        onError?.(
          submitError.message || 'Erreur lors de la soumission du formulaire'
        )
        return
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      })

      if (error) {
        setError(error.message || 'Erreur lors du paiement')
        onError?.(error.message || 'Erreur lors du paiement')
      } else {
        onSuccess?.('subscription_created')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer et s'abonner
          </>
        )}
      </Button>
    </form>
  )
}

const StripeCheckout = ({ plan, onSuccess, onError }: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // Créer l'intention de paiement
      const response = await paymentAPI.createPaymentIntent({
        amount: plan === 'starter' ? 2900 : plan === 'professional' ? 7900 : 0, // Montant en centimes
        currency: 'eur',
        plan,
      })

      if (response.success && response.data) {
        setClientSecret(response.data.clientSecret)
      } else {
        const errorMessage =
          response.message || "Erreur lors de l'initialisation du paiement"
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Paiement sécurisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Plan: <span className="font-semibold capitalize">{plan}</span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={initializePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initialisation...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Continuer vers le paiement
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>✅ Paiement sécurisé par Stripe</p>
            <p>✅ 14 jours d'essai gratuit</p>
            <p>✅ Annulation possible à tout moment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Finaliser le paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#3b82f6',
              },
            },
          }}
        >
          <PaymentForm onSuccess={onSuccess} onError={onError} />
        </Elements>
      </CardContent>
    </Card>
  )
}

export default StripeCheckout
