import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { fetchMetricsOverview } from '@/api/metrics'

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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Recommendations</h1>
      <ul className="space-y-3">
        {recs.map(r => (
          <li key={r.id} className="rounded-md border p-4">
            <div className="text-lg font-medium">{r.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {r.rationale}
            </div>
            <span
              className={`mt-2 inline-block rounded px-2 py-1 text-xs ${r.impact === 'high' ? 'bg-destructive/10 text-destructive' : r.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-primary/10 text-primary'}`}
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
