# Implementation Tasks - Next Phase Guide

**Priority Order**: Quick Wins → Testing Infrastructure → Advanced Optimization

---

## Priority 1: Quick Wins (Week 1-2)

### Task 1.1: Enable Fluid Compute in Vercel Configuration

**Priority**: High | **Estimated Time**: 5 minutes | **Impact**: 50%+ cold start reduction

**Current State**: `apps/frontend/vercel.json` only has `maxDuration: 10`

**Steps**:

1. Open `apps/frontend/vercel.json`
2. Update the `functions` section to include `memory: 1024`
3. Add `experimental.fluidCompute: true` at root level
4. Add `env.USE_BYTECODE_CACHING: "1"` for bytecode caching

**Code Changes**:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "experimental": {
    "fluidCompute": true
  },
  "env": {
    "USE_BYTECODE_CACHING": "1"
  }
}
```

**Verification**:

- [ ] File saved successfully
- [ ] JSON syntax is valid (no linting errors)
- [ ] Commit and push to trigger deployment
- [ ] Check Vercel dashboard → Functions → verify memory allocation shows 1024MB
- [ ] Monitor function cold starts in Vercel Observability (should see reduction)

**Files Modified**:

- `apps/frontend/vercel.json`

---

### Task 1.2: Update Sentry Configuration for Vite

**Priority**: High | **Estimated Time**: 30 minutes | **Impact**: Better error tracking with source maps

**Current State**:

- Frontend uses `@sentry/react` (should be `@sentry/browser`)
- API uses `@sentry/node` (correct)
- No Vite plugin for source maps
- Environment variable is `VITE_SENTRY_DSN` (already correct)

**Steps**:

#### Step 1: Install Required Packages

```bash
cd apps/frontend
npm install @sentry/browser @sentry/vite-plugin
npm uninstall @sentry/react  # Remove old package
```

#### Step 2: Update Frontend Monitoring (`apps/frontend/src/utils/monitoring.tsx`)

- Replace `@sentry/react` import with `@sentry/browser`
- Update initialization to use proper Vite environment variables

**Code Changes**:

```typescript
// Line 55: Change import
const Sentry = await import('@sentry/browser')

