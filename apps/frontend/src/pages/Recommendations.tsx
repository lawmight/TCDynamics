import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { fetchMetricsOverview } from '@/api/metrics'
import { getWithMigration, LS } from '@/utils/storageMigration'

const getStoredProjectId = (): string => {
  try {
    return getWithMigration(LS.RUM_PROJECT_ID, 'rum.projectId') || ''
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

const IMPACT_LABELS: Record<Rec['impact'], string> = {
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
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
        title: "Optimiser l'image LCP",
        rationale:
          "Réduisez le LCP en compressant l'image hero, en fixant des dimensions explicites et en préchargeant la ressource critique.",
        impact: 'high',
      })
    }
    if (r.INP && num(r.INP.p75) > 200) {
      list.push({
        id: 'inp-longtask',
        title: 'Réduire le travail du thread principal',
        rationale:
          'Découpez les longues tâches, chargez le JavaScript non critique à la demande et différez les scripts tiers.',
        impact: 'high',
      })
    }
    if (r.CLS && num(r.CLS.p75) > 0.1) {
      list.push({
        id: 'cls-layout',
        title: 'Stabiliser la mise en page',
        rationale:
          "Définissez des dimensions explicites sur les images et évitez d'insérer du contenu au-dessus du contenu déjà affiché.",
        impact: 'medium',
      })
    }
    if (!list.length) {
      list.push({
        id: 'good',
        title: 'Très bon travail',
        rationale:
          'Les Core Web Vitals sont bons. Maintenez vos budgets de performance et surveillez les régressions.',
        impact: 'low',
      })
    }
    return list
  }, [data])

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Recommandations</h1>
      <ul className="space-y-3">
        {recs.map(r => (
          <li key={r.id} className="rounded-md border p-4">
            <div className="text-lg font-medium">{r.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {r.rationale}
            </div>
            <span
              className={`mt-2 inline-block rounded px-2 py-1 text-xs ${r.impact === 'high' ? 'bg-destructive/10 text-destructive' : r.impact === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}
            >
              {IMPACT_LABELS[r.impact]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Recommendations
