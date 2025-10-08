module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/__tests__/**/*.js', '**/src/**/*.test.js'],
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
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
}