// Line 56-59: Update init configuration
Sentry.init({
  dsn: this.dsn,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // Match API configuration
  beforeSend(event, hint) {
    // Only send errors in production
    if (import.meta.env.MODE !== 'production') {
      return null
    }
    return event
  },
})
```

#### Step 3: Configure Vite Plugin (`apps/frontend/vite.config.ts`)

- Add Sentry Vite plugin import
- Configure plugin in plugins array (only for production builds)
- Add environment variable checks

**Code Changes**:

```typescript
// Add import at top (after line 4)
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Update plugins array (around line 20-32)
plugins: [
  react(),
  // Sentry source maps plugin (production only)
  mode === 'production' &&
    import.meta.env.SENTRY_AUTH_TOKEN &&
    sentryVitePlugin({
      org: import.meta.env.SENTRY_ORG,
      project: import.meta.env.SENTRY_PROJECT,
      authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
        ignore: ['node_modules'],
        rewriteSources: (source) => source.replace(/^\/@fs/, ''),
      },
    }),
  // Bundle analysis plugin - generates stats.html in dist/
  mode === 'production' &&
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
].filter(Boolean),
```

#### Step 4: Update Environment Variables

**In Vercel Dashboard**:

1. Go to Project Settings → Environment Variables
2. Verify `VITE_SENTRY_DSN` exists (should already be there)
3. Add new variables (from Sentry dashboard):
   - `SENTRY_ORG` - Your Sentry organization slug
   - `SENTRY_PROJECT` - Your Sentry project name
   - `SENTRY_AUTH_TOKEN` - Generate from Sentry → Settings → Auth Tokens (needs `project:releases` scope)

**In Local Development** (`.env.local`):

```env
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your_auth_token_here
```

#### Step 5: Update Build Script (Optional - for source map uploads)

Add to `apps/frontend/package.json` scripts:

```json
{
  "scripts": {
    "build:sentry": "vite build && sentry-cli sourcemaps inject dist && sentry-cli sourcemaps upload dist"
  }
}
```

**Verification**:

- [ ] Packages installed successfully
- [ ] `monitoring.tsx` updated and imports `@sentry/browser`
- [ ] `vite.config.ts` includes Sentry plugin
- [ ] Environment variables added to Vercel
- [ ] Build completes without errors
- [ ] Source maps appear in Sentry dashboard after deployment
- [ ] Test error capture: Trigger an error and verify it appears in Sentry with proper source maps

**Files Modified**:

- `apps/frontend/package.json` (dependencies)
- `apps/frontend/src/utils/monitoring.tsx`
- `apps/frontend/vite.config.ts`
- `.env.local` (local development)
- Vercel Dashboard (environment variables)

---

### Task 1.3: Configure Vercel Observability Alerts

**Priority**: Medium | **Estimated Time**: 15 minutes | **Impact**: Proactive error detection

**Steps**:

1. Go to Vercel Dashboard → Your Project → Settings → Alerts
2. Create three alerts:

**Alert 1: 5xx Error Rate**

- **Name**: "High 5xx Error Rate"
- **Condition**: Error rate > 1% for 5 minutes
- **Notification**: Email + Slack (if configured)
- **Query**:
  ```sql
  SELECT
    COUNT(*) FILTER (WHERE status_code >= 500) as errors,
    COUNT(*) as total,
    (COUNT(*) FILTER (WHERE status_code >= 500)::float / COUNT(*) * 100) as error_rate
  FROM function_invocations
  WHERE timestamp > now() - interval '5 minutes'
  ```

**Alert 2: Function Latency**

- **Name**: "High Function Latency"
- **Condition**: p95 latency > 2000ms for 5 minutes
- **Notification**: Email + Slack
- **Query**:
  ```sql
  SELECT
    function_name,
    p95(duration) as p95_duration
  FROM function_invocations
  WHERE timestamp > now() - interval '5 minutes'
  GROUP BY function_name
  HAVING p95(duration) > 2000
  ```

**Alert 3: Usage Spike**

- **Name**: "Unusual Traffic Spike"
- **Condition**: Request count increases by 200% in 10 minutes
- **Notification**: Email
- **Query**: (Use Vercel's built-in spike detection)

**Verification**:

- [ ] All three alerts created in Vercel dashboard
- [ ] Test alerts by temporarily triggering conditions (optional)
- [ ] Verify notification channels are working

**Files Modified**:

- None (Vercel Dashboard configuration only)

---

## Priority 2: Testing Infrastructure (Week 3-4)

### Task 2.1: Enhance CI/CD Quality Gates

**Priority**: High | **Estimated Time**: 45 minutes | **Impact**: Catch issues before deployment

**Current State**: `.github/workflows/deploy-mvp.yml` only has non-blocking lint

**Steps**:

#### Step 1: Create New Quality Gate Workflow

Create `.github/workflows/quality-gate.yml`:

```yaml
name: 'Quality Gate'

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/frontend/package-lock.json

      - name: Install root dependencies
        run: npm install

      - name: Install frontend dependencies
        working-directory: ./apps/frontend
        run: npm install

      - name: Type Check
        working-directory: ./apps/frontend
        run: npm run type-check

      - name: Lint
        working-directory: ./apps/frontend
        run: npm run lint

      - name: Unit Tests
        working-directory: ./apps/frontend
        run: npm run test:coverage

      - name: Check Coverage Threshold
        working-directory: ./apps/frontend
        run: |
          # Generate coverage report
          npm run test:coverage -- --reporter=json-summary --reporter=text

          # Extract coverage percentage
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')

          # Check if coverage meets threshold (start with 50%, increment to 80%)
          THRESHOLD=50
          if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% is below $THRESHOLD% threshold"
            exit 1
          else
            echo "✅ Coverage $COVERAGE% meets $THRESHOLD% threshold"
          fi

      - name: Build Check
        working-directory: ./apps/frontend
        run: npm run build

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage
          fail_ci_if_error: false
```

#### Step 2: Update Deploy Workflow

Modify `.github/workflows/deploy-mvp.yml` to run quality gate first:

```yaml
name: 'Deploy MVP to Vercel'

on:
  push:
    branches: [main]

jobs:
  # Run quality gate first
  quality-gate:
    uses: ./.github/workflows/quality-gate.yml

  deploy:
    needs: quality-gate
    runs-on: ubuntu-latest
    # ... rest of existing workflow
