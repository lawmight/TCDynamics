# Refactor Guide – Safe, Incremental, and Testable

This repo has solid guards (Vitest, ESLint, TypeScript, strong utils). Use this checklist to refactor safely.

## 1) Prepare

- Read domain code first (frontend under `src/`, backend under `backend/src/`).
- Run tests and lint to baseline:

```bash
npm test
npm run lint
npm run type-check
```

## 2) Small, incremental edits

- Keep PRs focused (one concern per PR).
- Preserve public APIs of components/hooks; introduce new helpers, then migrate call sites.
- Prefer composition over inheritance; keep components modular and reuse `src/components/ui/*`.

## 3) Type-first refactors

- Strengthen types, avoid `any`.
- Extract complex object shapes to named types/interfaces in local `types.ts` or near usage.
- Use guards and early returns; reduce nesting.

## 4) File organization

- Frontend alias `@` points to `src/`. Keep feature code colocated.
- Utilities live in `src/utils/` (`config`, `logger`, `performance`, `security`, etc.).
- Prefer `src/hooks/` for shared hooks; test under `__tests__/` folders.

## 5) Performance-aware refactors

- Use `LazyAIChatbot` and code-splitting patterns (see `vite.config.ts` manual chunks).
- Use `performanceMonitor` and `optimizedPerformanceMonitor` to measure critical paths.
- Cache reads with `smartCache` when appropriate; keep TTLs aligned with `src/utils/config.ts` defaults.

## 6) Backend refactors

- Respect middleware order in `backend/src/server.js` (security, compression, CORS, parsers, CSRF, routes, error handlers).
- Keep `monitoring` metrics updates intact; add new endpoints under `/api`.
- Use centralized error helpers from `middleware/errorHandler.js`.

## 7) Testing strategy

- Run unit/UI tests with Vitest/RTL:

```bash
npm test
npm run test:ui
npm run test:coverage
```

- Add tests near code (`__tests__`); aim for thresholds set in `vitest.config.ts`.

## 8) Lint + format

- Fix ESLint errors and Prettier formatting before commit:

```bash
npm run lint:fix && npm run format
```

## 9) Migrations

- When renaming exports/paths, refactor with editor tooling and run a full type-check.
- For breaking changes, create small codemods or adapters, migrate gradually, then remove adapters.

## 10) Observability

- If changing performance-sensitive code, add/keep metrics via `performanceMonitor.recordMetric`.
- For frontend errors, ensure `ErrorBoundary` remains around app roots and `monitoring.init()` is called when DSN is configured.

## PR checklist

- Tests passing locally
- Type-check clean
- ESLint/Prettier clean
- No noisy `console.*` left (prod build strips, but keep code tidy)
- Docs/README updated if behavior changes
