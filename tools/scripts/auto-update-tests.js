#!/usr/bin/env node

/**
 * Auto-update tests and scripts based on code changes
 * 
 * Detects changed files, maps them to tests, and updates tests/scripts as needed.
 * 
 * Usage:
 *   node tools/scripts/auto-update-tests.js [options]
 * 
 * Options:
 *   --dry-run          Show what would be updated without making changes
 *   --snapshots-only   Only update snapshot tests
 *   --check-only       Only check for issues, don't update
 *   --verbose          Show detailed output
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join, relative, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../..')

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const snapshotsOnly = args.includes('--snapshots-only')
const checkOnly = args.includes('--check-only')
const verbose = args.includes('--verbose') || args.includes('-v')

function log(message, level = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍',
  }[level] || 'ℹ️'
  
  if (level === 'debug' && !verbose) return
  console.log(`${prefix} ${message}`)
}

/**
 * Get changed files from git
 */
function getChangedFiles(baseRef = 'HEAD~1') {
  try {
    const output = execSync(`git diff --name-only ${baseRef} HEAD`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    })
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((file) => resolve(projectRoot, file))
      .filter((file) => existsSync(file))
  } catch (error) {
    log(`Error getting changed files: ${error.message}`, 'warning')
    return []
  }
}

/**
 * Map source file to potential test file
 */
function findTestFile(sourceFile) {
  const relativePath = relative(projectRoot, sourceFile)
  
  // Frontend test patterns
  if (relativePath.startsWith('apps/frontend/src/')) {
    const srcPath = relativePath.replace('apps/frontend/src/', '')
    const baseName = srcPath.replace(/\.(tsx?|jsx?)$/, '')
    
    // Check for co-located test
    const coLocatedTest = sourceFile.replace(/\.(tsx?|jsx?)$/, '.test.$1')
    if (existsSync(coLocatedTest)) {
      return coLocatedTest
    }
    
    // Check for __tests__ directory
    const dir = dirname(sourceFile)
    const testDir = join(dir, '__tests__')
    if (existsSync(testDir)) {
      const testFile = join(testDir, `${baseName.split('/').pop()}.test.tsx`)
      if (existsSync(testFile)) return testFile
      const testFileTs = join(testDir, `${baseName.split('/').pop()}.test.ts`)
      if (existsSync(testFileTs)) return testFileTs
    }
    
    // Check for test directory at same level
    const testFile = sourceFile.replace(/src\/(.+)\/(.+)\.(tsx?|jsx?)$/, 'src/$1/__tests__/$2.test.$3')
    if (existsSync(testFile)) return testFile
  }
  
  // Backend test patterns
  if (relativePath.startsWith('apps/backend/src/')) {
    const srcPath = relativePath.replace('apps/backend/src/', '')
    const baseName = srcPath.replace(/\.(js|ts)$/, '')
    
    // Check for co-located test
    const coLocatedTest = sourceFile.replace(/\.(js|ts)$/, '.test.$1')
    if (existsSync(coLocatedTest)) {
      return coLocatedTest
    }
    
    // Check for __tests__ directory
    const dir = dirname(sourceFile)
    const testDir = join(dir, '__tests__')
    if (existsSync(testDir)) {
      const testFile = join(testDir, `${baseName.split('/').pop()}.test.js`)
      if (existsSync(testFile)) return testFile
    }
  }
  
  return null
}

/**
 * Check if test file uses snapshots
 */
function usesSnapshots(testFile) {
  if (!existsSync(testFile)) return false
  
  try {
    const content = readFileSync(testFile, 'utf-8')
    return (
      content.includes('toMatchSnapshot') ||
      content.includes('toMatchInlineSnapshot') ||
      content.includes('snapshot')
    )
  } catch {
    return false
  }
}

/**
 * Update snapshot tests
 */
function updateSnapshots(testFiles) {
  const frontendTests = testFiles.filter((f) => f.includes('apps/frontend'))
  const backendTests = testFiles.filter((f) => f.includes('apps/backend'))
  
  const results = {
    updated: [],
    failed: [],
  }
  
  if (frontendTests.length > 0) {
    log(`Updating ${frontendTests.length} frontend snapshot test(s)...`)
    try {
      if (!dryRun && !checkOnly) {
        execSync('npm run test -- --update-snapshots', {
          cwd: join(projectRoot, 'apps/frontend'),
          stdio: verbose ? 'inherit' : 'pipe',
        })
        log('Frontend snapshots updated', 'success')
      } else {
        log('Would update frontend snapshots (dry-run)', 'debug')
      }
      results.updated.push(...frontendTests)
    } catch (error) {
      log(`Failed to update frontend snapshots: ${error.message}`, 'error')
      results.failed.push(...frontendTests)
    }
  }
  
  if (backendTests.length > 0) {
    log(`Updating ${backendTests.length} backend snapshot test(s)...`)
    try {
      if (!dryRun && !checkOnly) {
        execSync('npm run test -- -u', {
          cwd: join(projectRoot, 'apps/backend'),
          stdio: verbose ? 'inherit' : 'pipe',
        })
        log('Backend snapshots updated', 'success')
      } else {
        log('Would update backend snapshots (dry-run)', 'debug')
      }
      results.updated.push(...backendTests)
    } catch (error) {
      log(`Failed to update backend snapshots: ${error.message}`, 'error')
      results.failed.push(...backendTests)
    }
  }
  
  return results
}

