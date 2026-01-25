> **Status: Superseded (2026-01-25).** One-off agent prompt; quality gate fixes have been applied. See `.github/workflows/quality-gate.yml`.
>
> ---

# Prompt for Background Agent: Fix Quality Gate Workflow Failures

## Context

The GitHub Actions quality gate workflow (`.github/workflows/quality-gate.yml`) is failing frequently. The workflow has been simplified to test only Node.js 20 (removed the matrix strategy for Node 20 and 22). However, there are still issues causing failures.

## Current Workflow Structure

The workflow runs these checks:
1. **Type Check** - TypeScript validation
2. **Lint** - ESLint checks (max 150 warnings)
3. **Unit Tests** - Vitest with coverage
4. **Coverage Threshold** - Must meet 60% coverage
5. **Health Endpoint Check** - Validates Cache-Control headers
6. **Build Check** - Ensures frontend builds successfully
7. **API Validation** - ESM syntax and file structure checks
8. **npm Audit** - Security audit (fails on moderate+ vulnerabilities)

## Common Failure Points to Investigate

### 1. **Coverage Threshold (60%)**
- **Location**: Step "Check Coverage Threshold"
- **Issue**: May be too strict or coverage report not generating correctly
- **Check**:
  - Verify `coverage/coverage-summary.json` is created after tests
  - Check if threshold should be lowered or made configurable
  - Ensure test:coverage script is working correctly

### 2. **npm Audit Failures**
- **Location**: Step "Audit API Dependencies"
- **Issue**: Fails on moderate+ vulnerabilities, may be too strict
- **Check**:
  - Review if vulnerabilities are false positives
  - Consider using `--audit-level=high` instead of `moderate`
  - Check if vulnerabilities can be fixed with `npm audit fix`

### 3. **Complex Conditional Logic**
- **Location**: Multiple steps with nested conditionals
- **Issue**: Input handling for skip flags is complex and error-prone
- **Check**:
  - Simplify conditionals: `inputs.skip_lint != true && inputs.skip_lint != 'true'` is redundant
  - Use a helper action or simpler boolean checks
  - Consider using `inputs.skip_lint == 'true'` pattern consistently

### 4. **API Validation**
- **Location**: Step "Validate API" (uses composite action)
- **Issue**: May fail if files are missing or ESM validation fails
- **Check**:
  - Verify `.github/actions/validate-api/check-esm.js` exists and works
  - Verify `.github/actions/validate-api/required-files.txt` has correct paths
  - Ensure API files match ESM requirements

### 5. **Health Endpoint Check**
- **Location**: Step "Assert health endpoint non-cacheable"
- **Issue**: Brittle grep-based check, may fail if file structure changes
- **Check**:
  - Verify `apps/backend/src/app.ts` exists and has health endpoint
  - Consider making this check more robust or optional if backend isn't deployed

### 6. **Dependency Installation**
- **Location**: Composite action `install-dependencies`
- **Issue**: May fail if package-lock.json is out of sync or cache is corrupted
- **Check**:
  - Verify all package-lock.json files are committed
  - Consider adding `--legacy-peer-deps` if peer dependency issues occur
  - Check if cache keys are correct

### 7. **Type Check / Lint Failures**
- **Location**: Steps "Type Check" and "Lint"
- **Issue**: May fail on legitimate code issues or configuration problems
- **Check**:
  - Verify TypeScript config is correct
  - Check ESLint config and max-warnings setting (150)
  - Ensure all dependencies are installed before running

## Tasks for Background Agent

1. **Review Recent Workflow Failures**
   - Check GitHub Actions runs for the last 10-20 failures
   - Identify the most common failure point
   - Document specific error messages

2. **Fix Conditional Logic**
   - Simplify skip flag conditionals to use consistent pattern
   - Consider creating a reusable action for skip logic
   - Test with different input combinations

3. **Make Coverage Threshold Configurable**
   - Add input parameter for coverage threshold (default 60%)
   - Add better error messages showing actual vs expected coverage
   - Consider making it a warning instead of failure initially

4. **Improve npm Audit Handling**
   - Review current vulnerabilities in API dependencies
   - Consider making audit non-blocking or using `--audit-level=high`
   - Add step to auto-fix with `npm audit fix` (dry-run first)

5. **Add Better Error Handling**
   - Add `continue-on-error: true` to non-critical steps
   - Add better error messages with context
   - Add step to upload logs on failure

6. **Fix Health Endpoint Check**
   - Make it more robust (check if file exists first)
   - Consider making it optional if backend isn't deployed
   - Add better error messages

7. **Verify API Validation**
   - Test the validate-api composite action locally
   - Ensure all required files are listed correctly
   - Fix any ESM syntax issues in API files

8. **Add Debugging Steps**
   - Add step to print Node/npm versions
   - Add step to list installed dependencies
   - Add step to show file structure

9. **Optimize Workflow**
   - Remove redundant steps
   - Combine similar checks where possible
   - Add caching for test results if possible

10. **Document Changes**
    - Update workflow comments
    - Document any new inputs or behaviors
    - Add troubleshooting guide

## Expected Outcomes

After fixes:
- Workflow should pass consistently on clean code
- Clear error messages when it does fail
- Reasonable failure thresholds (coverage, audit)
- Faster execution time (removed matrix, optimized steps)
- Better maintainability (simpler conditionals, clearer structure)

## Testing Strategy

1. Test workflow with all skip flags set to false (normal run)
2. Test with individual skip flags enabled
3. Test with intentionally failing code to verify error messages
4. Test with low coverage to verify threshold behavior
5. Test with audit vulnerabilities to verify handling

## Files to Review/Modify

- `.github/workflows/quality-gate.yml` - Main workflow file
- `.github/actions/install-dependencies/action.yml` - Dependency installation
- `.github/actions/validate-api/action.yml` - API validation
- `.github/actions/validate-api/check-esm.js` - ESM validation script
- `.github/actions/validate-api/required-files.txt` - Required files list
- `apps/frontend/vitest.config.ts` - Test configuration
- `apps/frontend/package.json` - Check test:coverage script

## Notes

- The workflow was recently simplified to remove Node.js version matrix (now only tests Node 20)
- Project uses npm workspaces with frontend, backend, and API directories
- Frontend uses Vitest for testing, TypeScript for type checking
- API uses ESM (type: "module"), backend uses CommonJS
- Coverage threshold is currently 60% - may need adjustment
