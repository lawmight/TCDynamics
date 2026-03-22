/**
 * API Key Manager Component
 * Main component for listing, creating, and revoking API keys
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiKeyCreateDialog } from './ApiKeyCreateDialog'

import type { ApiKey } from '@/api/apiKeys'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { useApiKeys } from '@/hooks/useApiKeys'
import AlertTriangle from '~icons/lucide/alert-triangle'
import Calendar from '~icons/lucide/calendar'
import Clock from '~icons/lucide/clock'
import Key from '~icons/lucide/key'
import Loader2 from '~icons/lucide/loader-2'
import Plus from '~icons/lucide/plus'
import RefreshCw from '~icons/lucide/refresh-cw'
import Trash2 from '~icons/lucide/trash-2'

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Jamais'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'Jamais utilisee'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  return formatDate(dateString)
}

function ApiKeyCard({
  apiKey,
  onRevoke,
  isRevoking,
}: {
  apiKey: ApiKey
  onRevoke: () => void
  isRevoking: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Key className="size-4 shrink-0 text-muted-foreground" />
              {apiKey.name ? (
                <span className="truncate font-medium">{apiKey.name}</span>
              ) : (
                <span className="italic text-muted-foreground">
                  Cle sans nom
                </span>
              )}
            </div>
            <code className="block truncate rounded bg-muted px-2 py-1 font-mono text-xs">
              {apiKey.key_prefix}
            </code>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                Creee le {formatDate(apiKey.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatRelativeDate(apiKey.last_used_at)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            disabled={isRevoking}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {isRevoking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            <span className="sr-only">Revoquer la cle</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ApiKeyManager() {
  const navigate = useNavigate()
  const {
    keys,
    isLoading,
    error,
    createKey,
    revokeKey,
    isCreating,
    isRevoking,
    createdKey,
    clearCreatedKey,
    refetch,
  } = useApiKeys()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true)
  }

  const handleCreateKey = (name?: string) => {
    createKey({ name })
  }

  const handleOpenRevokeDialog = (key: ApiKey) => {
    setKeyToRevoke(key)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = () => {
    if (keyToRevoke) {
      revokeKey(keyToRevoke.id)
      setRevokeDialogOpen(false)
      setKeyToRevoke(null)
    }
  }

  const handleCloseRevokeDialog = () => {
    setRevokeDialogOpen(false)
    setKeyToRevoke(null)
  }

  if (error) {
    const isAuthError =
      error.message?.includes('Session expirée') ||
      error.message?.includes('session has expired') ||
      error.message?.includes('Authentification requise') ||
      error.message?.includes('Authentication required')

    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Impossible de charger les cles API</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            {
              error.message ||
              'Une erreur inattendue est survenue. Veuillez reessayer.'
            }
          </p>
          {import.meta.env.DEV && isAuthError && (
            <p className="text-xs italic text-muted-foreground">
              Astuce: en mode developpement, les sessions Clerk peuvent expirer
              rapidement. Verifiez que votre serveur Vercel et le frontend
              utilisent la meme instance Clerk.
            </p>
          )}
          {isAuthError ? (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Se reconnecter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="mr-2 size-3" />
                Reessayer
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="mr-2 size-3" />
              Reessayer
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <CardTitle as="h2" className="text-base">
            Cles API
          </CardTitle>
          <CardDescription>
            Gere les cles pour acceder a l'API de facon programmatique
          </CardDescription>
        </div>
        {keys.length > 0 && (
          <Button size="sm" onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 size-4" />
            Creer une cle
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState
          variant="skeleton"
          preset="list"
          count={2}
          label="Chargement des cles API"
        />
      ) : keys.length === 0 ? (
        <EmptyState
          icon={<Key className="size-7" />}
          title="Aucune cle API"
          description="Creez une cle API pour connecter vos applications, scripts ou integrations a TCDynamics."
          action={
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 size-4" />
              Creer votre premiere cle
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {keys.map(key => (
            <ApiKeyCard
              key={key.id}
              apiKey={key}
              onRevoke={() => handleOpenRevokeDialog(key)}
              isRevoking={isRevoking}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ApiKeyCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateKey}
        isCreating={isCreating}
        createdKey={createdKey}
        onClose={clearCreatedKey}
      />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              <AlertDialogTitle>Revoquer cette cle API ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Vous allez revoquer la cle API suivante. Cette action peut etre
              annulee dans les 10 secondes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Context and warnings outside Description (block elements) */}
          <div className="space-y-3 pt-2">
            {/* Key Context Card */}
            <div className="space-y-2 rounded-md border bg-muted/50 p-3">
              {keyToRevoke?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nom :</span>
                  <span className="text-sm">{keyToRevoke.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prefixe :</span>
                <code className="rounded bg-background px-2 py-1 font-mono text-xs">
                  {keyToRevoke?.key_prefix}
                </code>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Creee le :</span>
                <span>{formatDate(keyToRevoke?.created_at ?? null)}</span>
              </div>
              {keyToRevoke?.last_used_at && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Derniere utilisation :</span>
                  <span>{formatDate(keyToRevoke.last_used_at)}</span>
                </div>
              )}
            </div>

            {/* Warning Alert */}
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="size-4" />
              <AlertTitle>Impact immediat</AlertTitle>
              <AlertDescription>
                Cette cle cessera de fonctionner immediatement. Les services qui
                l'utilisent perdront l'acces et pourront rencontrer une
                interruption.
              </AlertDescription>
            </Alert>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCloseRevokeDialog}
              disabled={isRevoking}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Revocation…
                </>
              ) : (
                'Revoquer la cle'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
