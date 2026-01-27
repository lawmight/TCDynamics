import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ArrowRight from '~icons/lucide/arrow-right'
import CheckCircle from '~icons/lucide/check-circle'
import Download from '~icons/lucide/download'
import Mail from '~icons/lucide/mail'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  // Support both session_id (legacy) and checkout_id (Polar) for backward compatibility
  const sessionId =
    searchParams.get('session_id') || searchParams.get('checkout_id')
  const source = searchParams.get('source') // 'manual' for public checkouts
  const isManualCheckout = source === 'manual'

  useEffect(() => {
    // Trigger confetti animation on component mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    })
  }, [])

  const handleSupportClick = () => {
    if (typeof window !== 'undefined' && window.location?.assign) {
      window.location.assign('mailto:support@tcdynamics.fr')
      return
    }
    // Fallback for environments without assign (tests)
    window.location.href = 'mailto:support@tcdynamics.fr'
  }

  return (
    <div className="from-background to-background/50 min-h-screen bg-gradient-to-b py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Success Header */}
          <Card className="border-primary/20 bg-card/95 text-center backdrop-blur-sm">
            <CardContent className="pb-6 pt-8">
              <div className="mb-6 flex justify-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="size-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h1 className="text-foreground mb-4 text-4xl font-bold lg:text-5xl">
                Paiement réussi ! 🎉
              </h1>

              <p className="text-muted-foreground mb-6 text-xl">
                {isManualCheckout
                  ? 'Votre paiement a été enregistré. Vous recevrez un email de confirmation avec les instructions pour créer votre compte.'
                  : 'Merci pour votre confiance. Votre paiement a été traité avec succès.'}
              </p>

              {sessionId && (
                <div className="bg-muted/50 inline-flex items-center gap-2 rounded-lg px-4 py-2">
                  <span className="text-muted-foreground text-sm">
                    Session ID:
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {sessionId}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Confirmation */}
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Mail className="text-primary size-6" />
                Confirmation de commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isManualCheckout
                  ? 'Un email de confirmation a été envoyé à votre adresse avec tous les détails de votre paiement. Vous recevrez également les instructions pour créer votre compte et accéder à TCDynamics.'
                  : 'Un email de confirmation a été envoyé à votre adresse avec tous les détails de votre commande et les prochaines étapes pour commencer à utiliser TCDynamics.'}
              </p>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Mail className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      Vérifiez votre email
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Consultez votre boîte de réception pour l'email de
                      confirmation et les instructions de configuration.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Download className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {isManualCheckout
                        ? 'Créez votre compte'
                        : 'Configurez votre compte'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {isManualCheckout
                        ? "Suivez le lien dans l'email pour créer votre compte et accéder à votre tableau de bord. Votre paiement sera automatiquement lié à votre compte."
                        : "Suivez le lien dans l'email pour créer votre compte et accéder à votre tableau de bord."}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <ArrowRight className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      Commencez à utiliser TCDynamics
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Explorez les fonctionnalités et commencez à automatiser
                      vos processus métier.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <CheckCircle className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      Support disponible
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Notre équipe technique est disponible pour vous
                      accompagner dans votre prise en main.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Notre équipe est là pour vous aider. N'hésitez pas à nous
                contacter si vous avez la moindre question ou si vous rencontrez
                un problème.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleSupportClick}
                  className="flex-1"
                  size="lg"
                >
                  <Mail className="mr-2 size-4" />
                  Contacter le support
                </Button>

                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link to="/">
                    <ArrowRight className="mr-2 size-4" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Message */}
          <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-r text-center">
            <CardContent className="py-8">
              <p className="text-foreground mb-2 text-lg font-medium">
                Merci pour votre confiance !
              </p>
              <p className="text-muted-foreground">
                Nous sommes ravis de vous compter parmi nos clients et nous nous
                engageons à vous accompagner dans votre transformation digitale.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess
