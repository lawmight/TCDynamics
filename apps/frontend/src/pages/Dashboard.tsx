import { fetchMetricsOverview } from '@/api/metrics'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

const getStoredProjectId = (): string => {
  try {
    return localStorage.getItem('rum.projectId') || ''
  } catch {
    return ''
  }
}

const Dashboard = () => {
  const [projectId] = useState<string>(getStoredProjectId())
  const days = 7

  const { data, isLoading, isError } = useQuery({
    queryKey: ['metrics', 'overview', projectId, days],
    queryFn: () => fetchMetricsOverview(projectId, days),
    enabled: !!projectId,
  })

  const cards = useMemo(() => {
    const r = data?.results || {}
    const asNum = (v: unknown) =>
      typeof v === 'string' ? Number(v) : (v as number)
    return [
      {
        key: 'LCP',
        label: 'p75 LCP (ms)',
        value: r.LCP ? Math.round(asNum(r.LCP.p75)) : '-',
      },
      {
        key: 'INP',
        label: 'p75 INP (ms)',
        value: r.INP ? Math.round(asNum(r.INP.p75)) : '-',
      },
      {
        key: 'CLS',
        label: 'p75 CLS',
        value: r.CLS ? asNum(r.CLS.p75).toFixed(3) : '-',
      },
      {
        key: 'FCP',
        label: 'p75 FCP (ms)',
        value: r.FCP ? Math.round(asNum(r.FCP.p75)) : '-',
      },
    ]
  }, [data])

  if (!projectId) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">
          Web Performance Dashboard
        </h1>
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
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">
          Web Performance Dashboard
        </h1>
        <p className="text-red-600">Failed to load metrics.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Web Performance Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.key} className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="text-2xl font-bold mt-1">{String(card.value)}</div>
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-sm mt-4">
        Window: last {days} days • Project: {projectId}
      </p>
    </div>
  )
}

export default Dashboard
