# GitHub Actions Debugging Prompt for Background Agent

## Task: Fix Critical GitHub Actions Workflow Failures

You need to fix two critical issues that are blocking main branch workflows:

---

## Issue #1: Workflow File Syntax Errors (CRITICAL - BLOCKING)

**File**: `.github/workflows/quality-gate.yml`

**Problem**: Multiple YAML syntax errors causing workflow runs to fail with "workflow file issue" error.

### Fixes Required:

1. **Lines 92-93**: Remove duplicate `if` condition on Lint step
   - Keep only ONE `if` line (use the OR version: line 93)
   - Remove line 92

2. **Lines 98-99**: Remove duplicate `if` condition on Unit Tests step
   - Keep only ONE `if` line (use the OR version: line 99)
   - Remove line 98

3. **Lines 102-104**: Fix orphaned step - create proper "Health Check" step
   - Remove lines 102-103 (duplicate `id: test-run` and orphaned `if`)
   - Add `- name: Health Check` before line 104
   - Keep `id: health-check`, `if: always()`, and the `run:` block

4. **Lines 132-134**: Remove duplicate `if` condition on Check Coverage Threshold step
   - Keep only ONE `if` line (use the OR version: line 134)
   - Remove line 132

5. **Lines 177-180**: Remove duplicate `if` condition on Build Check step
   - Keep only ONE `if` line (use the OR version: line 180)
   - Remove line 177

6. **Lines 182-189**: Fix Upload Coverage step
   - Remove duplicate `if` on line 186
   - Move `name: frontend-coverage` and `fail_ci_if_error: false` to step level (same indentation as `uses:`)
   - Keep only ONE `if` condition (line 182)

### Expected Result:
- All duplicate `if` conditions removed
- Proper step structure with correct YAML indentation
- Workflow file validates successfully

---

## Issue #2: Package Lock File Sync Issues

**Problem**: `package.json` and `package-lock.json` files are out of sync, causing `npm ci` to fail.

### Fixes Required:

1. Check all `package.json` files in the repository:
   - Root: `package.json`
   - `apps/frontend/package.json`
   - `apps/backend/package.json` (if exists)
   - `api/package.json` (if exists)

2. For each directory with a `package.json`:
   - Run `npm install` in that directory to sync the lock file
   - Verify `package-lock.json` is updated

3. Commit all updated `package-lock.json` files

### Expected Result:
- All `package-lock.json` files are in sync with their corresponding `package.json` files
- `npm ci` runs successfully in CI

---

## Verification Steps

After making fixes:

1. Validate YAML syntax: Check that `.github/workflows/quality-gate.yml` has valid YAML structure
2. Test locally: Run `npm ci` in each directory to verify lock files are synced
3. Commit changes with clear commit message describing fixes

---

## Priority

**Fix Issue #1 FIRST** (workflow syntax errors) - this is blocking all workflow runs.

Then fix Issue #2 (package lock sync) to prevent future `npm ci` failures.

---

## Notes

- Ignore failures on dependabot branches (not critical)
- Focus only on main branch workflow failures
- Ensure all YAML indentation is correct (2 spaces)
- Each step should have only ONE `if` condition
