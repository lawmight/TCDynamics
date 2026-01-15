---
name: Fix GitHub Actions Workflow Failures
overview: 'Fix critical test failures and workflow configuration issues blocking Quality Gate. Main issues: 1) Missing ClerkProvider wrapper in SimpleNavigation tests causing 10+ failures, 2) Coverage report path mismatch in workflow, 3) Code style violations (Tailwind class order, import order, TypeScript any type), 4) Workflow best practices (concurrency control, permissions), 5) Additional improvements (coverage threshold enforcement, timeout, Codecov token, path filters).'
todos: []
isProject: false
---

# Fix GitHub Actions Workflow Failures

## Current Status

Recent Quality Gate workflow runs are failing with:

- **10+ test failures** in `SimpleNavigation.test.tsx` (ClerkProvider missing)
- **Coverage threshold check failing** (wrong path in workflow)
- **Quality gate warnings** (code style violations)

---

## Issue #1: Missing ClerkProvider in SimpleNavigation Tests (CRITICAL)

**Problem**: All 13+ tests in `SimpleNavigation.test.tsx` fail because the component uses Clerk's `useAuth` hook but tests don't wrap components with `ClerkProvider`.

**Error**: `@clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component`

**Location**: [`apps/frontend/src/components/__tests__/SimpleNavigation.test.tsx`](apps/frontend/src/components/__tests__/SimpleNavigation.test.tsx)

**Current Code** (lines 33-40):

```tsx
const renderSimpleNavigation = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <SimpleNavigation />
      </ThemeProvider>
    </MemoryRouter>
  )
```

**Root Cause**: `SimpleNavigation` component uses `useAuth()` hook (line 38 in `SimpleNavigation.tsx`), but the test render function doesn't include `ClerkProvider`.

**Solution**: Use `renderWithClerk()` from test utils which already includes `ClerkProvider` and `MemoryRouter`.

**Fix Required**:

1. Import `renderWithClerk` from `@/test/utils`
2. Replace `render()` with `renderWithClerk()` in `renderSimpleNavigation()` function
3. Remove `MemoryRouter` wrapper since `renderWithClerk()` already includes it
4. Keep `ThemeProvider` wrapper

**Updated Code**:

```tsx
import { renderWithClerk } from '@/test/utils'
// ... remove MemoryRouter import since renderWithClerk includes it

const renderSimpleNavigation = () =>
  renderWithClerk(
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <SimpleNavigation />
    </ThemeProvider>
  )
```

**Files to Modify**: [`apps/frontend/src/components/__tests__/SimpleNavigation.test.tsx`](apps/frontend/src/components/__tests__/SimpleNavigation.test.tsx)

---

## Issue #2: Coverage Report Path Mismatch

**Problem**: Coverage threshold check looks for report in wrong location. The workflow expects coverage at `apps/frontend/coverage/coverage-summary.json` (as seen in line 238), but the check at line 136 looks in `coverage/coverage-summary.json`.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 136 and 145

**Current Code**:

- Line 136: `if [ ! -f "coverage/coverage-summary.json" ]; then`
- Line 145: `const data = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));`

**Issue**: The Unit Tests step (line 98) doesn't specify `working-directory`, so if tests run from root, coverage might be at `coverage/coverage-summary.json`. However, line 238 expects it at `apps/frontend/coverage/coverage-summary.json`, and Type Check step (line 87) uses `working-directory: ./apps/frontend`.

**Solution**:

1. Add `working-directory: ./apps/frontend` to Unit Tests step (line 95-98) for consistency
2. Update coverage path checks to use `apps/frontend/coverage/coverage-summary.json`

**Updated Code**:

