import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** Vite dev server port (see `vite.config.ts`; avoids Windows excluded ranges on 3000). */
const FRONTEND_DEV_URL = 'http://localhost:3100'
const isCI = !!process.env.CI

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '../../tests/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**', '**/backend/**'],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || FRONTEND_DEV_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: isCI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  /* Vite dev server (port 3100). For tests that call `/api/*`, run root `npm run dev` yourself or set PLAYWRIGHT_BASE_URL. */
  webServer: {
    command: 'npm run dev',
    url: FRONTEND_DEV_URL,
    cwd: __dirname,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global setup and teardown */
  globalSetup: '../../tests/e2e/global-setup.ts',
  globalTeardown: '../../tests/e2e/global-teardown.ts',
})
