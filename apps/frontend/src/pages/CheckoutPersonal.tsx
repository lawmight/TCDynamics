import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ArrowLeft from '~icons/lucide/arrow-left'
import CreditCard from '~icons/lucide/credit-card'
import Lock from '~icons/lucide/lock'
import Shield from '~icons/lucide/shield'

const CheckoutPersonal = () => {
  const [amount, setAmount] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [plan, setPlan] = useState<'starter' | 'professional'>('starter')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const amountNum = parseFloat(amount.replace(',', '.'))
      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Le montant doit être un nombre positif.')
        setIsLoading(false)
        return
      }

      const amountCents = Math.round(amountNum * 100)

      const response = await fetch('/api/polar/checkout?public=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: plan,
          amount: amountCents,
          currency: 'usd',
          paymentType: 'one_time',
          customerEmail: email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            'Une erreur est survenue lors de la création de la session de paiement'
        )
        setIsLoading(false)
        return
      }

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
    const cleaned = value.replace(/[^\d,.-]/g, '')
    return cleaned
  }

  const amountNum = parseFloat(amount.replace(',', '.')) || 0
  const isAmountValid = amountNum > 0

  return (
    <div className="from-background to-background/50 min-h-screen bg-gradient-to-b py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          <Button asChild variant="ghost" className="mb-8" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Retour à l'accueil
            </Link>
          </Button>

          <div className="mb-12 text-center">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary mb-4"
            >
              <Lock className="mr-1 size-3" />
              Paiement sécurisé
            </Badge>
            <h1 className="text-foreground mb-4 text-4xl font-bold lg:text-5xl">
              Checkout Particulier
            </h1>
            <p className="text-muted-foreground text-xl">
              Encaissez un paiement individuel en personne
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Détails du paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Offre</Label>
                      <select
                        id="plan"
                        name="plan"
                        value={plan}
                        onChange={e =>
                          setPlan(
                            e.target.value === 'professional'
                              ? 'professional'
                              : 'starter'
                          )
                        }
                        aria-label="Sélection du plan"
                        className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        <option value="starter">Starter (individuel)</option>
                        <option value="professional">
                          Professional (individuel)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant</Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
                          <span className="text-muted-foreground">$</span>
                        </div>
                        <Input
                          id="amount"
                          name="amount"
                          type="text"
                          inputMode="decimal"
                          placeholder="ex: 49.00"
                          value={amount}
                          onChange={e =>
                            setAmount(formatAmount(e.target.value))
                          }
                          step="0.01"
                          className="pl-10"
                          required
                        />
                      </div>
                      {amount && !isAmountValid && (
                        <p className="text-destructive text-sm">
                          Le montant doit être supérieur à 0.
                        </p>
                      )}
                      {amount && isAmountValid && (
                        <p className="text-muted-foreground text-sm">
                          Montant:{' '}
                          {amountNum.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email du client (optionnel mais recommandé)
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="client@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
                        <p className="text-destructive text-sm">{error}</p>
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
                          <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Redirection...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 size-4" />
                          Continuer vers le paiement
                        </>
                      )}
                    </Button>

                    <p className="text-muted-foreground text-xs">
                      En cliquant sur "Continuer vers le paiement", vous
                      acceptez nos conditions générales de vente et notre
                      politique de confidentialité.
                    </p>
                  </CardContent>
                </Card>

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

              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="text-primary size-6" />
                      Informations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="mb-3 text-lg font-semibold">
                        Paiement sécurisé par Polar
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Vos informations de paiement sont traitées de manière
                        sécurisée. Nous n&apos;enregistrons pas vos données
                        bancaires.
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Après avoir cliqué sur "Continuer vers le paiement",
                        vous serez redirigé vers la page sécurisée de Polar où
                        vous pourrez entrer l&apos;email du client et ses
                        informations de paiement.
                      </p>
                    </div>

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

                <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-r">
                  <CardContent className="p-6">
                    <p className="mb-4 text-center text-sm">
                      Des questions sur ce paiement ?
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

export default CheckoutPersonal