```yaml
- name: Unit Tests
  id: test-run
  if: ${{ (inputs.skip_tests != true && inputs.skip_tests != 'true') && (github.event.inputs.skip_tests != true && github.event.inputs.skip_tests != 'true') }}
  working-directory: ./apps/frontend
  run: npm run test:coverage

# ... later in coverage check ...
if [ ! -f "apps/frontend/coverage/coverage-summary.json" ]; then
  echo "❌ Coverage report not found at apps/frontend/coverage/coverage-summary.json"
  # ...

const data = JSON.parse(fs.readFileSync('apps/frontend/coverage/coverage-summary.json', 'utf8'));
```

**Files to Modify**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml)

---

## Issue #3: Code Style Violations (Quality Gate Warnings)

### 3a. Tailwind CSS Class Order (5 locations)

**Files Affected**:

1. [`apps/frontend/src/components/app/ApiKeyManager.tsx:79`](apps/frontend/src/components/app/ApiKeyManager.tsx)
2. [`apps/frontend/src/components/SocialProof.tsx:87`](apps/frontend/src/components/SocialProof.tsx)
3. [`apps/frontend/src/components/LocalAdvantages.tsx:89`](apps/frontend/src/components/LocalAdvantages.tsx)
4. [`apps/frontend/src/components/LocalAdvantages.tsx:85`](apps/frontend/src/components/LocalAdvantages.tsx)
5. [`apps/frontend/src/components/HowItWorks.tsx:52`](apps/frontend/src/components/HowItWorks.tsx)

**Solution**: Run Prettier with Tailwind plugin to auto-fix class order:

```bash
cd apps/frontend
npx prettier --write src/components/app/ApiKeyManager.tsx src/components/SocialProof.tsx src/components/LocalAdvantages.tsx src/components/HowItWorks.tsx
```

### 3b. Import Order Violations in ApiKeyManager.tsx

**Location**: [`apps/frontend/src/components/app/ApiKeyManager.tsx`](apps/frontend/src/components/app/ApiKeyManager.tsx) lines 19-40

**Issues**:

- Line 38-40: `type { ApiKey }` and `./ApiKeyCreateDialog` imports should come before `@/components/ui/alert` imports (parent/sibling imports should be after internal @/ imports but the linter expects a specific order)
- Lines 31, 39: Empty line spacing issues within/between import groups

**Current Import Structure**:

```tsx
// External packages (lucide-react, react, react-router-dom)
// @/components/ui imports (Alert, AlertDialog, Button, Card)
// @/api and @/hooks imports (type ApiKey, useApiKeys)
// Parent/sibling import (./ApiKeyCreateDialog)
```

**Fix**: According to code-style rules, order should be:

1. Built-in modules
2. External packages
3. Internal modules (`@/`)
4. Parent/sibling imports (`./`, `../`)

**Updated Import Structure**:

```tsx
// External packages
import { ... } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Internal modules (@/)
import type { ApiKey } from '@/api/apiKeys'
import { useApiKeys } from '@/hooks/useApiKeys'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// ... other @/ imports ...

// Parent/sibling imports
import { ApiKeyCreateDialog } from './ApiKeyCreateDialog'
```

**Files to Modify**: [`apps/frontend/src/components/app/ApiKeyManager.tsx`](apps/frontend/src/components/app/ApiKeyManager.tsx)

### 3c. TypeScript `any` Type Usage

**Location**: [`apps/frontend/src/components/__tests__/PerformanceMonitor.test.tsx:129`](apps/frontend/src/components/__tests__/PerformanceMonitor.test.tsx)

**Current Code**:

```tsx
delete (mockPerformance as any).memory
```

**Solution**: Use `unknown` with type guard or proper type assertion:

**Option 1** (Recommended):

```tsx
interface MockPerformance {
  getEntriesByType: ReturnType<typeof vi.fn>
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// In the test:
const perfMock = mockPerformance as MockPerformance
delete perfMock.memory
```

**Option 2**:

```tsx
if ('memory' in mockPerformance) {
  delete (mockPerformance as { memory?: unknown }).memory
}
```

