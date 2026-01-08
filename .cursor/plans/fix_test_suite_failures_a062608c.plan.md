---
name: Fix Test Suite Failures
overview: Fix 17 test failures across 8 test files by updating mocks, test expectations, and component tests to match recent code changes including formType field addition, error message format changes, and missing icon mocks. Includes creation of reusable test utilities and prevention strategies.
todos:
  - id: create-test-utils
    content: Create reusable test utilities file (renderWithProviders, renderWithClerk) to standardize test setup
    status: completed
  - id: fix-lucide-pause
    content: Add Pause icon export to lucide-react mock file and document icon maintenance process
    status: completed
  - id: fix-footer-test
    content: Update Footer test to expect /#contact instead of /contact
    status: completed
  - id: fix-pricing-test
    content: Fix Pricing test text expectation (Sur devis vs Sur mesure) - verify with component source
    status: completed
  - id: fix-contact-form-test
    content: Update useContactForm test to include formType field in expectations
    status: completed
  - id: fix-demo-form-tests
    content: Update useDemoForm tests to include formType field in expectations
    status: completed
  - id: fix-azure-services-errors
    content: Fix azureServices test error message assertions to match new format with proper error message testing pattern
    status: completed
  - id: fix-login-test
    content: Add ClerkProvider wrapper to Login component test using new test utility
    status: completed
  - id: fix-files-upload-test
    content: Fix or exclude files-upload test suite - verify if supabase import is obsolete (project uses MongoDB)
    status: completed
  - id: verify-all-tests
    content: Run full test suite and verify no regressions introduced
    status: completed
isProject: false
---

# Fix Test Suite Failures

## Executive Summary

**17 test failures** across **8 test files** need to be fixed. Issues include missing icon mocks, outdated test expectations, error message format changes, and missing provider wrappers. This plan includes creating reusable test utilities to prevent future issues and establishing maintenance patterns.

**Estimated Time**: 2-3 hours

**Risk Level**: Low (test-only changes, no production code affected)

**Priority**: High (blocking CI/CD pipeline)

---

## Issues Identified

### 1. Hero Component Tests (9 failures) - **Critical**

**File**: `apps/frontend/src/components/__tests__/Hero.test.tsx`

**Issue**: Missing `Pause` icon export in lucide-react mock

**Root Cause**: Icon added to component but not to mock file

**Impact**: 9 test failures (largest single issue)

**Fix Strategy**:

- Add `Pause` export to `apps/frontend/src/test/mocks/lucide-react.tsx`
- Document process for maintaining icon mocks (see Prevention section)

**Best Practice** (from Vitest docs):

- Mock icons at module level in `setup.ts` (already done)
- Use consistent `mockIcon` pattern for all icons
- Consider auto-generating mock file from component imports

### 2. Footer Component Test (1 failure) - **Low Risk**

**File**: `apps/frontend/src/components/__tests__/Footer.test.tsx`

**Issue**: Test expects `href="/contact"` but component uses `href="/#contact"` (hash routing)

**Root Cause**: Test expectation outdated after routing change

**Impact**: 1 test failure

**Fix Strategy**:

- Update test expectation to match actual component behavior
- Verify routing pattern is intentional (hash vs. standard routing)

### 3. Pricing Component Test (1 failure) - **Medium Risk**

**File**: `apps/frontend/src/components/__tests__/Pricing.test.tsx`

**Issue**: Test looks for "Sur devis" text but component shows "Sur mesure" for Enterprise plan

**Root Cause**: Text content changed or test expectation incorrect

**Impact**: 1 test failure

**Fix Strategy**:

- **First**: Verify actual component source to confirm correct text
- **Then**: Update test to match component OR update component if test is correct
- Use `screen.getByText()` with regex for flexible matching if text varies

### 4. Form Hook Tests (3 failures) - **Medium Risk**

**Files**:

- `apps/frontend/src/hooks/__tests__/useContactForm.test.ts` (1 failure)
- `apps/frontend/src/hooks/__tests__/useDemoForm.test.ts` (2 failures)

**Issue**: Tests don't expect `formType` field that was recently added to form submissions

**Root Cause**: API contract changed (formType added) but tests not updated

**Impact**: 3 test failures

**Fix Strategy**:

