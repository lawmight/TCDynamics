import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import ApiKeyManager from '@/components/app/ApiKeyManager'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRequireAuth } from '@/hooks/useAuth'
import { getWithMigration, LS } from '@/utils/storageMigration'

const Settings = () => {
  // Require authentication for this page
  const { isSignedIn, loading } = useRequireAuth()

  const [projectId, setProjectId] = useState('')
  const [writeKey, setWriteKey] = useState('')

  useEffect(() => {
    try {
      setProjectId(getWithMigration(LS.RUM_PROJECT_ID, 'rum.projectId') || '')
      setWriteKey(getWithMigration(LS.RUM_WRITE_KEY, 'rum.writeKey') || '')
    } catch {
      /* noop */
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem(LS.RUM_PROJECT_ID, projectId)
      localStorage.setItem(LS.RUM_WRITE_KEY, writeKey)
      toast.success('Configuration saved!', {
        description: 'Your settings have been saved successfully',
      })
    } catch {
      toast.error('Error saving', {
        description: 'Unable to save settings',
      })
    }
  }

  const snippet = `<script src="/rum/v1/rum.js" data-key="${writeKey || 'YOUR_WRITE_KEY'}" data-project="${projectId || 'YOUR_PROJECT_ID'}" defer></script>`

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  // Don't render if not signed in (useRequireAuth will redirect)
  if (!isSignedIn) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* API Keys Section */}
      <section>
        <ApiKeyManager />
      </section>

      <Separator />

      {/* Email Preferences Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Email Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Manage your email notification preferences.
        </p>
        <Link
          to="/app/email-preferences"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Manage Email Preferences
        </Link>
      </section>

      <Separator />

      {/* RUM Configuration Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">RUM Configuration</h2>
        <div className="space-y-2">
          <Label htmlFor="projectId" className="block">
            Project ID
          </Label>
          <Input
            id="projectId"
            aria-required="true"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            placeholder="UUID of your project"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="writeKey" className="block">
            Public Write Key
          </Label>
          <Input
            id="writeKey"
            aria-required="true"
            value={writeKey}
            onChange={e => setWriteKey(e.target.value)}
            placeholder="pk_..."
          />
        </div>
        <button
          aria-label="Save RUM configuration settings"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
        <div>
          <label
            htmlFor="embedSnippet"
            className="mb-1 block text-sm font-medium"
          >
            Embed Snippet
          </label>
          <pre
            id="embedSnippet"
            className="whitespace-pre-wrap break-all rounded-md border bg-muted p-3 text-xs"
          >
            {snippet}
          </pre>
        </div>
      </section>
    </div>
  )
}

export default Settings
