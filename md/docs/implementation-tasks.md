# Implementation Tasks - Next Phase Guide

**Priority Order**: Quick Wins → Testing Infrastructure → Advanced Optimization

---

## Priority 1: Quick Wins

### ✅ Task 1.1: Enable Fluid Compute in Vercel Configuration _(Partial)_

**Completed**:

- [x] `USE_BYTECODE_CACHING: "1"` added to `vercel.json`

**Remaining**:

- [ ] Add `memory: 1024` to functions configuration
- [ ] Add `experimental.fluidCompute: true`

**Code to add** in `apps/frontend/vercel.json`:

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "experimental": {
    "fluidCompute": true
  }
}
```

**Files**: `apps/frontend/vercel.json`

---

### ✅ Task 1.2: Update Sentry Configuration for Vite — COMPLETE

- [x] `@sentry/browser` installed
- [x] `monitoring.tsx` uses `@sentry/browser` with proper Vite env vars
- [x] `vite.config.ts` includes Sentry plugin (production only)
- [x] Source maps configured

**Files**: `apps/frontend/src/utils/monitoring.tsx`, `apps/frontend/vite.config.ts`

---

### ⏳ Task 1.3: Configure Vercel Observability Alerts

**Status**: Requires Vercel Dashboard configuration

**Alerts to create**:

| Alert                 | Condition                 | Notification  |
| --------------------- | ------------------------- | ------------- |
| High 5xx Error Rate   | Error rate > 1% for 5 min | Email + Slack |
| High Function Latency | p95 > 2000ms for 5 min    | Email + Slack |
| Unusual Traffic Spike | 200% increase in 10 min   | Email         |

**Location**: Vercel Dashboard → Project Settings → Alerts

---

## Priority 2: Testing Infrastructure

### ✅ Task 2.1: Enhance CI/CD Quality Gates — COMPLETE

- [x] `.github/workflows/quality-gate.yml` created
- [x] Runs on PR and push to main
- [x] Type-check, lint, unit tests, coverage threshold, build check
- [x] API ESM validation and file structure checks
- [x] Coverage threshold at 60%

**Files**: `.github/workflows/quality-gate.yml`

---

### ✅ Task 2.2: Incrementally Increase Coverage Thresholds — Phase 1 COMPLETE

- [x] **Phase 1 (60%)**: Complete in `vitest.config.ts` and CI

**Remaining Phases**:

- [ ] **Phase 2 (70%)**: Update thresholds in `vitest.config.ts` and `quality-gate.yml`
- [ ] **Phase 3 (80%)**: Final push to reach 80% coverage

**Strategy**: Prioritize utils → hooks → components → pages

**Files**: `apps/frontend/vitest.config.ts`, `.github/workflows/quality-gate.yml`

---

### ✅ Task 2.3: Upgrade ESLint `no-explicit-any` Rule — COMPLETE

- [x] Main config: `@typescript-eslint/no-explicit-any: 'error'`
- [x] Test files: `'warn'` (allows `as any` for mocking)

**Files**: `apps/frontend/eslint.config.js`

---

## Priority 3: Advanced Optimization

### ✅ Task 3.1: Enhance Bundle Analysis Configuration — COMPLETE

- [x] `npm run analyze` mode added
- [x] `vite.config.ts` configured with visualizer (treemap, gzip, brotli)
- [x] Auto-opens browser in analyze mode

**Files**: `apps/frontend/vite.config.ts`

---

### ✅ Task 3.2: Implement LRU Caching for API Functions — COMPLETE

- [x] `api/_lib/cache.js` created with full LRU implementation
- [x] `lru-cache` package installed
- [x] Functions: `getCached`, `setCached`, `clearCached`, `clearAllCache`, `getCacheStats`

**Files**: `api/_lib/cache.js`, `api/package.json`

---

### ⏳ Task 3.3: Set Up Log Drains (Optional)

**Status**: Requires Vercel Dashboard configuration

**Options**:

- **Datadog**: Vercel Dashboard → Project Settings → Log Drains → Datadog
- **Custom**: Add custom log drain URL with authentication

---

## Summary Checklist

### Week 1-2 (Quick Wins)

- [x] Task 1.1: Enable Fluid Compute _(partial - needs memory + fluidCompute)_
- [x] Task 1.2: Update Sentry for Vite ✅
- [ ] Task 1.3: Configure Vercel Observability Alerts

### Week 3-4 (Testing Infrastructure)

- [x] Task 2.1: Enhance CI/CD Quality Gates ✅
- [x] Task 2.2: Increase Coverage to 60% ✅ _(70%/80% remaining)_
- [x] Task 2.3: Upgrade ESLint `no-explicit-any` ✅

### Week 5-6 (Advanced Optimization)

- [x] Task 3.1: Enhance Bundle Analysis ✅
- [x] Task 3.2: Implement LRU Caching ✅
- [ ] Task 3.3: Set Up Log Drains (optional)

---

**Last Updated**: 2025-12-18
**Original Estimated Time**: 15-20 hours | **Remaining**: ~5-8 hours
