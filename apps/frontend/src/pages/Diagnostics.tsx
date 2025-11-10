import { useEffect, useMemo, useState } from 'react'

type Entry = { name: string; duration: number }

const Diagnostics = () => {
  const [longTasks, setLongTasks] = useState<Entry[]>([])

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const obs = new PerformanceObserver(list => {
        const items = list
          .getEntries()
          .map(e => ({ name: e.name, duration: Number(e.duration) }))
        setLongTasks(prev => [...prev, ...items].slice(-200))
      })
      try {
        obs.observe({
          type: 'longtask',
          buffered: true,
        } as PerformanceObserverInit)
      } catch {
        /* noop */
      }
      return () => {
        try {
          obs.disconnect()
        } catch {
          /* noop */
        }
      }
    }
    return undefined
  }, [])

  const topTasks = useMemo(
    () => longTasks.sort((a, b) => b.duration - a.duration).slice(0, 50),
    [longTasks]
  )

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Diagnostics</h1>
      <p className="mb-4 text-muted-foreground">
        Recent main-thread long tasks observed in this session.
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Duration (ms)</th>
            </tr>
          </thead>
          <tbody>
            {topTasks.map((t, idx) => (
              <tr key={idx} className="border-t">
                <td className="break-all p-2">{t.name || '(anonymous)'}</td>
                <td className="p-2">{Math.round(t.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Diagnostics
