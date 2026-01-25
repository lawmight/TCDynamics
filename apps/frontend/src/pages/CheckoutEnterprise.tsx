import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ArrowLeft from '~icons/lucide/arrow-left'
import CreditCard from '~icons/lucide/credit-card'
import Lock from '~icons/lucide/lock'
import Shield from '~icons/lucide/shield'

// Minimum amount in dollars (from MIN_CHECKOUT_AMOUNT env var, default: 2160$)
const MIN_AMOUNT_EUROS = 2160

const CheckoutEnterprise = () => {
  const _navigate = useNavigate()
  const [amount, setAmount] = useState<string>('')
  const [isSubscription, setIsSubscription] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Parse and validate amount
      const amountNum = parseFloat(amount.replace(',', '.'))
      if (isNaN(amountNum) || amountNum < MIN_AMOUNT_EUROS) {
        setError(
          `Le montant minimum est de ${MIN_AMOUNT_EUROS.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
        )
        setIsLoading(false)
        return
      }

      // Convert euros to cents (multiply by 100 and round)
      const amountCents = Math.round(amountNum * 100)

      // Determine payment type
      const paymentType = isSubscription ? 'subscription' : 'one_time'

      // Call public checkout API
      const response = await fetch(
        '/api/polar/checkout?public=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planName: 'enterprise',
            amount: amountCents,
            currency: 'usd',
            paymentType,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            'Une erreur est survenue lors de la création de la session de paiement'
        )
        setIsLoading(false)
        return
      }

      // Redirect to Polar checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('URL de paiement non reçue')
        setIsLoading(false)
      }
    } catch {
      setError(
        'Une erreur est survenue. Veuillez réessayer ou contacter notre support.'
      )
      setIsLoading(false)
    }
  }

  const formatAmount = (value: string) => {
    // Allow only numbers, comma, and dot
    const cleaned = value.replace(/[^\d,.-]/g, '')
    // Replace comma with dot for parsing
    return cleaned
  }

  const amountNum = parseFloat(amount.replace(',', '.')) || 0
  const isAmountValid = amountNum >= MIN_AMOUNT_EUROS

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
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
              Checkout Entreprise
            </h1>
            <p className="text-xl text-muted-foreground">
              Configurez votre paiement sur mesure pour l'entreprise
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Amount Input */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Montant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Montant (minimum{' '}
                        {MIN_AMOUNT_EUROS.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                        )
                      </Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
                          <span className="text-muted-foreground">$</span>
                        </div>
                        <Input
                          id="amount"
                          name="amount"
                          type="text"
                          inputMode="decimal"
                          placeholder="2160.00"
                          value={amount}
                          onChange={e => setAmount(formatAmount(e.target.value))}
                          min={MIN_AMOUNT_EUROS}
                          step="0.01"
                          className="pl-10"
                          required
                        />
                      </div>
                      {amount && !isAmountValid && (
                        <p className="text-sm text-destructive">
                          Le montant minimum est de{' '}
                          {MIN_AMOUNT_EUROS.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </p>
                      )}
                      {amount && isAmountValid && (
                        <p className="text-sm text-muted-foreground">
                          Montant: {amountNum.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Payment Type Selection */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <Label className="text-base">Type de paiement</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="one-time"
                            name="paymentType"
                            checked={!isSubscription}
                            onChange={() => setIsSubscription(false)}
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                          />
                          <Label
                            htmlFor="one-time"
                            className="cursor-pointer font-normal"
                          >
                            Paiement unique
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="subscription"
                            name="paymentType"
                            checked={isSubscription}
                            onChange={() => setIsSubscription(true)}
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                          />
                          <Label
                            htmlFor="subscription"
                            className="cursor-pointer font-normal"
                          >
                            Créer un abonnement récurrent
                          </Label>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !amount || !isAmountValid}
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
                          Continuer vers le paiement
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      En cliquant sur "Continuer vers le paiement", vous acceptez
                      nos conditions générales de vente et notre politique de
                      confidentialité.
                    </p>
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

              {/* Information Card */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="h-6 w-6 text-primary" />
                      Informations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted/30 p-6">
                      <h3 className="mb-3 text-lg font-semibold">
                        Paiement sécurisé par Polar
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Vos informations de paiement sont traitées de manière
                        sécurisée. Nous n'enregistrons pas vos données
                        bancaires.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Après avoir cliqué sur "Continuer vers le paiement", vous
                        serez redirigé vers la page sécurisée de Polar où vous
                        pourrez entrer votre email et vos informations de
                        paiement.
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
                      Des questions sur votre paiement ?
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
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckoutEnterprise
