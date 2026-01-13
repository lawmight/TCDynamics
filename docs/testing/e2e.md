# E2E Testing Guide

**Last Updated**: 2026-01-09
**Status**: Active

End-to-end testing guide for TCDynamics WorkFlowAI using Playwright.

## Overview

E2E tests verify complete user workflows across the entire application, from frontend to backend to external services. Tests run in real browsers to catch integration issues that unit tests might miss.

## Playwright Setup

### Installation

Playwright is configured in `apps/frontend/playwright.config.ts`.

**Dependencies**:
- `@playwright/test` - Playwright test framework
- Browsers installed via `npx playwright install`

### Configuration

**File**: `apps/frontend/playwright.config.ts`

**Key Settings**:
- Test directory: `tests/e2e/`
- Base URL: `http://localhost:8080` (development)
- Parallel execution: Enabled
- Retries: 2 on CI, 0 locally
- Trace recording: On first retry
- Screenshot: On failure only
- Video: Retain on failure

**Browsers**:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Test Structure

### Test Location

```
tests/e2e/
├── navigation.spec.ts           # Navigation and routing tests
├── contact-flow.spec.ts         # Contact form submission flow
├── third-party-resources.spec.ts # Third-party resource loading tests
├── global-setup.ts              # Global setup (runs before all tests)
└── global-teardown.ts           # Global teardown (runs after all tests)
```

### Test File Pattern

Test files must match `*.spec.ts` pattern and be located in `tests/e2e/`.

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (runs before each test)
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Test code
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

### Common Patterns

#### Navigation Testing

```typescript
test('should navigate to features page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Fonctionnalités')
  await expect(page.locator('h1')).toContainText('Features')
})
```

#### Form Submission Testing

```typescript
test('should submit contact form', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="name"]', 'John Doe')
  await page.fill('input[name="email"]', 'john@example.com')
  await page.fill('textarea[name="message"]', 'Test message')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Success')).toBeVisible()
})
```

#### Authentication Testing

```typescript
test('should require authentication for protected route', async ({ page }) => {
  await page.goto('/app/dashboard')
  // Should redirect to login
  await expect(page).toHaveURL(/\/login/)
})
```

#### Mobile Testing

```typescript
test('should work on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  // Mobile-specific assertions
})
```

#### API Mocking

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API to return error
  await page.route('/api/contact', route => {
    route.fulfill({ status: 500, json: { error: 'Server error' } })
  })

  await page.goto('/')
  await page.fill('input[name="name"]', 'John Doe')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Error')).toBeVisible()
})
```

## Running E2E Tests

### Local Development

**Prerequisites**:
1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Start development servers:
   ```bash
   # Terminal 1: Frontend
   npm run dev:frontend

   # Terminal 2: Backend (if needed)
   npm run dev:backend
   ```

**Run Tests**:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/navigation.spec.ts

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui
# or
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npm run test:e2e:debug
# or
npx playwright test --debug
```

### CI/CD Execution

E2E tests run in GitHub Actions (if configured):

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

**CI Configuration**:
- Workers: 1 (sequential execution)
- Retries: 2
- Timeout: Extended for CI environments

## Debugging E2E Tests

### Playwright Inspector

**Launch Inspector**:

```bash
npx playwright test --debug
```

**Features**:
- Step through tests
- Inspect page state
- View console logs
- Check network requests

### Trace Viewer

**Generate Trace**:

Traces are automatically generated on test failures.

**View Trace**:

```bash
npx playwright show-trace trace.zip
```

**Trace Includes**:
- Screenshots at each step
- DOM snapshots
- Network requests
- Console logs
- Performance timeline

### Screenshots and Videos

**On Failure**:
- Screenshot: `test-results/` directory
- Video: `test-results/` directory (if configured)

**Manual Screenshot**:

```typescript
await page.screenshot({ path: 'screenshot.png' })
```

## Best Practices

### Test Organization

1. **Group related tests** - Use `test.describe()` blocks
2. **Use descriptive test names** - "should submit contact form successfully"
3. **Keep tests independent** - Each test should be able to run standalone
4. **Use beforeEach/afterEach** - Set up and clean up test state

