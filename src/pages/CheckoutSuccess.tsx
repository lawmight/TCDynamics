import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react'

const CheckoutSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Checkout successful - user reached success page')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-mono text-muted-foreground">
                Paiement confirmé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-mono font-bold text-foreground mb-2">
              Bienvenue dans TCDynamics !
            </h1>
            <p className="text-muted-foreground font-mono text-lg">
              Votre abonnement a été activé avec succès
            </p>
          </div>

          {/* Success Card */}
          <Card className="bg-card/30 border-primary/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Abonnement activé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono">Statut</span>
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-500"
                >
                  Actif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono">Période d'essai</span>
                <Badge variant="outline">14 jours restants</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono">Prochaine facturation</span>
                <span className="font-mono text-sm text-muted-foreground">
                  Dans 14 jours
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Prochaines étapes
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card/20 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-mono font-semibold mb-2">
                    Vérifiez vos emails
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    Recevez votre confirmation et guide de démarrage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/20 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all">
                <CardContent className="p-6 text-center">
                  <Download className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-mono font-semibold mb-2">
                    Accédez à votre compte
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    Connectez-vous pour commencer à utiliser TCDynamics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full md:w-auto"
            >
              Commencer à utiliser TCDynamics
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/#features')}
                className="font-mono"
              >
                Découvrir les fonctionnalités
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/#contact')}
                className="font-mono"
              >
                Contacter le support
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground font-mono">
              Une question ? Notre équipe est là pour vous aider à{' '}
              <button
                onClick={() => navigate('/#contact')}
                className="text-primary hover:underline"
              >
                tout moment
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess
