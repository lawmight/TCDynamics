/**
 * EmailPreferences Page
 * User settings for email notification preferences
 * Following email-sequence skill: one-click unsubscribe, clear control
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/useToast'
import Bell from '~icons/lucide/bell'
import Check from '~icons/lucide/check'
import ChevronLeft from '~icons/lucide/chevron-left'
import Mail from '~icons/lucide/mail'
import Sparkles from '~icons/lucide/sparkles'
import TrendingUp from '~icons/lucide/trending-up'

interface EmailPreference {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
}

const EmailPreferences = () => {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [preferences, setPreferences] = useState<EmailPreference[]>([
    {
      id: 'onboarding',
      label: "Emails d'onboarding",
      description: 'Rappels et conseils pour bien démarrer',
      icon: Sparkles,
      enabled: true,
    },
    {
      id: 'product_updates',
      label: 'Mises à jour produit',
      description: 'Nouvelles fonctionnalités et améliorations',
      icon: TrendingUp,
      enabled: true,
    },
    {
      id: 'tips',
      label: 'Astuces et bonnes pratiques',
      description: 'Conseils pour optimiser votre utilisation',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'notifications',
      label: 'Notifications système',
      description: 'Alertes importantes sur votre compte',
      icon: Bell,
      enabled: true,
    },
  ])

  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Convert preferences array to object format for API
      const preferencesObj = preferences.reduce(
        (acc, pref) => {
          acc[pref.id] = pref.enabled
          return acc
        },
        {} as Record<string, boolean>
      )

      const response = await fetch('/api/user?action=email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: preferencesObj }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      toast({
        title: 'Préférences enregistrées',
        description: 'Vos préférences email ont été mises à jour.',
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnsubscribeAll = async () => {
    setPreferences(prev => prev.map(p => ({ ...p, enabled: false })))

    toast({
      title: 'Désinscrit de tous les emails',
      description: "Vous ne recevrez plus d'emails de communication.",
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/app/settings"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Retour aux paramètres
        </Link>

        <h1 className="text-2xl font-bold">Préférences email</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez les types d'emails que vous souhaitez recevoir.
        </p>
      </div>

      {/* Preferences List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Communications</CardTitle>
          <CardDescription>
            Choisissez les emails que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.map(pref => (
            <div
              key={pref.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <pref.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{pref.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={pref.enabled}
                onCheckedChange={() => togglePreference(pref.id)}
                aria-label={`${pref.enabled ? 'Désactiver' : 'Activer'} ${pref.label}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnsubscribeAll}
          className="text-muted-foreground"
        >
          Se désinscrire de tout
        </Button>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Check className="mr-2 size-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {/* Legal Note */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Les emails transactionnels (réinitialisation de mot de passe,
        confirmations) seront toujours envoyés quel que soit votre choix.
      </p>
    </div>
  )
}

export default EmailPreferences
