import { useEffect, useState } from 'react'

const Settings = () => {
  const [projectId, setProjectId] = useState('')
  const [writeKey, setWriteKey] = useState('')

  useEffect(() => {
    try {
      setProjectId(localStorage.getItem('rum.projectId') || '')
      setWriteKey(localStorage.getItem('rum.writeKey') || '')
    } catch {
      /* noop */
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem('rum.projectId', projectId)
      localStorage.setItem('rum.writeKey', writeKey)
      alert('Saved!')
    } catch {
      /* noop */
    }
  }

  const snippet = `<script src="/rum/v1/rum.js" data-key="${writeKey || 'YOUR_WRITE_KEY'}" data-project="${projectId || 'YOUR_PROJECT_ID'}" defer></script>`

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Project ID</label>
        <input
          className="w-full border rounded-md p-2"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="UUID of your project"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Public Write Key</label>
        <input
          className="w-full border rounded-md p-2"
          value={writeKey}
          onChange={e => setWriteKey(e.target.value)}
          placeholder="pk_..."
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={handleSave}
      >
        Save
      </button>
      <div>
        <label className="block text-sm font-medium mb-1">Embed Snippet</label>
        <pre className="whitespace-pre-wrap break-all border rounded-md p-3 text-xs bg-gray-50">
          {snippet}
        </pre>
      </div>
    </div>
  )
}

export default Settings
