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
    '/build/',
    '/coverage/',
    '/api/',
    '/apps/frontend/',
    '/tests/',
    '/apps/backend/api/',
    '/apps/backend/apps/',
    '/.claude/',
    '/.git/',
    '/.vscode/',
    '/.cursor/',
    '/.pulse/',
    '/tools/',
    '/docs/',
    '/scripts/',
    '.*\\.spec\\.ts$', // Exclude Playwright spec files
    '.*\\.e2e\\.ts$', // Exclude E2E test files
    '.*\\.spec\\.tsx$',
    '.*\\.e2e\\.tsx$',
    '.*\\.ui\\.test\\.(js|ts)$', // Exclude UI test files
    '/__snapshots__/', // Exclude snapshot files
  ],
  // Additional module path exclusions for sensitive directories
  modulePathIgnorePatterns: [
    '<rootDir>/.claude/',
    '<rootDir>/.git/',
    '<rootDir>/.vscode/',
    '<rootDir>/.cursor/',
    '<rootDir>/.pulse/',
    '<rootDir>/tools/',
    '<rootDir>/docs/',
    '<rootDir>/scripts/',
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
