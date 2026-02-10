// Root-level Jest config to prevent Jest from discovering tests in other directories
// Only backend uses Jest - API uses Node.js test runner, frontend uses Vitest
export default {
  // Don't discover any tests at root level
  testMatch: [],
  // Ignore all other test directories  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/api/',
    '/apps/frontend/',
    '/tests/',
    '/.claude/',
    '.*\\.spec\\.ts$',
    '.*\\.test\\.tsx?$',
    '.*\\.e2e\\.ts$',
    '.*\\.spec\\.tsx$',
  ],
  // Only run tests if explicitly in backend
  projects: ['./apps/backend/jest.config.cjs'],
  // Don't collect coverage at root
  collectCoverage: false,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // Prevent Jest from scanning sensitive directories
  modulePathIgnorePatterns: [
    '/.claude/',
    '/.git/',
    '/.vscode/',
    '/.cursor/',
    '/.pulse/',
  ],
  // Set a reasonable timeout
  testTimeout: 30000,
  // Prevent Jest from using watch mode by default
  watchman: false,
}