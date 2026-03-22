import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import ApiKeyManager from '@/components/app/ApiKeyManager'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/ui/loading-state'
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
      toast.success('Configuration enregistrée')
    } catch {
      toast.error("Impossible d'enregistrer les paramètres")
    }
  }

  const snippet = `<script src="/rum/v1/rum.js" data-key="${writeKey || 'VOTRE_WRITE_KEY'}" data-project="${projectId || 'VOTRE_PROJECT_ID'}" defer></script>`

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <LoadingState
          variant="skeleton"
          preset="panel"
          label="Chargement des paramètres"
        />
      </div>
    )
  }

  if (!isSignedIn) return null

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.primaryEmailAddress?.emailAddress || 'Utilisateur'
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    ''

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-muted-foreground text-sm">
          Gère votre compte, vos clés API et vos préférences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="profile" className="gap-1.5">
            <UserIcon className="size-3.5" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <Key className="size-3.5" />
            Clés API
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Mail className="size-3.5" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="developer" className="gap-1.5">
            <Code className="size-3.5" />
            Développeur
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Compte</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Les informations de votre compte sont gérées via Clerk.
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
                Pour modifier votre nom, votre email ou votre mot de passe,
                utilisez le menu compte dans la barre latérale.
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
            <h2 className="text-base font-semibold">Notifications email</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Choisissez les emails que vous souhaitez recevoir de TCDynamics.
            </p>
            <Separator className="my-4" />
            <Link
              to="/app/settings/email"
              className="inline-flex items-center gap-2"
            >
              <Button>
                <Mail className="mr-1.5 size-3.5" />
                Gérer les préférences email
              </Button>
            </Link>
          </Card>
        </TabsContent>

        {/* Developer Tab */}
        <TabsContent value="developer">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Configuration RUM</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Configurez le Real User Monitoring pour vos applications.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Identifiant du projet</Label>
                <Input
                  id="projectId"
                  aria-required="true"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  placeholder="UUID de votre projet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="writeKey">Clé publique d'écriture</Label>
                <Input
                  id="writeKey"
                  aria-required="true"
                  value={writeKey}
                  onChange={e => setWriteKey(e.target.value)}
                  placeholder="pk_..."
                />
              </div>
              <Button onClick={handleSaveRum}>Enregistrer la configuration</Button>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="embedSnippet">Extrait d'integration</Label>
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
