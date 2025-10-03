// src/components/contact/ContactInfo.tsx
// Optimized contact information component

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Phone,
  Mail,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  Building,
} from 'lucide-react'

interface ContactInfoItem {
  icon: React.ComponentType<{ className?: string }>
  title: string
  details: string[]
}

interface ContactInfoProps {
  className?: string
}

const contactInfo: ContactInfoItem[] = [
  {
    icon: Building,
    title: 'Siège social',
    details: [
      'WorkFlowAI France',
      '12 Avenue des Prés',
      '78180 Montigny-le-Bretonneux',
      'Île-de-France',
    ],
  },
  {
    icon: Phone,
    title: 'Téléphone',
    details: [
      'Standard : 01 39 44 75 00',
      'Support : 01 39 44 75 01',
      'Commercial : 01 39 44 75 02',
      'Lundi-Vendredi 8h-19h',
    ],
  },
  {
    icon: Mail,
    title: 'Email',
    details: [
      'contact@workflowai.fr',
      'support@workflowai.fr',
      'commercial@workflowai.fr',
      'Réponse sous 24h',
    ],
  },
  {
    icon: Clock,
    title: 'Horaires',
    details: [
      'Lundi-Vendredi : 8h-19h',
      'Samedi : 9h-17h',
      'Dimanche : Fermé',
      'Jours fériés : Fermé',
    ],
  },
]

const ContactInfoCard = memo(({ item }: { item: ContactInfoItem }) => {
  const IconComponent = item.icon

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconComponent className="h-5 w-5 text-blue-600" />
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {item.details.map((detail, index) => (
          <p key={index} className="text-sm text-gray-600">
            {detail}
          </p>
        ))}
      </CardContent>
    </Card>
  )
})

ContactInfoCard.displayName = 'ContactInfoCard'

export const ContactInfo = memo(({ className }: ContactInfoProps) => {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Contactez-nous
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Notre équipe est à votre disposition pour répondre à toutes vos
          questions et vous accompagner dans votre transformation digitale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((item, index) => (
          <ContactInfoCard key={index} item={item} />
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-blue-900">
            Pourquoi nous choisir ?
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Équipe experte</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Disponibilité 7j/7</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Support personnalisé</span>
          </div>
        </div>
      </div>
    </div>
  )
})

ContactInfo.displayName = 'ContactInfo'
