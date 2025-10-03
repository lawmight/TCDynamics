# Performance Optimization – Frontend & Backend

This project already includes strong performance foundations (lazy loading, manual chunks, monitoring). Use these targeted steps to improve further.

## Frontend (Vite + React)

- Code splitting
  - Keep large components lazy, e.g. `LazyAIChatbot`. Wrap with `<Suspense/>` and light fallbacks.
  - Use `vite.config.ts` manual chunks to keep vendor/UI/query/icons separated.
- Bundle hygiene
  - Prefer named imports. Avoid pulling full libraries unnecessarily.
  - Inspect bundle with:

```bash
# temporary install
npm i -D rollup-plugin-visualizer
# then add to vite plugins locally to inspect
```

- Terser production flags (already configured)
  - `drop_console`, `drop_debugger`, `pure_funcs` for console methods.
- Performance metrics
  - Use `src/components/PerformanceMonitor.tsx` (toggle: Ctrl+Shift+P) for dev.
  - Programmatically record metrics with `performanceMonitor.measure/measureAsync`.
  - Sample high-volume metrics with `optimizedPerformanceMonitor`.

- Caching & memoization
  - Use `smartCache` for expensive API/data transformations with TTLs from `config`.
  - Memoize heavy React subtrees, stabilize props, use `useMemo`/`useCallback` prudently.

- Images & assets
  - Use responsive images; prefer `public/` assets with appropriate sizes.
  - Consider `loading="lazy"` for offscreen images.

- Network
  - Batch API requests where possible; debounce user-driven calls (see `useThrottle`, `performanceUtils.throttle/debounce`).
  - Use `@tanstack/react-query` for caching/fetch control where applicable.

## Backend (Express)

- Middleware order (already optimized)
  - `compression` with threshold, `helmet`, CORS, JSON parser with raw body, CSRF, metrics, error handlers.
- Observability
  - Keep `routes/monitoring.js` metrics endpoints. Add business metrics as needed.
  - Log with structured `winston` logger; avoid excessive logs in hot paths.

- Rate limiting & security
  - Use `formRateLimit` for sensitive endpoints; keep CSP strict in production via `helmet`.

- Payloads
  - Enforce body limits (`10mb` already set). Prefer streams for large uploads.

## Practical playbook

1) Establish baseline

```bash
npm run build
npm run test:coverage
```

2) Track hotspots

- Add targeted metrics:

```ts
import { performanceMonitor } from '@/utils/performance'
await performanceMonitor.measureAsync('featureX.load', () => doWork())
```

3) Optimize

- Break large components and lazy-load routes/widgets.
- Cache computed data via `smartCache.set(key, data, ttl)` and read with `smartCache.get(key)`.
- Trim dependencies; prefer light alternatives.

4) Verify

```bash
npm run build
npm run test
npm run lint
```

## Env flags that impact performance

- `VITE_FEATURE_ENABLE_DEBUG_LOGGING` (false in prod)
- `VITE_FEATURE_ENABLE_CACHE`
- `VITE_CACHE_MAX_SIZE`, `VITE_CACHE_DEFAULT_TTL`, `VITE_CACHE_CLEANUP_INTERVAL`
- `VITE_PERFORMANCE_ENABLE_SAMPLING`, `VITE_PERFORMANCE_SAMPLE_RATE`

Tune these via `.env` and see `src/utils/config.ts` for defaults and safe bounds.
