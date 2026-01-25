# GitHub Actions Workflow Logs Summary

Generated: 2026-01-14

> **Status: Superseded (2026-01-25).** The workflow syntax and lockfile issues described here have been resolved. See `.github/workflows/quality-gate.yml`.

## Overview

This document contains information about recent GitHub Actions workflow runs, including logs and failure analysis.

---

## Recent Workflow Runs Status

### Most Recent Runs (Last 20)

Based on `gh run list --limit 20`:

1. **Deploy MVP** (Run ID: 21000731744) - ❌ **FAILED**
   - Event: Push to main
   - Title: "Merge pull request #90 from lawmight/dependabot/npm_and_yarn/frontend…"
   - Created: 2026-01-14T15:59:38Z
   - Status: Failed due to workflow file issue
   - URL: https://github.com/lawmight/TCDynamics/actions/runs/21000731744

2. **Quality Gate** (Run ID: 21000731122) - ❌ **FAILED**
   - Event: Push to main
   - Title: "Merge pull request #90 from lawmight/dependabot/npm_and_yarn/frontend…"
   - Created: 2026-01-14T15:59:37Z
   - Status: Failed due to workflow file issue
   - URL: https://github.com/lawmight/TCDynamics/actions/runs/21000731122

3. **Quality Gate** (Run ID: 20999758472) - ❌ **FAILED**
   - Event: Push to main
   - Title: "Merge pull request #88 from lawmight/cursor/quality-gate-prompt-issue…"
   - Created: 2026-01-14T15:30:49Z

4. **Quality Gate** (Run ID: 20984561510) - ❌ **FAILED**
   - Event: Push to dependabot branch
   - Title: "chore(deps): bump the frontend-dependencies group with 3 updates"
   - Created: 2026-01-14T06:19:53Z

5. **Dependabot Updates** (Run ID: 20984520820) - ✅ **SUCCESS**
   - Event: Dynamic (Dependabot)
   - Title: "npm_and_yarn in /apps/backend - Update #1208619167"
   - Created: 2026-01-14T06:17:55Z

6. **Dependabot Updates** (Run ID: 20984464905) - ✅ **SUCCESS**
   - Event: Dynamic (Dependabot)
   - Title: "npm_and_yarn in /. - Update #1208616587"
   - Created: 2026-01-14T06:15:20Z

---

## Detailed Logs

### Deploy MVP Workflow (Run ID: 20962545670)

**Status**: ❌ Failed
**Date**: 2026-01-13T15:32:56Z
**Event**: Push to main
**Title**: "Merge pull request #87 from lawmight/feature/api_key_loading"

#### Failure Analysis

The workflow failed during the **Quality Gate** step. The error occurred in the `install-dependencies` action:

```
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
```

#### Root Cause

The `package.json` and `package-lock.json` files were out of sync. This typically happens when:

- Dependencies were manually edited in `package.json` without updating the lock file
- Merge conflicts in lock files were resolved incorrectly
- Lock files were not committed after dependency changes

#### Workflow Steps Executed

1. ✅ Checkout code
2. ✅ Setup Node.js (v20.19.6) with caching
3. ❌ Install Dependencies - **FAILED** at `npm ci` step

---

### Dependabot Updates (Run ID: 20984520820)

**Status**: ✅ Success
**Date**: 2026-01-14T06:17:55Z
**Event**: Dynamic (Dependabot)
**Title**: "npm_and_yarn in /apps/backend - Update #1208619167"

#### Summary

This Dependabot run successfully updated backend dependencies. The workflow:

- Cloned the repository
- Set up git configuration
- Processed dependency updates for `/apps/backend`
- Used dependency grouping (backend-dependencies)
- Ignored major version updates (as configured)

#### Key Details

- **Package Manager**: npm_and_yarn
- **Directory**: /apps/backend
- **Update Types**: minor, patch (major updates ignored)
- **Dependency Group**: backend-dependencies
- **Job ID**: 1208619167

