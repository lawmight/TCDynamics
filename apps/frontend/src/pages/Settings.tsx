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
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-2">
        <label htmlFor="projectId" className="block text-sm font-medium">
          Project ID
        </label>
        <input
          id="projectId"
          aria-required="true"
          className="w-full rounded-md border p-2"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="UUID of your project"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="writeKey" className="block text-sm font-medium">
          Public Write Key
        </label>
        <input
          id="writeKey"
          aria-required="true"
          className="w-full rounded-md border p-2"
          value={writeKey}
          onChange={e => setWriteKey(e.target.value)}
          placeholder="pk_..."
        />
      </div>
      <button
        aria-label="Save RUM configuration settings"
        className="rounded-md bg-blue-600 px-4 py-2 text-white"
        onClick={handleSave}
      >
        Save
      </button>
      <div>
        <label
          htmlFor="embedSnippet"
          className="mb-1 block text-sm font-medium"
        >
          Embed Snippet
        </label>
        <pre
          id="embedSnippet"
          className="whitespace-pre-wrap break-all rounded-md border bg-muted p-3 text-xs"
        >
          {snippet}
        </pre>
      </div>
    </div>
  )
}

export default Settings
