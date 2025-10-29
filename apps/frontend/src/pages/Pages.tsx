import { fetchMetricsPages } from '@/api/metrics'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

const getStoredProjectId = (): string => {
  try {
    return localStorage.getItem('rum.projectId') || ''
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

  const rows = useMemo(() => data?.pages || [], [data])

  if (!projectId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Pages</h1>
        <p className="text-gray-600">
          No project configured. Go to Settings to set your Project ID.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Pages</h1>
        <p className="text-red-600">Failed to load page metrics.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Pages</h1>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Path</th>
              <th className="text-left p-2">Samples</th>
              <th className="text-left p-2">p75 LCP (ms)</th>
              <th className="text-left p-2">p75 INP (ms)</th>
              <th className="text-left p-2">p75 CLS</th>
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
      <p className="text-gray-500 text-sm mt-4">
        Window: last {days} days • Project: {projectId}
      </p>
    </div>
  )
}

export default Pages
