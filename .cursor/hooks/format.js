/**
 * Cursor hook: afterFileEdit.
 * Runs Prettier on the edited file when the extension is supported.
 * Reads JSON from stdin (file_path, edits, ...). No stdout required.
 * Fail-open: always exit 0 so the agent loop is not blocked.
 */

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const EXTS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.css', '.yml', '.yaml']

let raw = ''
try {
  raw = fs.readFileSync(0, 'utf8')
} catch (e) {
  process.exit(0)
}
let data
try {
  data = JSON.parse(raw)
} catch (e) {
  process.exit(0)
}
const filePath = data.file_path
if (!filePath || typeof filePath !== 'string') process.exit(0)
const ext = path.extname(filePath).toLowerCase()
if (!EXTS.includes(ext)) process.exit(0)

const projectRoot =
  (data.workspace_roots && data.workspace_roots[0]) ||
  process.env.CURSOR_PROJECT_DIR ||
  process.env.CLAUDE_PROJECT_DIR ||
  process.cwd()

spawnSync('npx', ['prettier', '--write', filePath], {
  cwd: projectRoot,
  stdio: 'ignore',
  shell: true
})
process.exit(0)
