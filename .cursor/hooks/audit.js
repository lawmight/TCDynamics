/**
 * Cursor hook: audit (beforeShellExecution, beforeSubmitPrompt, stop).
 * Reads JSON from stdin, appends a log line to .cursor/hooks/logs/audit.log,
 * then prints the required JSON to stdout and exits 0.
 *
 * Required stdout per event (Cursor docs + forum-valid types):
 * - beforeShellExecution: { "permission": "allow" }
 * - beforeSubmitPrompt:   { "continue": true }
 * - stop:                {}
 *
 * Hardened: empty/invalid stdin fallback, Windows path normalization,
 * error logging to audit-errors.log on unexpected failures.
 */

const fs = require('fs')
const path = require('path')

function writeErrorLog(message, detail) {
  try {
    const base = process.cwd()
    const logDir = path.join(base, '.cursor', 'hooks', 'logs')
    fs.mkdirSync(logDir, { recursive: true })
    const errPath = path.join(logDir, 'audit-errors.log')
    const line = [new Date().toISOString(), message, detail].join('\t') + '\n'
    fs.appendFileSync(errPath, line)
  } catch (_) {}
}

function normalizeProjectRoot(v) {
  if (typeof v !== 'string') return v
  // Cursor on Windows may send /c:/Users/... or /C:/
  if (/^\/[a-zA-Z]:/.test(v)) return v.replace(/^\/([a-zA-Z]):/, '$1:')
  return v
}

let raw = ''
try {
  raw = fs.readFileSync(0, 'utf8')
} catch (e) {
  writeErrorLog('stdin read error', e.message)
  raw = '{}'
}

let data = {}
try {
  data = raw && raw.trim() ? JSON.parse(raw) : {}
} catch (e) {
  writeErrorLog('JSON parse error', (e.message || '') + ' rawLength=' + (raw ? raw.length : 0))
}

const projectRoot =
  normalizeProjectRoot(data.workspace_roots && data.workspace_roots[0]) ||
  process.env.CURSOR_PROJECT_DIR ||
  process.env.CLAUDE_PROJECT_DIR ||
  process.cwd()

try {
  const logDir = path.join(projectRoot, '.cursor', 'hooks', 'logs')
  fs.mkdirSync(logDir, { recursive: true })
  const logPath = path.join(logDir, 'audit.log')
  // Infer event when hook_event_name is missing (defense in depth)
  const event =
    data.hook_event_name ||
    (data.status === 'completed' ? 'stop' : null) ||
    (data.prompt !== undefined ? 'beforeSubmitPrompt' : null) ||
    (data.command !== undefined ? 'beforeShellExecution' : null) ||
    'unknown'
  const rawTrunc = (raw || '(empty)').length > 2000 ? (raw || '').slice(0, 2000) + '...[truncated]' : (raw || '(empty)')
  const line = [new Date().toISOString(), event, rawTrunc].join('\t') + '\n'
  fs.appendFileSync(logPath, line)

  if (event === 'beforeShellExecution' || event === 'beforeMCPExecution') {
    process.stdout.write(JSON.stringify({ permission: 'allow' }) + '\n')
  } else if (event === 'beforeSubmitPrompt') {
    process.stdout.write(JSON.stringify({ continue: true }) + '\n')
  } else if (event === 'stop') {
    process.stdout.write(JSON.stringify({}) + '\n')
  } else {
    // unknown: output both so we don't block beforeShell or beforeSubmit
    process.stdout.write(JSON.stringify({ permission: 'allow', continue: true }) + '\n')
  }
  process.exit(0)
} catch (e) {
  writeErrorLog('main error', (e.message || '') + ' ' + (e.stack || ''))
  process.exit(1)
}
