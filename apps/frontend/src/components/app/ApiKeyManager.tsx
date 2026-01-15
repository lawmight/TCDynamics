/**
 * API Key Manager Component
 * Main component for listing, creating, and revoking API keys
 */

import {
  AlertTriangle,
  Calendar,
  Clock,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ApiKey } from '@/api/apiKeys'
import { useApiKeys } from '@/hooks/useApiKeys'
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

import { ApiKeyCreateDialog } from './ApiKeyCreateDialog'

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'Never used'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
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
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground shrink-0" />
              {apiKey.name ? (
                <span className="font-medium truncate">{apiKey.name}</span>
              ) : (
                <span className="text-muted-foreground italic">
                  Unnamed key
                </span>
              )}
            </div>
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate">
              {apiKey.key_prefix}
            </code>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {formatDate(apiKey.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(apiKey.last_used_at)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            disabled={isRevoking}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            {isRevoking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Revoke key</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Key className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No API keys</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Create an API key to access the API programmatically from your
          applications, scripts, or integrations.
        </p>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create your first API key
        </Button>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="flex gap-4">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
      error.message?.includes('Session expired') ||
      error.message?.includes('session has expired') ||
      error.message?.includes('Authentication required')

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading API keys</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {import.meta.env.DEV && isAuthError && (
            <p className="text-xs text-muted-foreground italic">
              Tip: In development mode, Clerk sessions may expire quickly. Make
              sure your Vercel dev server is running and both frontend and API
              are using the same Clerk instance.
            </p>
          )}
          {isAuthError ? (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/login')}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                Sign In Again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
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
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Manage API keys for programmatic access
          </CardDescription>
        </div>
        {keys.length > 0 && (
          <Button size="sm" onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create key
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : keys.length === 0 ? (
        <EmptyState onCreate={handleOpenCreateDialog} />
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
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You are about to revoke the following API key. This action can be
              undone within 10 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Context and warnings outside Description (block elements) */}
          <div className="space-y-3 pt-2">
            {/* Key Context Card */}
            <div className="rounded-md border bg-muted/50 p-3 space-y-2">
              {keyToRevoke?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">{keyToRevoke.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Key Prefix:</span>
                <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                  {keyToRevoke?.key_prefix}
                </code>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created:</span>
                <span>{formatDate(keyToRevoke?.created_at ?? null)}</span>
              </div>
              {keyToRevoke?.last_used_at && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last Used:</span>
                  <span>{formatDate(keyToRevoke.last_used_at)}</span>
                </div>
              )}
            </div>

            {/* Warning Alert */}
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Immediate Impact</AlertTitle>
              <AlertDescription>
                This key will stop working immediately. Any applications or
                services using this key will lose access and may experience
                downtime.
              </AlertDescription>
            </Alert>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCloseRevokeDialog}
              disabled={isRevoking}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Key'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