/**
 * Find scripts that might reference changed files
 */
function findAffectedScripts(changedFiles) {
  const scripts = []
  const scriptDirs = [
    join(projectRoot, 'tools/scripts'),
    join(projectRoot, 'apps/frontend/scripts'),
    join(projectRoot, 'api/scripts'),
  ]
  
  for (const scriptDir of scriptDirs) {
    if (!existsSync(scriptDir)) continue
    
    try {
      const files = execSync(`find "${scriptDir}" -name "*.js" -type f`, {
        encoding: 'utf-8',
        shell: true,
      })
        .trim()
        .split('\n')
        .filter(Boolean)
      
      for (const scriptFile of files) {
        try {
          const content = readFileSync(scriptFile, 'utf-8')
          
          // Check if script imports/requires any changed file
          for (const changedFile of changedFiles) {
            const relativePath = relative(projectRoot, changedFile)
            const moduleName = relativePath.replace(/\.(tsx?|jsx?)$/, '')
            
            if (
              content.includes(moduleName) ||
              content.includes(relativePath) ||
              content.includes(changedFile)
            ) {
              scripts.push({
                script: scriptFile,
                reason: `References changed file: ${relativePath}`,
              })
              break
            }
          }
        } catch {
          // Skip files we can't read
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }
  
  return scripts
}

/**
 * Main execution
 */
function main() {
  log('Auto-update tests and scripts', 'info')
  log(`Mode: ${dryRun ? 'DRY RUN' : checkOnly ? 'CHECK ONLY' : 'UPDATE'}`, 'info')
  
  // Get changed files
  const changedFiles = getChangedFiles()
  if (changedFiles.length === 0) {
    log('No changed files detected', 'warning')
    return
  }
  
  log(`Found ${changedFiles.length} changed file(s)`, 'info')
  if (verbose) {
    changedFiles.forEach((file) => {
      log(`  - ${relative(projectRoot, file)}`, 'debug')
    })
  }
  
  // Find test files
  const testFiles = []
  const missingTests = []
  
  for (const file of changedFiles) {
    // Skip test files themselves
    if (file.includes('.test.') || file.includes('__tests__')) continue
    
    // Skip config and non-source files
    if (
      file.includes('.config.') ||
      file.includes('node_modules') ||
      file.includes('dist') ||
      file.includes('.md')
    ) {
      continue
    }
    
    const testFile = findTestFile(file)
    if (testFile) {
      testFiles.push(testFile)
    } else {
      // Check if this is a source file that should have tests
      if (
        (file.includes('apps/frontend/src/') ||
          file.includes('apps/backend/src/')) &&
        !file.includes('.d.ts') &&
        !file.includes('.config.')
      ) {
        missingTests.push(file)
      }
    }
  }
  
  log(`Found ${testFiles.length} existing test file(s)`, 'info')
  if (missingTests.length > 0) {
    log(`Found ${missingTests.length} file(s) without tests:`, 'warning')
    missingTests.forEach((file) => {
      log(`  - ${relative(projectRoot, file)}`, 'warning')
    })
  }
  
  // Update snapshots if requested
  if (snapshotsOnly || !checkOnly) {
    const snapshotTests = testFiles.filter(usesSnapshots)
    if (snapshotTests.length > 0) {
      log(`Found ${snapshotTests.length} snapshot test(s)`, 'info')
      const results = updateSnapshots(snapshotTests)
      log(`Updated: ${results.updated.length}, Failed: ${results.failed.length}`, 'info')
    }
  }
  
  // Check affected scripts
  const affectedScripts = findAffectedScripts(changedFiles)
  if (affectedScripts.length > 0) {
    log(`Found ${affectedScripts.length} potentially affected script(s):`, 'warning')
    affectedScripts.forEach(({ script, reason }) => {
      log(`  - ${relative(projectRoot, script)}: ${reason}`, 'warning')
    })
  }
  
  // Summary
  log('\nSummary:', 'info')
  log(`  Changed files: ${changedFiles.length}`, 'info')
  log(`  Test files found: ${testFiles.length}`, 'info')
  log(`  Missing tests: ${missingTests.length}`, 'info')
  log(`  Affected scripts: ${affectedScripts.length}`, 'info')
  
  if (dryRun || checkOnly) {
    log('\nRun without --dry-run or --check-only to apply updates', 'info')
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { getChangedFiles, findTestFile, findAffectedScripts }
