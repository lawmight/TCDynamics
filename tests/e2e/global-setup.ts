import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Setup that runs once before all tests
  console.log('🚀 Starting E2E tests for project:', config.rootDir)

  // You can add global setup logic here:
  // - Database seeding
  // - API mocking
  // - Authentication setup
  // - Environment preparation

  console.log('✅ Global setup completed')
}

export default globalSetup
