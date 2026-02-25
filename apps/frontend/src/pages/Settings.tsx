import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import ApiKeyManager from '@/components/app/ApiKeyManager'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRequireAuth } from '@/hooks/useAuth'
import { getWithMigration, LS } from '@/utils/storageMigration'
import Code from '~icons/lucide/code'
import Key from '~icons/lucide/key'
import Mail from '~icons/lucide/mail'
import UserIcon from '~icons/lucide/user'

const Settings = () => {
  const { isSignedIn, loading } = useRequireAuth()
  const { user } = useUser()

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

  const handleSaveRum = () => {
    try {
      localStorage.setItem(LS.RUM_PROJECT_ID, projectId)
      localStorage.setItem(LS.RUM_WRITE_KEY, writeKey)
      toast.success('Configuration saved!')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const snippet = `<script src="/rum/v1/rum.js" data-key="${writeKey || 'YOUR_WRITE_KEY'}" data-project="${projectId || 'YOUR_PROJECT_ID'}" defer></script>`

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="bg-muted h-8 w-32 rounded" />
          <div className="bg-muted h-64 rounded" />
        </div>
      </div>
    )
  }

  if (!isSignedIn) return null

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.primaryEmailAddress?.emailAddress || 'User'
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    ''

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account, API keys, and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5">
            <UserIcon className="size-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <Key className="size-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Mail className="size-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="developer" className="gap-1.5">
            <Code className="size-3.5" />
            Developer
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Account</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Your account details are managed through Clerk.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full text-lg font-semibold">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{displayName}</p>
                  <p className="text-muted-foreground text-sm">{email}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                To update your name, email, or password, use the Clerk
                UserButton in the sidebar.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card className="p-6">
            <ApiKeyManager />
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Email Notifications</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Control which emails you receive from TCDynamics.
            </p>
            <Separator className="my-4" />
            <Link
              to="/app/settings/email"
              className="inline-flex items-center gap-2"
            >
              <Button>
                <Mail className="mr-1.5 size-3.5" />
                Manage Email Preferences
              </Button>
            </Link>
          </Card>
        </TabsContent>

        {/* Developer Tab */}
        <TabsContent value="developer">
          <Card className="p-6">
            <h2 className="text-base font-semibold">RUM Configuration</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure Real User Monitoring for your applications.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  aria-required="true"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  placeholder="UUID of your project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="writeKey">Public Write Key</Label>
                <Input
                  id="writeKey"
                  aria-required="true"
                  value={writeKey}
                  onChange={e => setWriteKey(e.target.value)}
                  placeholder="pk_..."
                />
              </div>
              <Button onClick={handleSaveRum}>Save Configuration</Button>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="embedSnippet">Embed Snippet</Label>
                <pre
                  id="embedSnippet"
                  className="bg-muted whitespace-pre-wrap break-all rounded-lg border p-3 font-mono text-xs"
                >
                  {snippet}
                </pre>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
