module.exports = {
  testEnvironment: 'node',
  // Restrict Jest to only search within this backend directory
  roots: ['<rootDir>/src'],
  // Only match test files within this backend directory
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js',
  ],
  // Explicitly exclude API and frontend test directories (defensive)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/api/',
    '/apps/frontend/',
    '/tests/',
    '/apps/backend/api/',
    '/apps/backend/apps/',
    '.*\\.spec\\.ts$', // Exclude Playwright spec files
    '.*\\.e2e\\.ts$', // Exclude E2E test files
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
    '!src/server.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 24,
      functions: 44,
      lines: 35,
      statements: 35,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
}
