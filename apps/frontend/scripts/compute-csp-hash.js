#!/usr/bin/env node
/**
 * Utility script to compute CSP hashes for inline scripts
 * Usage: node scripts/compute-csp-hash.js <script-content>
 * Or: node scripts/compute-csp-hash.js --file <path-to-script-file>
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function computeHash(content, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm)
  hash.update(content)
  return hash.digest('base64')
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage:')
    console.error('  node scripts/compute-csp-hash.js "<script-content>"')
    console.error(
      '  node scripts/compute-csp-hash.js --file <path-to-script-file>'
    )
    process.exit(1)
  }

  let content = ''

  if (args[0] === '--file') {
    if (args.length < 2) {
      console.error('Error: --file requires a file path')
      process.exit(1)
    }
    const filePath = path.resolve(args[1])
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`)
      process.exit(1)
    }
    content = fs.readFileSync(filePath, 'utf8')
  } else {
    content = args.join(' ')
  }

  // Check for empty content (using trimmed copy only for validation)
  if (content.trim().length === 0) {
    console.error('Error: Empty script content')
    process.exit(1)
  }

  // Preserve exact original bytes for byte-for-byte hashing
  const sha256 = computeHash(content, 'sha256')
  const sha384 = computeHash(content, 'sha384')
  const sha512 = computeHash(content, 'sha512')

  console.log('\nCSP Hashes for script content:')
  console.log('─'.repeat(60))
  console.log(`SHA-256: 'sha256-${sha256}'`)
  console.log(`SHA-384: 'sha384-${sha384}'`)
  console.log(`SHA-512: 'sha512-${sha512}'`)
  console.log('─'.repeat(60))
  console.log('\nAdd to CSP script-src directive:')
  console.log(`script-src 'self' 'sha256-${sha256}' ...`)
  console.log('')
}

main()
