#!/usr/bin/env node

/**
 * Test a single file - auto-detects workspace and runs appropriate test command
 * Usage: npm run test-this -- src/components/Button.tsx
 */
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { relative, resolve } from 'path'
import { detectWorkspace, projectRoot } from './detect-workspace.js'

const filePath = process.argv[2]

if (!filePath) {
  console.error('❌ Error: Please provide a file path')
  console.log('Usage: npm run test-this -- <file-path>')
  console.log('Example: npm run test-this -- src/components/Button.tsx')
  process.exit(1)
}

const workspace = detectWorkspace()
const cwd = process.cwd()

// Resolve the file path
let testFile = filePath
if (!filePath.startsWith('/') && !filePath.match(/^[A-Z]:/)) {
  // Relative path - resolve from current directory
  testFile = resolve(cwd, filePath)
}

// Check if file exists
if (!existsSync(testFile)) {
  console.error(`❌ Error: File not found: ${testFile}`)
  process.exit(1)
}

// Determine workspace based on file path
let targetWorkspace = workspace
if (testFile.includes('apps/frontend') || testFile.includes('apps\\frontend')) {
  targetWorkspace = 'frontend'
} else if (
  testFile.includes('apps/backend') ||
  testFile.includes('apps\\backend')
) {
  targetWorkspace = 'backend'
} else if (workspace === 'root') {
  // Try to detect from file path relative to project root
  const relativePath = relative(projectRoot, testFile)
  if (
    relativePath.startsWith('apps/frontend') ||
    relativePath.startsWith('apps\\frontend')
  ) {
    targetWorkspace = 'frontend'
  } else if (
    relativePath.startsWith('apps/backend') ||
    relativePath.startsWith('apps\\backend')
  ) {
    targetWorkspace = 'backend'
  }
}

// Get relative path for the test command
let relativeTestPath = filePath
if (targetWorkspace === 'frontend') {
  const frontendPath = resolve(projectRoot, 'apps/frontend')
  if (testFile.startsWith(frontendPath)) {
    relativeTestPath = relative(frontendPath, testFile).replace(/\\/g, '/')
  }
} else if (targetWorkspace === 'backend') {
  const backendPath = resolve(projectRoot, 'apps/backend')
  if (testFile.startsWith(backendPath)) {
    relativeTestPath = relative(backendPath, testFile).replace(/\\/g, '/')
  }
}

try {
  // Use platform-specific npm command for Windows compatibility
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  if (targetWorkspace === 'frontend') {
    console.log(`🧪 Testing file in frontend: ${relativeTestPath}`)
    const result = spawnSync(npmCmd, ['run', 'test', '--', relativeTestPath], {
      cwd: resolve(projectRoot, 'apps/frontend'),
      stdio: 'inherit',
    })
    if (result.status !== 0) {
      process.exit(result.status || 1)
    }
  } else if (targetWorkspace === 'backend') {
    console.log(`🧪 Testing file in backend: ${relativeTestPath}`)
    const result = spawnSync(npmCmd, ['run', 'test', '--', relativeTestPath], {
      cwd: resolve(projectRoot, 'apps/backend'),
      stdio: 'inherit',
    })
    if (result.status !== 0) {
      process.exit(result.status || 1)
    }
  } else {
    console.error('❌ Error: Could not determine workspace for file')
    console.log(
      'Please run from apps/frontend or apps/backend directory, or provide full path'
    )
    process.exit(1)
  }
} catch (error) {
  process.exit(1)
}