- Update test expectations to include `formType: "contact"` or `formType: "demo"` in request body
- Use `expect.objectContaining()` pattern for flexible assertions:
  ```typescript
  expect(fetch).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      body: expect.stringContaining('"formType":"contact"'),
    })
  )
  ```

### 5. Azure Services Tests (2 failures) - **Low Risk**

**File**: `apps/frontend/src/api/__tests__/azureServices.test.ts`

**Issue**: Error message format changed - now includes "Network error: " prefix

**Root Cause**: Error handling refactored to include error type prefix

**Impact**: 2 test failures

**Fix Strategy**:

- Update assertions to expect full error message format: - `"Network error"` → `"Network error: Network error"` - `"Connection failed"` → `"Network error: Connection failed"`
- **Best Practice**: Use `toContain()` for partial matches or `toMatch()` with regex for flexible error message testing
- Consider testing error structure (type + message) separately for better maintainability

**Lines to fix**: 172 and 460

### 6. Login Component Test (1 failure) - **Medium Risk**

**File**: `apps/frontend/src/pages/auth/__tests__/Login.test.tsx`

**Issue**: Missing `ClerkProvider` wrapper for Clerk authentication hooks

**Root Cause**: Component uses Clerk hooks but test doesn't provide provider context

**Impact**: 1 test failure

**Fix Strategy**:

- Create reusable `renderWithClerk` utility (see Test Utilities section)
- Wrap component render with `ClerkProvider` from `@clerk/clerk-react`
- Mock Clerk client for test environment (no real auth needed)

**Best Practice** (from React Testing Library):

- Use `act()` wrapper for async provider operations
- Create reusable render utilities to reduce boilerplate
- Follow existing pattern from `Contact.test.tsx` (QueryClientProvider wrapper)

### 7. Files Upload Test Suite (1 suite failure) - **Low Risk**

**File**: `api/__tests__/files-upload.test.js`

**Issue**: Import path error - trying to import `./_lib/supabase.js` from `api/files.js` but file doesn't exist

**Root Cause**: Test file references obsolete Supabase integration (project uses MongoDB)

**Impact**: 1 test suite failure

**Fix Strategy**:

- **Verify**: Check if `api/files.js` actually imports supabase (codebase search shows it uses MongoDB)
- **Option 1**: Update test to match current implementation (MongoDB-based)
- **Option 2**: Exclude test if obsolete (document why)
- **Option 3**: Remove test file if functionality no longer exists

---

## Implementation Steps

### Phase 1: Create Test Utilities (Prevention Strategy)

**Goal**: Establish reusable patterns to prevent future provider wrapper issues

**File**: `apps/frontend/src/test/utils.tsx` (new file)

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ReactElement } from 'react'

// Reusable QueryClient for tests (no retries, fast failures)
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

// Mock Clerk publishable key for tests
const MOCK_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key'

/**
 * Render component with ClerkProvider wrapper
 * Use for components that use Clerk authentication hooks
 */
