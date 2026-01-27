import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Cloud from '~icons/lucide/cloud'
import Lock from '~icons/lucide/lock'
import Phone from '~icons/lucide/phone'
import Shield from '~icons/lucide/shield'

const Security = () => {
  const guarantees = [
    {
      icon: Shield,
      title: 'Hébergement en France',
      description: 'Données hébergées sur des infrastructures européennes.',
    },
    {
      icon: Lock,
      title: 'RGPD prêt',
      description:
        'Chiffrement en transit et au repos, DPA fourni sur demande.',
    },
    {
      icon: Cloud,
      title: 'Disponibilité',
      description:
        'Objectif 99.9% de disponibilité. Statuts et alertes en préparation.',
    },
  ]

  return (
    <div className="from-background to-background/60 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Badge
            variant="outline"
            className="border-primary/40 text-primary mb-4"
          >
            Security & Availability
          </Badge>
          <h1 className="text-foreground mb-4 text-4xl font-bold lg:text-5xl">
            Sécurité, conformité et disponibilité
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
            Cette page est un point de passage rapide en attendant la
            publication complète (certifications, statuts temps réel et
            runbooks). Contactez-nous pour obtenir les documents à jour.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guarantees.map(item => (
            <Card
              key={item.title}
              className="border-primary/20 bg-card/60 backdrop-blur-sm"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <item.icon className="text-primary size-6" />
                  <h3 className="text-foreground text-lg font-semibold">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-foreground text-xl font-bold">
                Documents disponibles
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• DPA / RGPD</li>
                <li>• Architecture & zones d'hébergement</li>
                <li>• Politique de sauvegarde et rétention</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                Demandez-les lors de la démo ou par le canal support.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-foreground text-xl font-bold">
                Contact sécurité
              </h3>
              <p className="text-muted-foreground text-sm">
                Besoin d'une revue ou d'un questionnaire ? Contactez-nous.
              </p>
              <div className="text-primary flex items-center gap-2 font-mono text-sm">
                <Phone className="size-4" />
                <Link
                  to="/#contact"
                  className="underline-offset-4 hover:underline"
                >
                  Parler à un expert
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Security
