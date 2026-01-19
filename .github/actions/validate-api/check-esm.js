#!/usr/bin/env node
/**
 * AST-based CommonJS detection for ESM validation
 * Checks for require() calls and module.exports assignments in JavaScript files
 */

import * as acorn from 'acorn'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

// Get the API directory from command line argument or use current working directory
// The GitHub Action runs this from ./api directory, so cwd should be correct
const apiDir = process.argv[2] || process.cwd()

/**
 * Recursively find all .js files in a directory
 */
function findJSFiles(
  dir,
  baseDir = dir,
  excludeDirs = ['node_modules', 'apps']
) {
  const files = []

  // Try to read directory - if it fails, return accumulated files
  let entries
  try {
    entries = readdirSync(dir)
  } catch (error) {
    console.warn(
      `⚠️  Cannot read directory ${relative(baseDir, dir)}: ${error.message}`
    )
    return files // Return accumulated files (empty if top-level, or partial if recursive)
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const relativePath = relative(baseDir, fullPath)

    // Try to stat the entry - if it fails, skip and continue
    let stat
    try {
      stat = statSync(fullPath)
    } catch (error) {
      console.warn(`⚠️  Cannot access ${relativePath}: ${error.message}`)
      continue // Skip this entry and continue with next
    }

    // Skip excluded directories
    if (stat.isDirectory()) {
      const dirName = entry
      if (excludeDirs.includes(dirName)) {
        continue
      }
      files.push(...findJSFiles(fullPath, baseDir, excludeDirs))
    } else if (entry.endsWith('.js')) {
      // Skip config files that may legitimately use CommonJS
      // (e.g., jest.config.js, webpack.config.js, etc.)
      if (entry.match(/\.config\.js$/) || entry.match(/^\./)) {
        continue
      }
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Check if AST contains CommonJS patterns
 */
function checkForCommonJS(ast) {
  let foundCommonJS = false
  const issues = []

  // Helper to extract identifier path from MemberExpression
  function getMemberPath(expr) {
    const path = []
    let current = expr

    while (current) {
      if (current.type === 'MemberExpression') {
        if (current.property && current.property.type === 'Identifier') {
          path.unshift(current.property.name)
        } else {
          // Non-identifier property (e.g., computed property) - can't determine statically
          return null
        }
        current = current.object
      } else if (current.type === 'Identifier') {
        path.unshift(current.name)
        break
      } else {
        break
      }
    }

    return path
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return

    // Check for require() calls
    if (
      node.type === 'CallExpression' &&
      node.callee &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'require'
    ) {
      foundCommonJS = true
      issues.push({
        type: 'require',
        line: node.loc?.start.line || 'unknown',
        column: node.loc?.start.column || 'unknown',
      })
    }

    // Check for module.exports or exports assignments
    if (node.type === 'AssignmentExpression') {
      const left = node.left

      if (left.type === 'MemberExpression') {
        const path = getMemberPath(left)

        if (path) {
          // Check for 'module.exports' (direct assignment or property assignment)
          if (
            path.length >= 2 &&
            path[0] === 'module' &&
            path[1] === 'exports'
          ) {
            foundCommonJS = true
            issues.push({
              type:
                path.length === 2
                  ? 'module.exports'
                  : `module.exports.${path.slice(2).join('.')}`,
              line: node.loc?.start.line || 'unknown',
              column: node.loc?.start.column || 'unknown',
            })
          }
          // Check for 'exports' (direct assignment or property assignment)
          else if (path.length >= 1 && path[0] === 'exports') {
            foundCommonJS = true
            issues.push({
              type:
                path.length === 1
                  ? 'exports'
                  : `exports.${path.slice(1).join('.')}`,
              line: node.loc?.start.line || 'unknown',
              column: node.loc?.start.column || 'unknown',
            })
          }
        }
      }
      // Check for direct identifier assignment to 'exports' (rare but possible)
      else if (left.type === 'Identifier' && left.name === 'exports') {
        foundCommonJS = true
        issues.push({
          type: 'exports',
          line: node.loc?.start.line || 'unknown',
          column: node.loc?.start.column || 'unknown',
        })
      }
    }

    // Recursively walk all child nodes
    for (const key in node) {
      if (
        key === 'parent' ||
        key === 'leadingComments' ||
        key === 'trailingComments'
      ) {
        continue
      }
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(walk)
      } else if (child && typeof child === 'object') {
        walk(child)
      }
    }
  }

  walk(ast)
  return { hasCommonJS: foundCommonJS, issues }
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const relativePath = relative(apiDir, filePath)

    // Parse with acorn (supports ES2022, locations for error reporting)
    const ast = acorn.parse(content, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
    })

    const { hasCommonJS, issues } = checkForCommonJS(ast)

    if (hasCommonJS) {
      console.error(`❌ ${relativePath} contains CommonJS syntax:`)
      issues.forEach(issue => {
        console.error(
          `   - ${issue.type} at line ${issue.line}, column ${issue.column}`
        )
      })
      console.error(`   All API files must use ESM (import/export) syntax`)
      return false
    }

    return true
  } catch (error) {
    // If parsing fails, it might be due to syntax errors or unsupported features
    // In that case, we'll skip the file or report it
    if (error.name === 'SyntaxError') {
      console.warn(
        `⚠️  ${relative(apiDir, filePath)}: Syntax error (may not be valid JS): ${error.message}`
      )
      // Don't fail on syntax errors - let other tools handle that
      return true
    }
    console.error(
      `❌ Error validating ${relative(apiDir, filePath)}: ${error.message}`
    )
    return false
  }
}

/**
 * Main validation function
 */
function main() {
  const jsFiles = findJSFiles(apiDir)
  let failed = false

  if (jsFiles.length === 0) {
    console.log('✅ No JavaScript files found to validate')
    return 0
  }

  for (const file of jsFiles) {
    if (!validateFile(file)) {
      failed = true
    }
  }

  if (failed) {
    console.error('\n❌ Validation failed: Some files contain CommonJS syntax')
    return 1
  }

  console.log(`✅ All ${jsFiles.length} API files use ESM syntax`)
  return 0
}

// Run the validation
process.exit(main())
