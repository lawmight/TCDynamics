# Vercel Deployment Failures Analysis

**Date**: December 28, 2025
**Analysis Period**: 2 hours ago (13:38 - 13:53 CET)
**Total Failed Deployments**: 17

## Executive Summary

Between 13:38 and 13:53 CET on December 28, 2025, 17 consecutive Vercel deployments failed due to configuration issues in `vercel.json`. The failures were caused by multiple attempts to fix the build configuration for the monorepo workspace setup.

## Root Causes

### 1. **Multiple Rapid Configuration Changes (Primary Cause)**

Eleven commits were pushed in rapid succession, each attempting to fix the Vercel build configuration:

| Commit | Time | Issue |
|--------|------|-------|
| e68018b | 13:38:21 | Invalid redirect pattern |
| a9904d5 | 13:39:55 | Header source pattern |
| 7af9195 | 13:41:47 | Build command using `cd apps/frontend` |
| 3316a35 | 13:43:27 | Workspace command syntax |
| 05e3143 | 13:45:23 | Root-level build script |
| 1c5fccb | 13:46:46 | Build command from frontend directory |
| 869b83d | 13:48:15 | Subshell for build command |
| c263ab6 | 13:49:43 | npm workspace flag |
| df6c977 | 13:51:48 | Invalid `rootDirectory` property |
| e1b5136 | 13:53:04 | Missing `tsconfig.e2e.json` file |

### 2. **Latest Failure: Missing File in Build Context**

**Deployment ID**: `dpl_8XxdqZb1wGdY9bDmS8o82HiAjQHm` (most recent)
**Error**:
```
[vite:build-html] parsing /vercel/path0/apps/frontend/tsconfig.e2e.json failed:
Error: ENOENT: no such file or directory, open '/vercel/path0/apps/frontend/tsconfig.e2e.json'
```

**Root Cause**: The file `apps/frontend/tsconfig.e2e.json` is:
- Referenced in `apps/frontend/tsconfig.json` (line 6)
- Excluded from Vercel deployment via `apps/frontend/.vercelignore` (line 42)
- Required by Vite during the build process

**Solution**: Remove `tsconfig.e2e.json` from `.vercelignore` or remove the reference from `tsconfig.json` if not needed for production builds.

### 3. **Earlier Failures: Invalid Configuration Properties**

**Deployment ID**: `dpl_FU7xdg5Q4UJLsPRw5G751vp7qEHx` (commit df6c977)
**Error**:
```
Error: No Output Directory named "dist" found after the Build completed.
```

**Root Cause**: The `vercel.json` contained an invalid `rootDirectory` property:
```json
{
  "rootDirectory": "apps/frontend",  // ❌ Invalid in vercel.json v2
  ...
}
```

The `rootDirectory` property is **not valid** in `vercel.json` version 2. It's only valid in:
- Vercel dashboard project settings
- `vercel.json` version 1 (deprecated)

This was correctly fixed in commit e1b5136 by removing the property.

## Current Configuration Status

### ✅ Working Build Command (Current)
```json
{
  "buildCommand": "npm install && npm run -w tcdynamics-frontend build",
  "outputDirectory": "apps/frontend/dist"
}
```

This command correctly:
- Installs all workspace dependencies
- Uses npm workspace flag (`-w`) to run the build script in the `tcdynamics-frontend` package
- Outputs to the correct directory (`apps/frontend/dist`)

### ❌ Outstanding Issue

The `tsconfig.e2e.json` file exclusion in `.vercelignore` is causing build failures because:
1. `tsconfig.json` references it via project references
2. Vite's HTML build plugin tries to parse all TypeScript config files
3. The file is excluded from deployment, causing `ENOENT` error

## Recommendations

### Immediate Fix

**Option 1: Include the file in deployment** (Recommended)
Remove line 42 from `apps/frontend/.vercelignore`:
```diff
# Test configs
playwright.config.ts
vitest.config.ts
- tsconfig.e2e.json
```

**Option 2: Remove the reference** (If e2e tests aren't needed for production)
Remove line 6 from `apps/frontend/tsconfig.json`:
```diff
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
-   { "path": "./tsconfig.e2e.json" }
  ],
```

**Option 3: Conditional reference** (Advanced)
Only include the reference if the file exists (requires build script modification).

### Prevent Future Issues

1. **Test build commands locally** before pushing:
   ```bash
   npm install && npm run -w tcdynamics-frontend build
   ```

2. **Validate `vercel.json`** before committing:
   - Use Vercel's schema: `https://openapi.vercel.sh/vercel.json`
   - Test with `vercel build --debug` locally

3. **Avoid rapid-fire commits** for configuration changes:
   - Test each change locally first
   - Use preview deployments to verify fixes
   - Consider using feature branches for experimental configurations

4. **Monitor deployment status**:
   - Set up deployment notifications
   - Check Vercel dashboard after pushes
   - Use `vercel ls` to monitor recent deployments

## Deployment Timeline

| Time (CET) | Commit | Status | Duration | Error Type |
|------------|--------|--------|----------|------------|
| 13:38:21 | e68018b | ❌ Error | 6s | Invalid config |
| 13:39:55 | a9904d5 | ❌ Error | 7s | Invalid config |
| 13:41:47 | 7af9195 | ❌ Error | 9s | Build command |
| 13:43:27 | 3316a35 | ❌ Error | 8s | Build command |
| 13:45:23 | 05e3143 | ❌ Error | 9s | Build command |
| 13:46:46 | 1c5fccb | ❌ Error | 12s | Build command |
| 13:48:15 | 869b83d | ❌ Error | 9s | Build command |
| 13:49:43 | c263ab6 | ❌ Error | 24s | Build command |
| 13:50:40 | df6c977 | ❌ Error | 23s | Output directory |
| 13:49:07 | h3d15ehb8 | ❌ Error | 9s | Output directory |
| 13:51:48 | df6c977 | ❌ Error | 9s | Output directory |
| 13:53:04 | e1b5136 | ❌ Error | 9s | Missing file |
| 13:53:10 | e1b5136 | ❌ Error | 9s | Missing file |

## Files Referenced

- `vercel.json` - Vercel deployment configuration
- `apps/frontend/.vercelignore` - Files excluded from Vercel deployment
- `apps/frontend/tsconfig.json` - TypeScript project references
- `apps/frontend/tsconfig.e2e.json` - E2E test TypeScript configuration
- `package.json` - Workspace configuration
- `apps/frontend/package.json` - Frontend package configuration

## Verification Commands

```bash
# Check recent deployments
vercel ls tc-dynamics

# Inspect a specific deployment
vercel inspect <deployment-url>

# View build logs
vercel inspect <deployment-id> --logs

# Test build locally
npm install && npm run -w tcdynamics-frontend build
```
