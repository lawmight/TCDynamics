#!/usr/bin/env node

/**
 * Auto-detects the current workspace based on process.cwd()
 * Returns: 'frontend', 'backend', or 'root'
 */
import { dirname, normalize, resolve, sep } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../..')

function detectWorkspace() {
  const cwd = process.cwd()
  const normalizedCwd = normalize(cwd)
  const cwdSegments = normalizedCwd.split(sep)

  // Check for consecutive segment pair ['apps', 'frontend'] or ['apps', 'backend']
  for (let i = 0; i < cwdSegments.length - 1; i++) {
    if (cwdSegments[i] === 'apps' && cwdSegments[i + 1] === 'frontend') {
      return 'frontend'
    }
    if (cwdSegments[i] === 'apps' && cwdSegments[i + 1] === 'backend') {
      return 'backend'
    }
  }

  // Default to root
  return 'root'
}

// Export for use in other scripts
export { detectWorkspace, projectRoot }

// If run directly, output the workspace
if (import.meta.url === pathToFileURL(__filename).href) {
  console.log(detectWorkspace())
}
