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
  .max(100, 'API key name must be 100 characters or less')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'API key name can only contain letters, numbers, spaces, hyphens, and underscores'
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
      toast.success('API key copied to clipboard')

      // Reset copy button after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCreate = () => {
    // Validate name if provided
    if (name.trim()) {
      const trimmedName = name.trim()
      const result = apiKeyNameSchema.safeParse(trimmedName)

      if (!result.success) {
        setNameError(result.error.errors[0]?.message || 'Invalid name')
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
        setNameError(result.error.errors[0]?.message || 'Invalid name')
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
        toast.warning('Make sure to copy your API key before closing', {
          description: "You won't be able to see it again",
          action: {
            label: 'Close anyway',
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
            {createdKey ? 'Your API Key' : 'Create API Key'}
          </DialogTitle>
          <DialogDescription>
            {createdKey
              ? "Copy this key now. You won't be able to see it again."
              : 'Create a new API key to access the API programmatically.'}
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          // Creation form
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name (optional)</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production Server, CI/CD Pipeline"
                value={name}
                onChange={handleNameChange}
                disabled={isCreating}
                className={nameError ? 'border-destructive' : ''}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'key-name-error' : undefined}
              />
              {nameError ? (
                <p className="text-destructive text-xs" id="key-name-error">
                  {nameError}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Give your key a name to identify it later (max 100 characters,
                  alphanumeric, spaces, hyphens, and underscores only).
                </p>
              )}
            </div>
          </div>
        ) : (
          // Key display
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
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
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Store this key securely</AlertTitle>
              <AlertDescription>
                This is the only time you&apos;ll see this key. Store it in a
                secure location like a password manager or environment
                variables. Never commit API keys to version control.
              </AlertDescription>
            </Alert>

            <p className="text-muted-foreground text-center text-xs">
              This dialog will auto-close in {autoCloseCountdown} seconds
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
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Key'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              <X className="mr-2 size-4" />
              {copied ? 'Close' : "I've copied the key"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