export function renderWithClerk(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClerkProvider publishableKey={MOCK_CLERK_PUBLISHABLE_KEY}>
      <MemoryRouter>{children}</MemoryRouter>
    </ClerkProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render component with QueryClientProvider wrapper
 * Use for components that use React Query
 */
export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render component with all providers (Clerk + QueryClient + Router)
 * Use for complex components requiring multiple providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClerkProvider publishableKey={MOCK_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    </ClerkProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}
```

**Benefits**:

- Standardizes provider setup across tests
- Reduces boilerplate
- Makes provider requirements explicit
- Easier to maintain when providers change

### Phase 2: Fix Individual Test Failures

#### Step 1: Add Missing Pause Icon

**File**: `apps/frontend/src/test/mocks/lucide-react.tsx`

```typescript
// Add after existing exports (around line 76)
export const Pause = mockIcon
```

**Verification**: Run `npm run test:frontend -- Hero.test.tsx` to confirm fix

#### Step 2: Fix Footer Test

**File**: `apps/frontend/src/components/__tests__/Footer.test.tsx`

```typescript
// Change:
expect(...).toHaveAttribute('href', '/contact')
// To:
expect(...).toHaveAttribute('href', '/#contact')
```

**Verification**: Run `npm run test:frontend -- Footer.test.tsx`

#### Step 3: Fix Pricing Test

**File**: `apps/frontend/src/components/__tests__/Pricing.test.tsx`

**First**: Check component source to verify correct text

```bash
grep -r "Sur devis\|Sur mesure" apps/frontend/src/components/Pricing.tsx
```

**Then**: Update test expectation to match component OR use flexible matching:

```typescript
// Option 1: Exact match
expect(screen.getByText('Sur mesure')).toBeInTheDocument()

// Option 2: Flexible regex match
expect(screen.getByText(/Sur (devis|mesure)/i)).toBeInTheDocument()
```

#### Step 4: Update Form Hook Tests

**Files**:

- `apps/frontend/src/hooks/__tests__/useContactForm.test.ts`
- `apps/frontend/src/hooks/__tests__/useDemoForm.test.ts`

**Pattern**: Find `expect.objectContaining()` calls and add `formType`:

```typescript
// Before:
expect(fetch).toHaveBeenCalledWith(
  expect.any(String),
  expect.objectContaining({
    body: expect.stringContaining('"name":"Test"'),
  })
)

// After:
expect(fetch).toHaveBeenCalledWith(
  expect.any(String),
  expect.objectContaining({
    body: expect.stringContaining('"formType":"contact"'), // or "demo"
  })
)
```

**Verification**: Run form hook tests individually

#### Step 5: Fix Azure Services Error Messages

**File**: `apps/frontend/src/api/__tests__/azureServices.test.ts`

**Lines 172 and 460**:

```typescript
// Before:
expect(result.errors).toContain('Network error')
expect(result.errors).toContain('Connection failed')

// After:
expect(result.errors).toContain('Network error: Network error')
expect(result.errors).toContain('Network error: Connection failed')

// Better (more maintainable):
expect(result.errors.some(err => err.includes('Network error'))).toBe(true)
// Or use regex:
expect(result.errors).toEqual(
  expect.arrayContaining([expect.stringMatching(/Network error:/)])
)
```

#### Step 6: Fix Login Test with New Utility

**File**: `apps/frontend/src/pages/auth/__tests__/Login.test.tsx`

```typescript
// Add import:
import { renderWithClerk } from '@/test/utils'

// Replace:
render(
  <MemoryRouter>
    <Login />
  </MemoryRouter>
)

// With:
renderWithClerk(<Login />)
```

**Note**: Remove `MemoryRouter` from render call since `renderWithClerk` includes it

#### Step 7: Fix Files Upload Test

**File**: `api/__tests__/files-upload.test.js`

**First**: Verify current implementation:

```bash
grep -r "supabase" api/files.js
grep -r "supabase" api/_lib/
```

**If supabase doesn't exist**:

- Check if test is testing obsolete functionality
- Update test to match MongoDB-based implementation
- Or exclude/remove test if obsolete

**If import path is wrong**:

- Fix import path to match actual file location
- Or remove supabase import if not used

---

## Files to Modify

### New Files

- `apps/frontend/src/test/utils.tsx` - Reusable test utilities (renderWithClerk, renderWithQueryClient, renderWithProviders)

### Modified Files

- `apps/frontend/src/test/mocks/lucide-react.tsx` - Add Pause icon export
- `apps/frontend/src/components/__tests__/Footer.test.tsx` - Fix href expectation
- `apps/frontend/src/components/__tests__/Pricing.test.tsx` - Fix text expectation
- `apps/frontend/src/hooks/__tests__/useContactForm.test.ts` - Add formType to expectations
- `apps/frontend/src/hooks/__tests__/useDemoForm.test.ts` - Add formType to expectations
- `apps/frontend/src/api/__tests__/azureServices.test.ts` - Fix error message assertions (lines 172, 460)
- `apps/frontend/src/pages/auth/__tests__/Login.test.tsx` - Use renderWithClerk utility
- `api/__tests__/files-upload.test.js` - Fix import path or exclude test

---

## Testing Strategy

### Verification Steps

1. **Individual Test Verification** (after each fix):

   ```bash
   npm run test:frontend -- <test-file-name>
   ```

2. **Full Frontend Test Suite**:

   ```bash
   npm run test:frontend
   ```

3. **Full Backend Test Suite**:

   ```bash
   npm run test:backend
   ```

4. **Full Test Suite**:

   ```bash
   npm run test
   ```

5. **Coverage Check** (ensure no regression):
   ```bash
   npm run test:coverage
   ```

### Success Criteria

- ✅ All 17 test failures resolved
- ✅ No new test failures introduced
- ✅ Test coverage maintained or improved
- ✅ Test utilities created and documented
- ✅ All tests pass in CI/CD pipeline

---

## Prevention Strategies

### 1. Icon Mock Maintenance

**Problem**: Icons added to components but not to mock file

**Solution**: Document process in `.cursor/rules/testing/unit-tests.mdc`

**Process**:

1. When adding new Lucide icon to component, immediately add to mock file
2. Consider adding ESLint rule to warn about unmocked icons
3. Add icon to mock file alphabetically for easier maintenance

**Future Enhancement**: Auto-generate mock file from component imports using script

### 2. Provider Wrapper Standardization

**Problem**: Tests missing required providers

**Solution**: Use test utilities (`renderWithClerk`, `renderWithProviders`)

**Benefits**:

- Centralized provider setup
- Easier to update when providers change
- Explicit provider requirements
- Reduced boilerplate

### 3. Error Message Testing

**Problem**: Brittle error message assertions break when format changes

**Solution**: Use flexible matching patterns

**Best Practices**:

- Use `toContain()` for partial matches
- Use `toMatch()` with regex for patterns
- Test error structure separately (type + message)
- Consider error codes instead of exact messages

### 4. API Contract Testing

**Problem**: Tests break when API contract changes (e.g., `formType` field)

**Solution**: Use `expect.objectContaining()` for flexible assertions

**Pattern**:

```typescript
// Test required fields explicitly
expect(requestBody).toMatchObject({
  formType: 'contact',
  name: expect.any(String),
  email: expect.any(String),
})

// Use objectContaining for optional fields
expect(requestBody).toEqual(
  expect.objectContaining({
    formType: 'contact',
  })
)
```

### 5. Test Maintenance Checklist

Add to PR template or development workflow:

- [ ] All new icons added to mock file
- [ ] Components with providers use test utilities
- [ ] Error message tests use flexible matching
- [ ] API contract changes reflected in tests
- [ ] Tests pass locally before committing

---

## Risk Assessment

### Low Risk

- Footer test (simple expectation update)
- Azure services tests (error message format only)
- Files upload test (likely obsolete, can exclude)

### Medium Risk

- Pricing test (need to verify correct text)
- Form hook tests (API contract change - verify with backend)
- Login test (provider setup - use established pattern)

### High Risk

- Hero component tests (9 failures - largest impact) - **Mitigation**: Simple icon addition, low chance of regression

### Overall Risk: **LOW**

- All changes are test-only (no production code)
- Changes are isolated to specific test files
- Can verify each fix individually
- Rollback is simple (git revert)

---

## Timeline

- **Phase 1** (Test Utilities): 30 minutes
- **Phase 2** (Individual Fixes): 1-2 hours - Icon mock: 5 minutes - Footer/Pricing: 15 minutes - Form hooks: 30 minutes - Azure services: 15 minutes - Login: 15 minutes - Files upload: 30 minutes
- **Phase 3** (Verification): 30 minutes
- **Total**: 2-3 hours

---

## Additional Notes

### Test Utilities Export

Add to `apps/frontend/src/test/index.ts` (if exists) or create:

```typescript
export * from './utils'
export * from './mocks/lucide-react'
```

### Documentation Updates

Update `.cursor/rules/testing/unit-tests.mdc` with:

- Test utility usage examples
- Icon mock maintenance process
- Provider wrapper patterns
- Error message testing best practices

### Future Improvements

1. **Auto-generate icon mocks**: Script to scan components and generate mock file
2. **ESLint rule**: Warn when Lucide icon used but not in mock
3. **Test utilities**: Add more wrappers as needed (ThemeProvider, etc.)
4. **Error testing utilities**: Helper functions for common error patterns

---

## References

- [Vitest Testing Guide](https://vitest.dev/guide/)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Clerk Testing Documentation](https://clerk.com/docs/quickstarts/test-your-app)
- Project testing rules: `.cursor/rules/testing/unit-tests.mdc`
- Existing test patterns: `apps/frontend/src/components/__tests__/Contact.test.tsx`
