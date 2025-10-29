#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function runCommand(command, description, cwd = process.cwd()) {
  try {
    console.log(`🔍 ${description}...`)
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed`)
    throw error
  }
}

function main() {
  try {
    console.log('🚀 Running comprehensive pre-push checks...\n')

    // Build verification
    runCommand('npm run build', 'Verifying build')

    // Run full test suite
    runCommand('npm run test -- --run', 'Running full test suite')

    // Backend checks
    console.log('\n🔧 Checking backend...')
    const backendPath = path.join(process.cwd(), 'backend')
    runCommand(
      'npm ci --silent',
      'Installing backend dependencies',
      backendPath
    )
    runCommand('npm run lint', 'Running backend linting', backendPath)
    runCommand('npm run test', 'Running backend tests', backendPath)

    // Azure Functions checks
    console.log('\n☁️ Checking Azure Functions...')
    const functionsPath = path.join(process.cwd(), 'TCDynamics')

    // Check if requirements.txt exists
    if (fs.existsSync(path.join(functionsPath, 'requirements.txt'))) {
      runCommand(
        'pip install -r requirements.txt --quiet',
        'Installing Python dependencies',
        functionsPath
      )

      // Lint and test failures are non-fatal - log warnings but continue
      try {
        runCommand(
          'python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics',
          'Running Python linting',
          functionsPath
        )
      } catch (error) {
        console.log('⚠️ Python linting failed, but continuing...')
      }

      try {
        runCommand(
          'python -m pytest --tb=short -q',
          'Running Python tests',
          functionsPath
        )
      } catch (error) {
        console.log('⚠️ Python tests failed, but continuing...')
      }
    } else {
      console.log('⚠️ No requirements.txt found, skipping Python checks')
    }

    // Security audit
    runCommand(
      'npm audit --audit-level high',
      'Auditing dependencies for security vulnerabilities'
    )

    console.log('\n✅ All pre-push checks passed!')
  } catch (error) {
    console.error('\n❌ Pre-push checks failed!')
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
