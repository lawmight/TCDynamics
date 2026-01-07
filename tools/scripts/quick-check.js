#!/usr/bin/env node

/**
 * Quick check: lint + type-check only (no tests)
 * Auto-detects workspace and runs quick checks
 */
import { execSync } from 'child_process'
import { resolve } from 'path'
import { detectWorkspace, projectRoot } from './detect-workspace.js'

const workspace = detectWorkspace()

if (workspace === 'root') {
  console.error('❌ Error: Please run from apps/frontend or apps/backend directory')
  console.log('Or use: npm run quick-check:frontend or npm run quick-check:backend')
  process.exit(1)
}

const workspacePath = resolve(projectRoot, `apps/${workspace}`)

try {
  console.log(`⚡ Quick check for ${workspace} workspace...\n`)

  // Lint
  console.log('🔍 Linting...')
  execSync('npm run lint', { cwd: workspacePath, stdio: 'inherit' })

  // Type check
  console.log('\n✅ Type checking...')
  execSync('npm run type-check', { cwd: workspacePath, stdio: 'inherit' })

  console.log(`\n✨ ${workspace} workspace looks good!`)
} catch (error) {
  console.error(`\n❌ Quick check failed for ${workspace}`)
  process.exit(1)
}
