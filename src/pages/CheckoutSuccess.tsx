import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import confetti from 'canvas-confetti'
import { ArrowRight, CheckCircle, Download, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

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
    window.location.href = 'mailto:support@tcdynamics.fr'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <Card className="text-center bg-card/95 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Paiement réussi ! 🎉
              </h1>

              <p className="text-xl text-muted-foreground mb-6">
                Merci pour votre confiance. Votre paiement a été traité avec
                succès.
              </p>

              {sessionId && (
                <div className="inline-flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-muted-foreground">
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
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Confirmation de commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Un email de confirmation a été envoyé à votre adresse avec tous
                les détails de votre commande et les prochaines étapes pour
                commencer à utiliser TCDynamics.
              </p>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Vérifiez votre email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Consultez votre boîte de réception pour l'email de
                      confirmation et les instructions de configuration.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Configurez votre compte
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Suivez le lien dans l'email pour créer votre compte et
                      accéder à votre tableau de bord.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Commencez à utiliser TCDynamics
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explorez les fonctionnalités et commencez à automatiser
                      vos processus métier.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Support disponible
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Notre équipe technique est disponible pour vous
                      accompagner dans votre prise en main.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Notre équipe est là pour vous aider. N'hésitez pas à nous
                contacter si vous avez la moindre question ou si vous rencontrez
                un problème.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSupportClick}
                  className="flex-1"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter le support
                </Button>

                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link to="/">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Message */}
          <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-8">
              <p className="text-lg font-medium text-foreground mb-2">
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