```

**Alternative**: Keep deploy workflow separate but add quality checks as required steps before deploy.

**Verification**:

- [ ] Quality gate workflow created
- [ ] Workflow runs on PR and push to main
- [ ] All checks pass (type-check, lint, tests, coverage, build)
- [ ] Coverage threshold enforced (fails if below 50%)
- [ ] Coverage report uploaded to Codecov (optional)
- [ ] Deploy only happens if quality gate passes

**Files Created**:

- `.github/workflows/quality-gate.yml`

**Files Modified**:

- `.github/workflows/deploy-mvp.yml` (add quality-gate as dependency)

**Dependencies**:

- Install `jq` and `bc` in GitHub Actions (or use Node.js alternatives)
- Consider using `vitest-coverage` action for better Vitest integration

---

### Task 2.2: Incrementally Increase Coverage Thresholds

**Priority**: Medium | **Estimated Time**: Ongoing | **Impact**: Better code quality

**Current State**: `apps/frontend/vitest.config.ts` has 50% thresholds

**Steps**:

#### Phase 1: Increase to 60% (Week 1)

1. Open `apps/frontend/vitest.config.ts`
2. Update thresholds:

```typescript
thresholds: {
  branches: 60,
  functions: 60,
  lines: 60,
  statements: 60,
},
```

3. Run `npm run test:coverage` to see current coverage
4. Identify files below threshold
5. Write tests for critical paths first
6. Update CI threshold to match (in quality-gate.yml)

#### Phase 2: Increase to 70% (Week 2-3)

- Repeat process, focusing on utility functions and hooks

#### Phase 3: Increase to 80% (Week 4+)

- Final push to reach 80% coverage
- Focus on edge cases and error handling

**Strategy**:

- Use `--coverage.include` to focus on specific directories
- Prioritize: utils → hooks → components → pages
- Use `--coverage.exclude` to exclude test files, types, mocks

**Verification**:

- [ ] Threshold updated in `vitest.config.ts`
- [ ] CI threshold updated to match
- [ ] Coverage report shows improvement
- [ ] No false positives (legitimate exclusions added)

**Files Modified**:

- `apps/frontend/vitest.config.ts`
- `.github/workflows/quality-gate.yml` (threshold variable)

---

### Task 2.3: Upgrade ESLint `no-explicit-any` Rule

**Priority**: Low | **Estimated Time**: 2-4 hours | **Impact**: Better type safety

**Current State**: `apps/frontend/eslint.config.js` has `@typescript-eslint/no-explicit-any: 'warn'`

**Steps**:

#### Step 1: Find All `any` Usages

```bash
cd apps/frontend
npx eslint . --ext ts,tsx --format json | jq '.[] | select(.messages[].ruleId == "@typescript-eslint/no-explicit-any")'
```

Or use grep:

```bash
grep -r ":\s*any\b" src/ --include="*.ts" --include="*.tsx"
```

#### Step 2: Categorize Issues

- **Easy fixes**: Replace with `unknown` and add type guards
- **Medium fixes**: Create proper types/interfaces
- **Hard fixes**: Complex types that need refactoring

#### Step 3: Fix Incrementally

1. Start with one file at a time
2. Fix all `any` types in that file
3. Run tests to ensure nothing broke
4. Commit changes
5. Repeat

#### Step 4: Update ESLint Config

Once all `any` types are fixed:

```javascript
'@typescript-eslint/no-explicit-any': 'error', // Changed from 'warn'
```

**Verification**:

- [ ] All `any` types identified and categorized
- [ ] Fixed incrementally (one file/component at a time)
- [ ] Tests pass after each fix
- [ ] ESLint rule upgraded to `error`
- [ ] CI passes with new rule

**Files Modified**:

- `apps/frontend/eslint.config.js`
- Multiple source files (as `any` types are fixed)

---

## Priority 3: Advanced Optimization (Week 5-6)

### Task 3.1: Enhance Bundle Analysis Configuration

**Priority**: Low | **Estimated Time**: 10 minutes | **Impact**: Better visibility into bundle size

**Current State**: `rollup-plugin-visualizer` is installed and configured, but only runs in production

**Steps**:

#### Step 1: Add Analyze Script

Update `apps/frontend/package.json`:

```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

#### Step 2: Update Vite Config for Analyze Mode

Modify `apps/frontend/vite.config.ts`:

```typescript
export default defineConfig(({ mode }) => ({
  // ... existing config
  plugins: [
    react(),
    // Bundle analysis - always run in analyze mode, or production
    (mode === 'analyze' || mode === 'production') &&
      visualizer({
        open: mode === 'analyze', // Auto-open in analyze mode
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      }),
    // ... rest of plugins
  ].filter(Boolean),
}))
```

#### Step 3: Create Bundle Size Budget

Add to `vite.config.ts` build section:

```typescript
build: {
  // ... existing config
  rollupOptions: {
    output: {
      // ... existing config
    },
    // Add size warnings
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return
      }
      // Warn on large chunks
      if (warning.code === 'CHUNK_SIZE_WARNING') {
        console.warn('⚠️ Large chunk detected:', warning)
      }
      warn(warning)
    },
  },
  // Existing chunkSizeWarningLimit: 400
}
```

**Verification**:

