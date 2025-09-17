#!/usr/bin/env node

/**
 * Automated Bug Fixer Script
 *
 * This script automatically detects and fixes common bugs in the codebase
 * Usage: node scripts/auto-bug-fixer.js [--fix] [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

class AutoBugFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false
    this.fix = options.fix || false
    this.issues = []
    this.fixes = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix =
      {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        fix: '🔧',
      }[type] || 'ℹ️'

    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []

    // Check for common TypeScript/JavaScript issues
    const patterns = [
      {
        name: 'Unused imports',
        pattern: /import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm,
        fix: (match, imports) => {
          // This would need more sophisticated analysis to determine unused imports
          return null
        },
      },
      {
        name: 'Missing semicolons',
        pattern: /([^;}])\s*$/gm,
        fix: (match, char) => {
          if (char && !char.match(/[{}();]/)) {
            return match.replace(char, char + ';')
          }
          return null
        },
      },
      {
        name: 'Console.log statements',
        pattern: /console\.log\([^)]*\);?/g,
        fix: match => {
          return match.replace('console.log', '// console.log')
        },
      },
      {
        name: 'TODO comments without tracking',
        pattern: /\/\/\s*TODO:?\s*(.+)/gi,
        fix: (match, todo) => {
          return match.replace('TODO', 'TODO #' + Date.now())
        },
      },
      {
        name: 'Hardcoded URLs (excluding SVG xmlns)',
        pattern: /(https?:\/\/[^\s'"]+)/g,
        fix: (match, offset, string) => {
          // Don't modify URLs that are part of SVG xmlns attributes
          const beforeMatch = string.substring(0, offset)
          if (beforeMatch.includes('xmlns=') && beforeMatch.includes('svg')) {
            return null // Skip this match
          }
          return match.replace(match, `process.env.API_URL || '${match}'`)
        },
      },
      {
        name: 'Missing error handling',
        pattern: /async\s+function\s+\w+\([^)]*\)\s*{/g,
        fix: match => {
          return match + '\n  try {'
        },
      },
    ]

    patterns.forEach(pattern => {
      const matches = content.match(pattern.pattern)
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            type: pattern.name,
            match: match,
            line: content.substring(0, content.indexOf(match)).split('\n')
              .length,
            fix: pattern.fix,
          })
        })
      }
    })

    return issues
  }

  async scanDirectory(dirPath) {
    this.log(`Scanning directory: ${dirPath}`)

    const files = this.getSourceFiles(dirPath)
    let totalIssues = 0

    for (const file of files) {
      try {
        const issues = await this.scanFile(file)
        this.issues.push(...issues)
        totalIssues += issues.length

        if (issues.length > 0) {
          this.log(`Found ${issues.length} issues in ${file}`, 'warning')
        }
      } catch (error) {
        this.log(`Error scanning ${file}: ${error.message}`, 'error')
      }
    }

    this.log(`Total issues found: ${totalIssues}`)
    return totalIssues
  }

  getSourceFiles(dirPath) {
    const files = []

    const scanDir = dir => {
      const items = fs.readdirSync(dir)

      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          // Skip node_modules, .git, dist, build directories
          if (
            ![
              'node_modules',
              '.git',
              'dist',
              'build',
              '.next',
              'coverage',
            ].includes(item)
          ) {
            scanDir(fullPath)
          }
        } else if (this.isSourceFile(item)) {
          files.push(fullPath)
        }
      })
    }

    scanDir(dirPath)
    return files
  }

  isSourceFile(filename) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']
    return extensions.some(ext => filename.endsWith(ext))
  }

  async applyFixes() {
    if (this.dryRun) {
      this.log('DRY RUN: Would apply the following fixes:', 'info')
      this.issues.forEach(issue => {
        console.log(`  - ${issue.file}:${issue.line} - ${issue.type}`)
      })
      return
    }

    this.log('Applying fixes...', 'fix')

    const filesToFix = [...new Set(this.issues.map(issue => issue.file))]

    for (const filePath of filesToFix) {
      await this.fixFile(filePath)
    }
  }

  async fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const fileIssues = this.issues.filter(issue => issue.file === filePath)

    let newContent = content
    let hasChanges = false

    // Sort issues by line number (descending) to avoid offset issues
    fileIssues.sort((a, b) => b.line - a.line)

    fileIssues.forEach(issue => {
      if (issue.fix) {
        try {
          const fixed = issue.fix(issue.match)
          if (fixed && fixed !== issue.match) {
            newContent = newContent.replace(issue.match, fixed)
            hasChanges = true
            this.fixes.push({
              file: filePath,
              type: issue.type,
              line: issue.line,
            })
          }
        } catch (error) {
          this.log(
            `Error fixing ${issue.type} in ${filePath}: ${error.message}`,
            'error'
          )
        }
      }
    })

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent)
      this.log(`Fixed ${fileIssues.length} issues in ${filePath}`, 'success')
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      totalFixes: this.fixes.length,
      issuesByType: {},
      issuesByFile: {},
      fixes: this.fixes,
    }

    // Group issues by type
    this.issues.forEach(issue => {
      report.issuesByType[issue.type] =
        (report.issuesByType[issue.type] || 0) + 1
    })

    // Group issues by file
    this.issues.forEach(issue => {
      if (!report.issuesByFile[issue.file]) {
        report.issuesByFile[issue.file] = []
      }
      report.issuesByFile[issue.file].push(issue)
    })

    return report
  }

  async run() {
    this.log('Starting automated bug fixer...', 'info')

    // Scan main source directories
    const directories = ['src', 'backend/src', 'public']

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        await this.scanDirectory(dir)
      }
    }

    if (this.issues.length === 0) {
      this.log('No issues found! 🎉', 'success')
      return
    }

    // Generate and save report
    const report = this.generateReport()
    const reportPath = 'bug-fix-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`Report saved to ${reportPath}`, 'info')

    // Apply fixes if requested
    if (this.fix) {
      await this.applyFixes()

      if (this.fixes.length > 0) {
        this.log(`Successfully fixed ${this.fixes.length} issues!`, 'success')

        // Run linting to check if fixes introduced new issues
        try {
          this.log('Running linter to verify fixes...', 'info')
          execSync('npm run lint', { stdio: 'inherit' })
          this.log('Linting passed! ✅', 'success')
        } catch (error) {
          this.log(
            'Linting failed after fixes. Please review manually.',
            'warning'
          )
        }
      }
    } else {
      this.log('Use --fix flag to apply fixes', 'info')
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    fix: args.includes('--fix'),
  }

  const fixer = new AutoBugFixer(options)
  fixer.run().catch(error => {
    console.error('❌ Error running bug fixer:', error)
    process.exit(1)
  })
}

// ES module - run main function directly
main()
