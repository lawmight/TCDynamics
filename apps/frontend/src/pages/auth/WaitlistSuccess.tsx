import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ArrowLeft from '~icons/lucide/arrow-left'
import CheckCircle2 from '~icons/lucide/check-circle-2'

const WaitlistSuccess = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center shadow-elegant">
        <div className="space-y-4">
          <div className="bg-success/10 text-success mx-auto flex size-16 items-center justify-center rounded-full">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold">Vous êtes bien inscrit(e) !</h1>
          <p className="text-muted-foreground">
            Merci d'avoir rejoint la liste d'attente TCDynamics. Nous vous
            enverrons un email dès que votre accès sera disponible.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            En attendant, vous pouvez découvrir nos fonctionnalités et voir
            comment TCDynamics peut aider votre entreprise.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default WaitlistSuccess
