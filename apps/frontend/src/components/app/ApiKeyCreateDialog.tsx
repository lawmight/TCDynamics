/**
 * API Key Create Dialog Component
 * Displays newly created API key with copy functionality and security warnings
 */

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AlertTriangle from '~icons/lucide/alert-triangle'
import CheckCircle2 from '~icons/lucide/check-circle-2'
import Copy from '~icons/lucide/copy'
import Key from '~icons/lucide/key'
import Loader2 from '~icons/lucide/loader-2'
import X from '~icons/lucide/x'

interface ApiKeyCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name?: string) => void
  isCreating: boolean
  createdKey: {
    key: string
    key_prefix: string
  } | null
  onClose: () => void
}

const AUTO_CLOSE_SECONDS = 30

// Validation schema for API key name
const apiKeyNameSchema = z
  .string()
  .max(100, 'Le nom de la cle API doit contenir 100 caracteres maximum')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Le nom de la cle API ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'
  )
  .optional()
  .or(z.literal(''))

export function ApiKeyCreateDialog({
  open,
  onOpenChange,
  onConfirm,
  isCreating,
  createdKey,
  onClose,
}: ApiKeyCreateDialogProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoCloseCountdown, setAutoCloseCountdown] =
    useState(AUTO_CLOSE_SECONDS)

  // Define handleClose first so it can be used in useEffect
  const handleClose = useCallback(() => {
    if (createdKey) {
      onClose()
    }
    onOpenChange(false)
    setName('')
  }, [createdKey, onClose, onOpenChange])

  // Reset state when dialog opens
  useEffect(() => {
    if (open && !createdKey) {
      setName('')
      setNameError(null)
      setCopied(false)
      setAutoCloseCountdown(AUTO_CLOSE_SECONDS)
    }
  }, [open, createdKey])

  // Auto-close countdown when key is displayed
  useEffect(() => {
    if (!createdKey || !open) return

    const interval = setInterval(() => {
      setAutoCloseCountdown(prev => {
        if (prev <= 1) {
          handleClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [createdKey, open, handleClose])

  const handleCopy = async () => {
    if (!createdKey) return

    try {
      await navigator.clipboard.writeText(createdKey.key)
      setCopied(true)
      toast.success('Cle API copiee')

      // Reset copy button after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier la cle API')
    }
  }

  const handleCreate = () => {
    // Validate name if provided
    if (name.trim()) {
      const trimmedName = name.trim()
      const result = apiKeyNameSchema.safeParse(trimmedName)

      if (!result.success) {
        setNameError(result.error.errors[0]?.message || 'Nom invalide')
        return
      }
    }

    setNameError(null)
    onConfirm(name.trim() || undefined)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)

    // Clear error when user starts typing
    if (nameError) {
      setNameError(null)
    }

    // Validate on change if name is provided
    if (newName.trim()) {
      const trimmedName = newName.trim()
      const result = apiKeyNameSchema.safeParse(trimmedName)

      if (!result.success) {
        setNameError(result.error.errors[0]?.message || 'Nom invalide')
      }
    }
  }

  // Prevent accidental closing when key is displayed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && createdKey) {
      // Confirm before closing when key is visible
      if (copied) {
        handleClose()
      } else {
        toast.warning('Copiez votre cle API avant de fermer cette fenetre', {
          description: 'Vous ne pourrez plus la consulter ensuite',
          action: {
            label: 'Fermer quand meme',
            onClick: handleClose,
          },
        })
      }
    } else {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            {createdKey ? 'Votre cle API' : 'Creer une cle API'}
          </DialogTitle>
          <DialogDescription>
            {createdKey
              ? 'Copiez cette cle maintenant. Elle ne sera plus affichee ensuite.'
              : "Creez une nouvelle cle API pour acceder a l'API de facon programmatique."}
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          // Creation form
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Nom (optionnel)</Label>
              <Input
                id="key-name"
                placeholder="ex. Serveur de production, pipeline CI/CD"
                value={name}
                onChange={handleNameChange}
                disabled={isCreating}
                className={nameError ? 'border-destructive' : ''}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'key-name-error' : undefined}
              />
              {nameError ? (
                <p className="text-xs text-destructive" id="key-name-error">
                  {nameError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Donnez un nom a votre cle pour la retrouver plus tard (100
                  caracteres max, lettres, chiffres, espaces, tirets et
                  underscores uniquement).
                </p>
              )}
            </div>
          </div>
        ) : (
          // Key display
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Cle API</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  value={createdKey.key}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant={copied ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="text-success size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Conservez cette cle en lieu sur</AlertTitle>
              <AlertDescription>
                C'est la seule fois ou cette cle sera affichee. Stockez-la dans
                un gestionnaire de mots de passe ou dans des variables
                d'environnement. Ne versionnez jamais une cle API.
              </AlertDescription>
            </Alert>

            <p className="text-center text-xs text-muted-foreground">
              Cette fenetre se fermera automatiquement dans {autoCloseCountdown}{' '}
              secondes
            </p>
          </div>
        )}

        <DialogFooter>
          {!createdKey ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creation…
                  </>
                ) : (
                  'Creer la cle'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              <X className="mr-2 size-4" />
              {copied ? 'Fermer' : "J'ai copie la cle"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