**Files to Modify**: [`apps/frontend/src/components/__tests__/PerformanceMonitor.test.tsx`](apps/frontend/src/components/__tests__/PerformanceMonitor.test.tsx)

---

## Issue #4: Workflow Best Practices (Nia Advisor Recommendations)

### 4a. Add Concurrency Control

**Problem**: Multiple workflow runs for the same branch can run simultaneously, wasting CI resources and causing confusion.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) line 62 (after `runs-on`)

**Solution**: Add concurrency group to cancel stale runs when new commits are pushed:

```yaml
jobs:
  quality-gate:
    runs-on: ubuntu-latest
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
```

### 4b. Add Explicit Permissions

**Problem**: Workflows should declare minimum required permissions for security best practice.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) line 62 (after `runs-on`)

**Solution**: Add explicit permissions:

```yaml
jobs:
  quality-gate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
```

### 4c. Add `working-directory` to Unit Tests Step

**Problem**: Unit Tests step runs from root without `working-directory`, inconsistent with other steps like Type Check.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 95-98

**Current Code**:

```yaml
- name: Unit Tests
  id: test-run
  if: ${{ (inputs.skip_tests != true && inputs.skip_tests != 'true') && (github.event.inputs.skip_tests != true && github.event.inputs.skip_tests != 'true') }}
  run: npm run test:coverage
```

**Updated Code**:

```yaml
- name: Unit Tests
  id: test-run
  if: ${{ (inputs.skip_tests != true && inputs.skip_tests != 'true') && (github.event.inputs.skip_tests != true && github.event.inputs.skip_tests != 'true') }}
  working-directory: ./apps/frontend
  run: npm run test:coverage
```

**Files to Modify**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml)

---

## Issue #5: Additional Workflow Improvements (Nia Advisor Round 2)

### 5a. Coverage Threshold Enforcement (CRITICAL)

**Problem**: Current coverage check only echoes the percentage but doesn't actually fail the build if coverage is below threshold.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 128-169

**Research Finding** (Nia Search): Use `bc -l` for floating-point comparison in bash, with `exit 1` on failure.

**Solution**: Add threshold comparison and exit code:

```yaml
- name: Check Coverage Threshold
  id: coverage-check
  run: |
    threshold=${{ env.COVERAGE_THRESHOLD || 60 }}
    if [ ! -f "apps/frontend/coverage/coverage-summary.json" ]; then
      echo "❌ Coverage report not found"
      exit 1
    fi

    coverage=$(node -e "
      const data = JSON.parse(require('fs').readFileSync('apps/frontend/coverage/coverage-summary.json', 'utf8'));
      console.log(data.total.lines.pct);
    ")

    echo "📊 Coverage: $coverage%"
    echo "📊 Threshold: $threshold%"

    # Enforce threshold with bc for floating-point comparison
    if (( $(echo "$coverage < $threshold" | bc -l) )); then
      echo "::error::Coverage $coverage% is below threshold $threshold%"
      exit 1
    fi

    echo "✅ Coverage meets threshold"
```

### 5b. Lint Step Missing `working-directory`

**Problem**: Lint step (line 90-93) runs from root without `working-directory`, inconsistent with Type Check and Build steps.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 90-93

**Solution**: Add `working-directory` for consistency:

```yaml
- name: Lint
  id: lint
  if: ${{ (inputs.skip_lint != true && inputs.skip_lint != 'true') && (github.event.inputs.skip_lint != true && github.event.inputs.skip_lint != 'true') }}
  working-directory: ./apps/frontend
  run: npm run lint
```

### 5c. Codecov Token Configuration

**Problem**: Codecov action missing `token` parameter.

**Research Finding** (Nia Search): Token is required for private repos, recommended for public repos for reliability.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 177-184

**Solution**: Add token from secrets:

```yaml
- name: Upload Coverage
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./apps/frontend/coverage/lcov.info
    name: frontend-coverage
    fail_ci_if_error: false
    verbose: true
```

### 5d. Path Filters Include Unused `api/**`

