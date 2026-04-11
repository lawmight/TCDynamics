export default {
  rootDir: '..',
  testEnvironment: 'node',
  roots: ['<rootDir>/_lib/__tests__'],
  testMatch: ['**/*.test.js'],
  /** Run with `node --test` — Jest cannot resolve `node:test` */
  testPathIgnorePatterns: [
    '/node_modules/',
    String.raw`requireAuth\.test\.js`,
    String.raw`phase3-security\.test\.js`,
  ],
  transform: {},
  collectCoverage: false,
}
