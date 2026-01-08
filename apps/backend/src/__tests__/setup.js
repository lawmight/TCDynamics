// Setup file for Jest tests
// This file runs before each test suite

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.EMAIL_USER = 'test@example.com'
process.env.EMAIL_PASS = 'test-password'
process.env.DATABASE_URL = 'sqlite::memory:'

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Increase timeout for integration tests
jest.setTimeout(10000)

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Simple test to ensure setup file is valid
describe('Test Setup', () => {
  it('should have environment variables configured', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.EMAIL_USER).toBe('test@example.com')
  })
})