---

## Current Issues

### 1. Workflow File Syntax Errors (Most Recent Runs) ⚠️ **CRITICAL**

The two most recent runs (21000731744 and 21000731122) both failed with:

> "This run likely failed because of a workflow file issue."

**Root Cause Identified**: Multiple YAML syntax errors in `.github/workflows/quality-gate.yml`:

#### Syntax Errors Found:

1. **Line 92-93**: Duplicate `if` conditions on the Lint step

   ```yaml
   - name: Lint
     id: lint
     if: ${{ inputs.skip_lint != true && ... }}  # ❌ Duplicate
     if: ${{ (inputs.skip_lint != true && ...) || ... }}  # ❌ Duplicate
   ```

2. **Line 98-99**: Duplicate `if` conditions on the Unit Tests step

   ```yaml
   - name: Unit Tests
     id: test-run
     if: ${{ inputs.skip_tests != true && ... }}  # ❌ Duplicate
     if: ${{ (inputs.skip_tests != true && ...) || ... }}  # ❌ Duplicate
   ```

3. **Line 102-104**: Missing step name - orphaned `id` fields

   ```yaml
     id: test-run  # ❌ Duplicate, no step name
     if: ${{ ... }}  # ❌ Orphaned condition
     id: health-check  # ❌ Missing `- name:` before this
   ```

   **Should be**: A separate step with `- name: Health Check` before `id: health-check`

4. **Line 177-180**: Duplicate `if` conditions on the Build Check step

   ```yaml
   - name: Build Check
     id: build-check
     if: ${{ inputs.skip_build != true && ... }}  # ❌ Duplicate
     working-directory: ./apps/frontend
     run: npm run build
     if: ${{ (inputs.skip_build != true && ...) || ... }}  # ❌ Duplicate
   ```

5. **Line 182-189**: Duplicate `if` conditions and malformed YAML in Upload Coverage step
   ```yaml
   - name: Upload Coverage
     if: ${{ ... && steps.test-run.outcome == 'success' }}  # ❌ First if
     uses: codecov/codecov-action@v5
     with:
       file: ./apps/frontend/coverage/lcov.info
     if: ${{ ... && steps.test-run.outcome == 'success' }}  # ❌ Duplicate if
       name: frontend-coverage  # ❌ Wrong indentation (should be at step level)
       fail_ci_if_error: false  # ❌ Wrong indentation
     continue-on-error: true
   ```

**Action Required**: Fix all duplicate `if` conditions and correct the YAML structure in `.github/workflows/quality-gate.yml`

### 2. Package Lock File Sync Issues

Multiple runs have failed due to `package.json` and `package-lock.json` being out of sync.

**Action Required**:

- Run `npm install` locally to sync lock files
- Commit the updated `package-lock.json` files
- Ensure all dependency changes include lock file updates

---

## Workflow Statistics

### Success Rate (Last 20 Runs)

- **Total Runs**: 20
- **Successful**: 2 (Dependabot runs)
- **Failed**: 18
- **Success Rate**: 10%

### Failure Breakdown

- **Workflow File Issues**: 2 (most recent)
- **Package Lock Sync Issues**: Multiple
- **Quality Gate Failures**: Multiple

---

## Recommendations

1. **Fix Workflow Syntax**: Review and fix any YAML syntax errors in workflow files
2. **Sync Lock Files**: Ensure all `package-lock.json` files are in sync with `package.json`
3. **Add Pre-commit Hook**: Consider adding a hook to validate lock files before commits
4. **Monitor Dependabot PRs**: Review Dependabot PRs before merging to ensure lock files are updated correctly

---

## Log Files Location

Full logs can be retrieved using:

```bash
gh run view <RUN_ID> --log
```

Example:

```bash
gh run view 20962545670 --log > quality-gate-failure.log
```

---

## Related Documentation

- [CI/CD Documentation](./deployment/ci-cd.md)
- [GitHub Actions Workflows](../.github/workflows/)
