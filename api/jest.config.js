// Jest config for API directory
// Note: API tests use Node.js test runner (node:test), not Jest
// This config exists to prevent Jest from trying to parse Node.js test files
module.exports = {
  testEnvironment: 'node',
  // Restrict Jest to an empty roots array - no tests to discover
  roots: [],
  // Exclude all test files - API uses Node.js test runner, not Jest
  testMatch: [],
  // Explicitly ignore all test files that use Node.js test runner
  testPathIgnorePatterns: [
    '.*',
    '__tests__/.*',
    '.*\\.test\\.js$',
    '.*\\.test\\.ts$',
    '.*\\.spec\\.ts$',
  ],
  // No tests to run - API uses Node.js test runner
  collectCoverage: false,
  // Prevent Jest from trying to transform ESM files
  transform: {},
  // Don't try to parse files in __tests__ directory
  modulePathIgnorePatterns: ['__tests__', '.*'],
  // Root directory to prevent Jest from searching parent directories
  rootDir: __dirname,
}
