import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { fetchMetricsPages } from '@/api/metrics'
import { getWithMigration, LS } from '@/utils/storageMigration'

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['metrics', 'pages', projectId, days],
    queryFn: () => fetchMetricsPages(projectId, days, 100),
    enabled: !!projectId,
  })

  // React Compiler handles optimization automatically
  const rows = data?.pages || []

  if (!projectId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Pages</h1>
        <p className="text-muted-foreground">
          No project configured. Go to Settings to set your Project ID.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Pages</h1>
        <p className="text-destructive">Failed to load page metrics.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Pages</h1>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Path</th>
              <th className="p-2 text-left">Samples</th>
              <th className="p-2 text-left">p75 LCP (ms)</th>
              <th className="p-2 text-left">p75 INP (ms)</th>
              <th className="p-2 text-left">p75 CLS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.path} className="border-t">
                <td className="p-2 font-mono">{r.path}</td>
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
        Window: last {days} days • Project: {projectId}
      </p>
    </div>
  )
}

export default Pages
