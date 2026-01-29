import { useEffect, useState } from 'react'

import { fetchAnalytics, type AnalyticsSummary } from '@/api/analytics'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Card } from '@/components/ui/card'
import Activity from '~icons/lucide/activity'
import BarChart2 from '~icons/lucide/bar-chart-2'
import Gauge from '~icons/lucide/gauge'
import Loader2 from '~icons/lucide/loader-2'

const Analytics = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const result = await fetchAnalytics()
        if (!isMounted) return
        setData(result)
      } catch (err) {
        if (!isMounted) return
        const message =
          err instanceof Error ? err.message : 'Failed to load analytics'
        setError(message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    void load()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Usage insights</p>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          High-level activity across chat, knowledge base, and active sessions.
        </p>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center gap-2 border-border bg-card/70 p-6">
          <Loader2 className="size-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </Card>
      ) : error ? (
        <Card className="border-border bg-card/70 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border bg-card/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Chat messages</p>
                  <AnimatedCounter
                    end={data.chatMessages ?? 0}
                    className="text-2xl font-semibold"
                  />
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <BarChart2 className="size-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Vertex AI traffic captured this week.
              </p>
            </Card>

            <Card className="border-border bg-card/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Knowledge uploads
                  </p>
                  <AnimatedCounter
                    end={data.uploads ?? 0}
                    className="text-2xl font-semibold"
                  />
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Activity className="size-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Documents available for retrieval.
              </p>
            </Card>

            <Card className="border-border bg-card/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active users</p>
                  <AnimatedCounter
                    end={data.activeUsers ?? 0}
                    className="text-2xl font-semibold"
                  />
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Gauge className="size-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Signed-in users over the last 24h.
              </p>
            </Card>
          </div>

          <Card className="border-border bg-card/80 p-4">
            <h3 className="text-base font-semibold">Latency snapshot</h3>
            <p className="text-sm text-muted-foreground">
              Average end-to-end latency from request to response for chat and
              uploads.
            </p>
            <div className="mt-4 text-3xl font-semibold">
              {data.avgLatencyMs ? `${Math.round(data.avgLatencyMs)} ms` : '—'}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}

export default Analytics
