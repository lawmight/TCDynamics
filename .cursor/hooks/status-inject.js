/**
 * Cursor hook: sessionStart
 * Fetches CI/CD (GitHub Actions), Vercel deployments, and "awaiting" counts
 * (contacts, demo requests, Polar events) and injects them as additional_context.
 *
 * Env: VERCEL_TOKEN, VERCEL_PROJECT_ID, GITHUB_TOKEN, GITHUB_REPO,
 *      INTERNAL_HOOK_TOKEN, API_BASE_URL (optional, default https://api.tcdynamics.fr)
 * Fail-open: on fetch errors, sections are omitted; always exits 0.
 */

const https = require('https')

const API_BASE = process.env.API_BASE_URL || 'https://api.tcdynamics.fr'
const FETCH_TIMEOUT_MS = 6000

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
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
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, data, status: res.statusCode })
          } catch (_) {
            resolve({ ok: false, data: '', status: res.statusCode })
          }
        })
      }
    )
    req.setTimeout(FETCH_TIMEOUT_MS, () => { req.destroy(); resolve({ ok: false, data: '' }) })
    req.on('error', () => resolve({ ok: false, data: '' }))
    req.end()
  })
}

async function getVercel() {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return null
  const u = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=3`
  const res = await fetch(u, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  try {
    const j = JSON.parse(res.data)
    const deployments = (j.deployments || []).map((d) => ({
      state: d.state,
      url: d.url,
      created: d.createdAt,
    }))
    return deployments
  } catch (_) {
    return null
  }
}

async function getGitHub() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  if (!token || !repo) return null
  const u = `https://api.github.com/repos/${repo}/actions/runs?per_page=5`
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) return null
  try {
    const j = JSON.parse(res.data)
    const runs = (j.workflow_runs || []).map((r) => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      html_url: r.html_url,
    }))
    return runs
  } catch (_) {
    return null
  }
}

async function getAwaiting() {
  const token = process.env.INTERNAL_HOOK_TOKEN
  if (!token) return null
  const u = `${API_BASE}/api/awaiting-summary`
  const res = await fetch(u, {
    headers: { 'x-internal-token': token },
  })
  if (!res.ok) return null
  try {
    return JSON.parse(res.data)
  } catch (_) {
    return null
  }
}

function formatBlock(label, lines) {
  if (!lines || lines.length === 0) return ''
  return `## ${label}\n${lines.join('\n')}\n`
}

async function main() {
  const [vercel, github, awaiting] = await Promise.all([
    getVercel(),
    getGitHub(),
    getAwaiting(),
  ])

  const lines = []

  // Vercel
  if (vercel && vercel.length > 0) {
    const vs = vercel
      .slice(0, 2)
      .map((d) => `- ${d.state}${d.url ? ` (${d.url})` : ''}`)
    const failed = vercel.find((d) => d.state === 'ERROR' || d.state === 'CANCELED')
    if (failed) vs.unshift('- **Last error**: one or more deployments failed or canceled.')
    lines.push(formatBlock('Vercel (latest)', vs))
  }

  // GitHub Actions
  if (github && github.length > 0) {
    const gs = github.map((r) => {
      const c = r.conclusion || r.status
      const icon = c === 'success' ? '✅' : c === 'failure' ? '❌' : '🔄'
      const link = r.html_url ? ` [run](${r.html_url})` : ''
      return `- ${icon} ${r.name}: ${c}${link}`
    })
    const failed = github.find((r) => r.conclusion === 'failure')
    if (failed) gs.unshift('- **Latest failure**: check the failed run for details.')
    lines.push(formatBlock('CI (GitHub Actions)', gs))
  }

  // Awaiting: contacts, demos, Polar
  if (awaiting) {
    const a = []
    const c = awaiting.contacts
    const d = awaiting.demoRequests
    const p = awaiting.polar
    if (c && (c.new > 0 || c.last24h > 0))
      a.push(`- **Contacts**: ${c.new} new, ${c.last24h} in last 24h`)
    if (d && (d.pending > 0 || d.last7d > 0))
      a.push(`- **Demo requests**: ${d.pending} pending, ${d.last7d} in last 7d`)
    if (p && (p.last24h > 0 || p.last7d > 0)) {
      let pol = `- **Polar (payments/events)**: ${p.last24h} last 24h, ${p.last7d} last 7d`
      if (p.byType && Object.keys(p.byType).length > 0) {
        pol += ` — ${Object.entries(p.byType).map(([t, n]) => `${t}: ${n}`).join(', ')}`
      }
      a.push(pol)
    }
    if (a.length > 0) lines.push(formatBlock('Awaiting / recent', a))
  }

  const base = 'Project: TCDynamics. Prefer @/ imports, avoid console.log, follow .cursor/rules.'
  const block = lines.filter(Boolean).join('\n').trim()
  const additional_context = block ? block + '\n\n---\n\n' + base : base

  const out = { additional_context, env: {}, continue: true }
  process.stdout.write(JSON.stringify(out) + '\n')
  process.exit(0)
}

main().catch(() => {
  const out = {
    additional_context: 'Project: TCDynamics. Follow .cursor/rules.',
    env: {},
    continue: true,
  }
  process.stdout.write(JSON.stringify(out) + '\n')
  process.exit(0)
})
