/**
 * Vite plugin to compute CSP hashes for inline scripts and inject them into HTML
 * This allows us to use strict CSP without 'unsafe-inline'
 */

import { createHash } from 'crypto'
import { resolve } from 'path'
import type { Plugin } from 'vite'

interface ScriptHash {
  script: string
  hash: string
  algorithm: 'sha256' | 'sha384' | 'sha512'
}

/**
 * Compute SHA-256 hash of a script content
 */
function computeHash(
  content: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): string {
  const hash = createHash(algorithm)
  hash.update(content)
  return hash.digest('base64')
}

/**
 * Extract inline scripts from HTML and compute their hashes
 */
function extractInlineScriptHashes(html: string): ScriptHash[] {
  const hashes: ScriptHash[] = []

  // Match inline script tags (not type="module" or type="application/ld+json")
  const scriptRegex =
    /<script(?![^>]*(?:type=["']module["']|type=["']application\/ld\+json["']))[^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1].trim()
    // Skip empty scripts and JSON-LD scripts
    if (scriptContent && !match[0].includes('application/ld+json')) {
      const hash = computeHash(scriptContent, 'sha256')
      hashes.push({
        script: scriptContent.substring(0, 50) + '...', // For logging
        hash,
        algorithm: 'sha256',
      })
    }
  }

  return hashes
}

/**
 * Generate CSP script-src directive with hashes
 */
function generateCSPHashes(hashes: ScriptHash[]): string {
  return hashes.map(h => `'${h.algorithm}-${h.hash}'`).join(' ')
}

export function viteCSPHashPlugin(): Plugin {
  let htmlPath: string
  let inlineHashes: ScriptHash[] = []

  return {
    name: 'vite-csp-hash-plugin',
    enforce: 'pre',

    buildStart() {
      // Find index.html
      htmlPath = resolve(__dirname, '../index.html')
    },

    transformIndexHtml: {
      enforce: 'pre',
      transform(html, context) {
        // Extract inline script hashes
        inlineHashes = extractInlineScriptHashes(html)

        // Logging removed for production builds
        // Hash information is written to csp-hashes.json file

        // Store hashes in a way that can be accessed during build
        // We'll write them to a JSON file for use in vercel.json generation
        const hashData = {
          hashes: inlineHashes.map(h => `${h.algorithm}-${h.hash}`),
          generatedAt: new Date().toISOString(),
        }

        // Write to a file that can be read during deployment
        const fs = require('fs')
        const path = require('path')
        const outputPath = path.resolve(__dirname, '../dist/csp-hashes.json')

        // Ensure dist directory exists
        const distDir = path.dirname(outputPath)
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true })
        }

        fs.writeFileSync(outputPath, JSON.stringify(hashData, null, 2))

        return html
      },
    },

    generateBundle() {
      // Export hashes for use in build scripts
      if (inlineHashes.length > 0) {
        this.emitFile({
          type: 'asset',
          fileName: 'csp-hashes.json',
          source: JSON.stringify(
            {
              hashes: inlineHashes.map(h => `${h.algorithm}-${h.hash}`),
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          ),
        })
      }
    },
  }
}
