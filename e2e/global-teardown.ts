import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Teardown that runs once after all tests
  console.log('🧹 Cleaning up after E2E tests for project:', config.rootDir)

  // You can add global teardown logic here:
  // - Database cleanup
  // - File cleanup
  // - Service shutdown
  // - Log aggregation

  console.log('✅ Global teardown completed')
}

export default globalTeardown
