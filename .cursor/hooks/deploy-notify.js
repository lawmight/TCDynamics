/**
 * Cursor hook: afterShellExecution
 * When the command matches deploy/test patterns, POSTs a short message to
 * DEPLOY_NOTIFY_WEBHOOK or SLACK_WEBHOOK_URL so you get notified externally
 * (e.g. "Deploy triggered", "Tests finished") while awaiting CI/Vercel.
 *
 * Env: DEPLOY_NOTIFY_WEBHOOK or SLACK_WEBHOOK_URL (optional)
 * If unset, exits 0 and does nothing. Fail-open.
 */

const fs = require('fs')
const https = require('https')
const http = require('http')

const DEPLOY_PATTERN = /vercel|git\s+push|npm\s+run\s+(deploy|ship|preview)/
const TEST_PATTERN = /npm\s+run\s+test|npm\s+test|npx\s+(jest|vitest)/

function getWebhook() {
  return process.env.DEPLOY_NOTIFY_WEBHOOK || process.env.SLACK_WEBHOOK_URL || ''
}

function post(u, body) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(u)
      const isHttps = parsed.protocol === 'https:'
      const lib = isHttps ? https : http
      const str = typeof body === 'string' ? body : JSON.stringify(body)
      const opts = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(str, 'utf8') },
      }
      const req = lib.request(opts, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 400 }))
      })
      req.on('error', () => resolve({ ok: false }))
      req.setTimeout(8000, () => { req.destroy(); resolve({ ok: false }) })
      req.write(str)
      req.end()
    } catch (_) {
      resolve({ ok: false })
    }
  })
}

function main() {
  let raw = '{}'
  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch (_) {}
  let data = {}
  try {
    data = raw && raw.trim() ? JSON.parse(raw) : {}
  } catch (_) {}

  const webhook = getWebhook()
  if (!webhook) process.exit(0)

  const cmd = (data.command || '').trim()
  if (!cmd) process.exit(0)

  let kind = null
  if (DEPLOY_PATTERN.test(cmd)) kind = 'deploy'
  else if (TEST_PATTERN.test(cmd)) kind = 'test'
  if (!kind) process.exit(0)

  const truncated = cmd.length > 120 ? cmd.slice(0, 117) + '...' : cmd
  const text =
    kind === 'deploy'
      ? `Deploy triggered: \`${truncated}\`. Vercel/GH will update in 1–2 min.`
      : `Tests run: \`${truncated}\`. Check output in Cursor.`

  const payload = { text }
  post(webhook, payload).then(() => process.exit(0))
}

main()