- [ ] `npm run analyze` command works
- [ ] `dist/stats.html` is generated
- [ ] Bundle visualization opens in browser
- [ ] Can identify large dependencies

**Files Modified**:

- `apps/frontend/package.json`
- `apps/frontend/vite.config.ts`

---

### Task 3.2: Implement LRU Caching for API Functions

**Priority**: Medium | **Estimated Time**: 1 hour | **Impact**: Reduced API calls, faster responses

**Steps**:

#### Step 1: Install LRU Cache

```bash
cd api
npm install lru-cache
```

#### Step 2: Create Cache Utility

Create `api/_lib/cache.js`:

```javascript
import { LRUCache } from 'lru-cache'

/**
 * In-memory LRU cache for API responses
 * Max 500 entries, 5 minute TTL
 */
const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true, // Reset TTL on access
})

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null
 */
export function getCached(key) {
  return cache.get(key) || null
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Optional custom TTL in milliseconds
 */
export function setCached(key, value, ttl = null) {
  if (ttl) {
    cache.set(key, value, { ttl })
  } else {
    cache.set(key, value)
  }
}

/**
 * Clear cache entry
 * @param {string} key - Cache key
 */
export function clearCached(key) {
  cache.delete(key)
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    calculatedSize: cache.calculatedSize,
  }
}

export default {
  getCached,
  setCached,
  clearCached,
  clearAllCache,
  getCacheStats,
}
```

#### Step 3: Use Cache in API Functions

Example: Update an API function to use caching:

```javascript
// api/example.js
import { getCached, setCached } from '../_lib/cache.js'

export default async function handler(req, res) {
  const cacheKey = `data-${req.query.id || 'default'}`

  // Try to get from cache
  let data = getCached(cacheKey)

  if (!data) {
    // Fetch fresh data
    data = await fetchData(req.query.id)

    // Cache the result
    setCached(cacheKey, data)
  }

  return res.json(data)
}
```

**Best Practices**:

- Use descriptive cache keys: `user-${userId}`, `product-${productId}`
- Set appropriate TTLs based on data freshness requirements
- Clear cache on mutations (POST, PUT, DELETE)
- Don't cache user-specific data unless key includes user ID

**Verification**:

- [ ] Cache utility created
- [ ] LRU cache package installed
- [ ] At least one API function uses caching
- [ ] Cache hit/miss can be verified (add logging)
- [ ] Cache clears appropriately on mutations

**Files Created**:

- `api/_lib/cache.js`

**Files Modified**:

- `api/package.json` (add lru-cache dependency)
- Selected API functions (add caching)

---

### Task 3.3: Set Up Log Drains (Optional)

**Priority**: Low | **Estimated Time**: 30 minutes | **Impact**: Centralized logging

**Steps**:

#### Option A: Datadog (Recommended if already using)

1. Go to Vercel Dashboard → Project Settings → Log Drains
2. Click "Add Log Drain"
3. Select "Datadog"
4. Follow integration wizard
5. Verify logs appear in Datadog

#### Option B: Custom Endpoint

1. Create logging endpoint (e.g., in your backend)
2. Go to Vercel Dashboard → Project Settings → Log Drains
3. Add custom log drain URL
4. Configure authentication if needed
5. Test by triggering a function and checking logs

**Verification**:

- [ ] Log drain configured
- [ ] Logs appear in destination
- [ ] Can search and filter logs
- [ ] Alerts can be set up based on logs

**Files Modified**:

- None (Vercel Dashboard configuration)

---

## Summary Checklist

### Week 1-2 (Quick Wins)

- [ ] Task 1.1: Enable Fluid Compute
- [ ] Task 1.2: Update Sentry for Vite
- [ ] Task 1.3: Configure Vercel Observability Alerts

### Week 3-4 (Testing Infrastructure)

- [ ] Task 2.1: Enhance CI/CD Quality Gates
- [ ] Task 2.2: Increase Coverage Thresholds (incremental)
- [ ] Task 2.3: Upgrade ESLint `no-explicit-any` (ongoing)

### Week 5-6 (Advanced Optimization)

- [ ] Task 3.1: Enhance Bundle Analysis
- [ ] Task 3.2: Implement LRU Caching
- [ ] Task 3.3: Set Up Log Drains (optional)

---

## Notes

- **Dependencies**: Some tasks depend on others (e.g., Sentry setup before alerts)
- **Testing**: Test each change in a feature branch before merging
- **Monitoring**: Monitor metrics after each change to verify improvements
- **Rollback Plan**: Keep previous configurations in git history for easy rollback

---

**Last Updated**: Based on Next Phase Implementation Guide corrections
**Estimated Total Time**: 15-20 hours across 6 weeks
