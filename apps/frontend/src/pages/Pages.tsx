import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchMetricsPages } from '@/api/metrics'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { getWithMigration, LS } from '@/utils/storageMigration'
import FileText from '~icons/lucide/file-text'
import Settings from '~icons/lucide/settings'

const getStoredProjectId = (): string => {
  try {
    return getWithMigration(LS.RUM_PROJECT_ID, 'rum.projectId') || ''
  } catch {
    return ''
  }
}

const Pages = () => {
  const [projectId] = useState<string>(getStoredProjectId())
  const days = 7
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['metrics', 'pages', projectId, days],
    queryFn: () => fetchMetricsPages(projectId, days, 100),
    enabled: !!projectId,
  })

  // React Compiler handles optimization automatically
  const rows = data?.pages || []

  if (!projectId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <EmptyState
          icon={<Settings className="size-7" />}
          title="Aucun projet configuré"
          description="Ajoutez votre identifiant de projet dans les paramètres pour afficher les performances par page."
          action={
            <Button asChild>
              <Link to="/app/settings">Ouvrir les paramètres</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <LoadingState label="Chargement des performances par page..." />
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <ErrorState
          variant="card"
          title="Impossible de charger les performances"
          message="Les indicateurs par page n'ont pas pu être récupérés."
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Pages</h1>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Chemin</th>
              <th className="p-2 text-left">Échantillons</th>
              <th className="p-2 text-left">p75 LCP (ms)</th>
              <th className="p-2 text-left">p75 INP (ms)</th>
              <th className="p-2 text-left">p75 CLS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.path} className="border-t">
                <td className="p-2 font-mono">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="text-muted-foreground size-3.5" />
                    {r.path}
                  </span>
                </td>
                <td className="p-2">{r.samples}</td>
                <td className="p-2">{r.p75LCP ? Math.round(r.p75LCP) : '-'}</td>
                <td className="p-2">{r.p75INP ? Math.round(r.p75INP) : '-'}</td>
                <td className="p-2">{r.p75CLS ? r.p75CLS.toFixed(3) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Fenêtre : {days} derniers jours • Projet : {projectId}
      </p>
    </div>
  )
}

export default Pages
