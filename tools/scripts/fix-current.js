#!/usr/bin/env node

/**
 * Fix current workspace: format + lint:fix + type-check
 * Auto-detects workspace and runs fixes only for current workspace
 */
import { execSync } from 'child_process'
import { resolve } from 'path'
import { detectWorkspace, projectRoot } from './detect-workspace.js'

const workspace = detectWorkspace()

if (workspace === 'root') {
  console.error('❌ Error: Please run from apps/frontend or apps/backend directory')
  console.log('Or use: npm run fix:frontend or npm run fix:backend')
  process.exit(1)
}

const workspacePath = resolve(projectRoot, `apps/${workspace}`)

try {
  console.log(`🔧 Fixing ${workspace} workspace...\n`)

  // Format
  console.log('📝 Formatting code...')
  execSync('npm run format', { cwd: workspacePath, stdio: 'inherit' })

  // Lint fix
  console.log('\n🔍 Fixing linting issues...')
  execSync('npm run lint:fix', { cwd: workspacePath, stdio: 'inherit' })

  // Type check
  console.log('\n✅ Type checking...')
  execSync('npm run type-check', { cwd: workspacePath, stdio: 'inherit' })

  console.log(`\n✨ ${workspace} workspace fixed!`)
} catch (error) {
  console.error(`\n❌ Fix failed for ${workspace}`)
  process.exit(1)
}