**Problem**: Path filters include `api/**` but no workflow steps actually process API code (except npm audit).

**Research Finding** (Nia Search): Workflows should only trigger for paths they actually process. Consider separate workflow for API.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) lines 6-9, 12-15

**Options**:

1. **Remove `api/**` from paths\*\* if API-only changes don't need quality gate
2. **Add frontend-only path filter** and create separate `api-quality-gate.yml`
3. **Keep as-is** if you want all changes to trigger full quality check

**Recommended** (Option 1):

```yaml
on:
  pull_request:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - '.github/workflows/quality-gate.yml'
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - '.github/workflows/quality-gate.yml'
```

### 5e. Add `timeout-minutes` to Prevent Hung Jobs

**Problem**: Jobs without timeout can hang indefinitely, blocking CI resources.

**Research Finding** (Nia Search): Set timeout at job level; typical values are 10-30 minutes.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) line 62

**Solution**:

```yaml
jobs:
  quality-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

### 5f. Extract Coverage Threshold to Environment Variable

**Problem**: Hardcoded threshold values (60) scattered in workflow make maintenance harder.

**Location**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml) multiple locations

**Solution**: Add env block at workflow level:

```yaml
env:
  COVERAGE_THRESHOLD: 60

jobs:
  quality-gate:
    # ... steps use ${{ env.COVERAGE_THRESHOLD }}
```

**Files to Modify**: [`.github/workflows/quality-gate.yml`](.github/workflows/quality-gate.yml)

---

## Implementation Steps

1. **Fix SimpleNavigation tests** (Priority 1):
   - Update imports in `SimpleNavigation.test.tsx`
   - Replace `render()` with `renderWithClerk()` in `renderSimpleNavigation()`
   - Remove `MemoryRouter` wrapper
   - Verify all 13+ tests pass

2. **Fix coverage path in workflow** (Priority 2):
   - Add `working-directory: ./apps/frontend` to Unit Tests step
   - Update coverage path checks (lines 136, 145) to `apps/frontend/coverage/coverage-summary.json`

3. **Fix code style violations** (Priority 3):
   - Run Prettier on Tailwind class order violations
   - Fix import order in `ApiKeyManager.tsx`
   - Replace `any` type in `PerformanceMonitor.test.tsx`

4. **Apply workflow best practices** (Priority 4):
   - Add `concurrency` group to cancel stale runs
   - Add explicit `permissions: contents: read`
   - Verify `working-directory` is set consistently across all frontend steps

5. **Apply additional improvements** (Priority 5):
   - Fix coverage threshold enforcement with `bc -l` comparison and `exit 1`
   - Add `working-directory` to Lint step
   - Add `token: ${{ secrets.CODECOV_TOKEN }}` to Codecov action
   - Remove `api/**` from path filters (or create separate API workflow)
   - Add `timeout-minutes: 15` to job
   - Extract coverage threshold to env var `COVERAGE_THRESHOLD: 60`

## Verification Steps

After making fixes:

1. **Test SimpleNavigation fixes locally**:
   ```bash
   cd apps/frontend
   npm run test SimpleNavigation
   ```

Verify all tests pass.

2. **Test coverage path**:

   ```bash
   cd apps/frontend
   npm run test:coverage
   ls -la coverage/coverage-summary.json  # Should exist
   ```

3. **Verify code style fixes**:

   ```bash
   cd apps/frontend
   npm run lint  # Should show no errors for fixed files
   ```

4. **Run full test suite**:

   ```bash
   cd apps/frontend
   npm run test
   ```

5. **Commit and push** to trigger GitHub Actions and verify Quality Gate passes.

## Notes

- The workflow file syntax appears correct (no duplicate `if` conditions found)
- `renderWithClerk()` utility already exists in test utils and includes both ClerkProvider and MemoryRouter
- Focus on main branch workflow failures only
- All fixes follow project coding standards from `.cursor/rules/`
