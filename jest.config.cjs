// Root-level Jest config to prevent Jest from discovering tests in other directories
// Only backend uses Jest - API uses Node.js test runner, frontend uses Vitest
module.exports = {
  // Don't discover any tests at root level
  testMatch: [],
  // Explicitly restrict to only backend directory
  roots: ['<rootDir>/apps/backend'],
  // Ignore all other test directories
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/api/',
    '/apps/frontend/',
    '/tests/',
    '.*\\.spec\\.ts$',
    '.*\\.test\\.tsx?$',
  ],
  // Only run tests if explicitly in backend
  projects: ['<rootDir>/apps/backend/jest.config.cjs'],
  // Don't collect coverage at root
  collectCoverage: false,
}
