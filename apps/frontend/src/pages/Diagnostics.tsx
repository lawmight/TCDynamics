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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Diagnostics</h1>
      <p className="text-gray-600 mb-4">
        Recent main-thread long tasks observed in this session.
      </p>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Duration (ms)</th>
            </tr>
          </thead>
          <tbody>
            {topTasks.map((t, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 break-all">{t.name || '(anonymous)'}</td>
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