### Selectors

1. **Prefer semantic selectors** - `getByRole`, `getByText`, `getByLabelText`
2. **Avoid brittle selectors** - Don't rely on CSS classes that might change
3. **Use data-testid sparingly** - Only when semantic selectors aren't available

**Examples**:

```typescript
// ✅ Good: Semantic selector
await page.getByRole('button', { name: 'Submit' }).click()

// ✅ Good: Text selector
await page.getByText('Submit').click()

// ⚠️ Acceptable: data-testid (when necessary)
await page.getByTestId('submit-button').click()

// ❌ Bad: CSS class (brittle)
await page.locator('.submit-btn').click()
```

### Waiting Strategies

1. **Use Playwright's auto-waiting** - Most actions wait automatically
2. **Avoid fixed waits** - Don't use `page.waitForTimeout(1000)`
3. **Use explicit waits** - `page.waitForSelector()`, `page.waitForResponse()`

**Examples**:

```typescript
// ✅ Good: Auto-waiting
await page.click('button') // Waits for button to be visible and clickable

// ✅ Good: Explicit wait
await page.waitForResponse(response => response.url().includes('/api/contact'))

// ❌ Bad: Fixed wait
await page.waitForTimeout(1000) // Unreliable, slows tests
```

### Test Data

1. **Use test fixtures** - Isolated test data for each test
2. **Clean up after tests** - Delete test data created during tests
3. **Use unique identifiers** - Timestamps, UUIDs for test entities

**Example**:

```typescript
test('should create user account', async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}@example.com`
  await page.fill('input[name="email"]', uniqueEmail)
  // ... rest of test
})
```

## Common Test Scenarios

### Form Submission Flow

**File**: `tests/e2e/contact-flow.spec.ts`

Tests the complete contact form submission workflow:
1. Navigate to contact form
2. Fill in form fields
3. Submit form
4. Verify success message
5. Verify API call was made

### Navigation Testing

**File**: `tests/e2e/navigation.spec.ts`

Tests navigation and routing:
1. Homepage loads correctly
2. Navigation links work
3. 404 page handles correctly
4. Mobile menu works
5. Smooth scrolling works

### Third-Party Resources

**File**: `tests/e2e/third-party-resources.spec.ts`

Tests third-party resource loading:
1. Sentry SDK loads
2. Vercel Analytics loads
3. Facebook SDK loads
4. No COEP errors
5. All resources load successfully

## Troubleshooting

### Tests Failing Locally

**Issue**: Tests fail but work in CI

**Solutions**:
- Check local environment variables
- Verify development servers are running
- Clear browser cache: `npx playwright clear-cache`
- Update Playwright: `npx playwright install`

### Flaky Tests

**Issue**: Tests sometimes pass, sometimes fail

**Solutions**:
- Add explicit waits for async operations
- Use `page.waitForResponse()` for API calls
- Increase test timeout: `test.setTimeout(30000)`
- Check for race conditions

### Timeout Errors

**Issue**: Tests timeout before completing

**Solutions**:
- Increase timeout: `test.setTimeout(60000)`
- Check if page is loading correctly
- Verify API endpoints are responding
- Check network requests in trace viewer

### Browser Not Found

**Issue**: `Browser not found` error

**Solution**:
```bash
npx playwright install
```

## CI/CD Integration

### GitHub Actions

E2E tests can be added to CI/CD pipeline:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    paths:
      - 'apps/frontend/**'
      - 'tests/e2e/**'

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Test Reports

**HTML Report**:
```bash
npx playwright show-report
```

**JSON Report**:
- Location: `test-results/e2e-results.json`
- Upload to CI/CD for reporting

## Related Documentation

- [Testing Strategy](./strategy.md) - Testing pyramid and patterns
- [Testing Guide](../TESTING_GUIDE.md) - Feature-specific testing guides
- [CI/CD Guide](../deployment/ci-cd.md) - Test execution in CI/CD

---

**Last Updated**: 2026-01-09
