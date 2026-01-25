/**
 * Cursor hook: stop
 * When status is "error", fetches GitHub Actions and Vercel and, if either has
 * a recent failure, returns followup_message so Cursor can auto-submit a
 * prompt to investigate.
 *
 * Env: VERCEL_TOKEN, VERCEL_PROJECT_ID, GITHUB_TOKEN, GITHUB_REPO
 * Reads stdin (hook payload). Exits 0; outputs {} or { followup_message }.
 */

const fs = require('fs')
const https = require('https')

const FETCH_TIMEOUT_MS = 5000

function fetch(url, opts = {}) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url)
      const req = https.request(
        {
          hostname: u.hostname,
          port: 443,
          path: u.pathname + u.search,
          method: opts.method || 'GET',
          headers: opts.headers || {},
        },
        (res) => {
          let data = ''
          res.on('data', (c) => (data += c))
          res.on('end', () => {
            try {
              resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                data,
                status: res.statusCode,
              })
            } catch (_) {
              resolve({ ok: false, data: '' })
            }
          })
        }
      )
      req.setTimeout(FETCH_TIMEOUT_MS, () => {
        req.destroy()
        resolve({ ok: false, data: '' })
      })
      req.on('error', () => resolve({ ok: false, data: '' }))
      req.end()
    } catch (_) {
      resolve({ ok: false, data: '' })
    }
  })
}

async function getVercel() {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return { failed: false }
  const u = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=3`
  const res = await fetch(u, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return { failed: false }
  try {
    const j = JSON.parse(res.data)
    const deployments = j.deployments || []
    const hasError = deployments.some((d) => d.state === 'ERROR' || d.state === 'CANCELED')
    const last = deployments[0]
    return {
      failed: hasError,
      url: last?.url ? `https://vercel.com/dashboard` : null,
      state: last?.state,
    }
  } catch (_) {
    return { failed: false }
  }
}

async function getGitHub() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  if (!token || !repo) return { failed: false }
  const u = `https://api.github.com/repos/${repo}/actions/runs?per_page=5`
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) return { failed: false }
  try {
    const j = JSON.parse(res.data)
    const runs = j.workflow_runs || []
    const failedRun = runs.find((r) => r.conclusion === 'failure')
    return {
      failed: !!failedRun,
      url: failedRun?.html_url || runs[0]?.html_url || `https://github.com/${repo}/actions`,
    }
  } catch (_) {
    return { failed: false }
  }
}

async function main() {
  let raw = '{}'
  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch (_) {}
  let data = {}
  try {
    data = raw && raw.trim() ? JSON.parse(raw) : {}
  } catch (_) {}

  const status = data.status || (data.hook_event_name === 'stop' ? 'completed' : 'completed')
  if (status !== 'error') {
    process.stdout.write(JSON.stringify({}) + '\n')
    process.exit(0)
    return
  }

  const [vercel, github] = await Promise.all([getVercel(), getGitHub()])
  const parts = []
  if (github.failed && github.url) parts.push(`GitHub Actions: ${github.url}`)
  if (vercel.failed && vercel.url) parts.push(`Vercel: ${vercel.url}`)
  if (parts.length === 0) {
    process.stdout.write(JSON.stringify({}) + '\n')
    process.exit(0)
    return
  }

  const followup_message =
    `CI or Vercel reported a failure. Should I investigate? — ${parts.join('; ')}`
  process.stdout.write(JSON.stringify({ followup_message }) + '\n')
  process.exit(0)
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}) + '\n')
  process.exit(0)
})
