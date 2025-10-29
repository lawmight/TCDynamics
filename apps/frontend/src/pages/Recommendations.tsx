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

type Rec = {
  id: string
  title: string
  rationale: string
  impact: 'low' | 'medium' | 'high'
}

const Recommendations = () => {
  const [projectId] = useState<string>(getStoredProjectId())
  const days = 7
  const { data } = useQuery({
    queryKey: ['metrics', 'overview', projectId, days],
    queryFn: () => fetchMetricsOverview(projectId, days),
    enabled: !!projectId,
  })

  const recs = useMemo<Rec[]>(() => {
    const r = data?.results || {}
    const num = (v: unknown) =>
      typeof v === 'string' ? Number(v) : (v as number)
    const list: Rec[] = []
    if (r.LCP && num(r.LCP.p75) > 2500) {
      list.push({
        id: 'lcp-img',
        title: 'Optimize LCP image',
        rationale:
          'Reduce LCP by compressing and properly sizing the hero image, add preload for critical resource.',
        impact: 'high',
      })
    }
    if (r.INP && num(r.INP.p75) > 200) {
      list.push({
        id: 'inp-longtask',
        title: 'Reduce main-thread work',
        rationale:
          'Break up long tasks; code-split non-critical JS and defer analytics/3rd party scripts.',
        impact: 'high',
      })
    }
    if (r.CLS && num(r.CLS.p75) > 0.1) {
      list.push({
        id: 'cls-layout',
        title: 'Stabilize layout',
        rationale:
          'Set explicit width/height on images and ads; avoid inserting content above existing content.',
        impact: 'medium',
      })
    }
    if (!list.length) {
      list.push({
        id: 'good',
        title: 'Great job!',
        rationale:
          'Core Web Vitals look good. Maintain budgets and monitor regressions.',
        impact: 'low',
      })
    }
    return list
  }, [data])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Recommendations</h1>
      <ul className="space-y-3">
        {recs.map(r => (
          <li key={r.id} className="border rounded-md p-4">
            <div className="text-lg font-medium">{r.title}</div>
            <div className="text-gray-600 text-sm mt-1">{r.rationale}</div>
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded ${r.impact === 'high' ? 'bg-red-100 text-red-700' : r.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
            >
              {r.impact.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Recommendations
