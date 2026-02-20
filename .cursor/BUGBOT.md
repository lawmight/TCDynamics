# Bugbot review guide — TCDynamics WorkFlowAI

Use this file with team-wide Cursor rules when reviewing PRs (`cursor review` / `bugbot run`). For full rule text, see `.cursor/rules/always.dot-agents-backup/` (security, code-style, accessibility).

---

## 1. Project context

Monorepo: **`apps/frontend`** (React 18 + Vite), **`api`** (Vercel serverless), **`apps/backend`** (Express, local/dev only). Production is Vercel serverless API + React frontend; Express is not deployed. Target users: French SMEs; use French user-facing copy in API responses where relevant.

---

## 2. Security checklist

- **Input sanitization**: Sanitize user input with DOMPurify via `sanitizeString` from `api/_lib/sanitize.js` (see security rule for pattern).
- **Protected routes**: Use `verifyClerkAuth` from `api/_lib/auth.js`; validate `Authorization: Bearer <token>`; return standardized auth error responses; link users by `clerkId` in MongoDB.
- **Guards**: Form/API handlers should use `withGuards` from `api/_lib/request-guards.js` (rate limit, allowed fields, optional captcha).
- **Sensitive data**: Never log request bodies with passwords/tokens; use env vars for secrets; hash PII (e.g. orgId, userId) before logging per README; reference `.env.example` for required variables.
- **Headers**: Helmet/CSP (defaultSrc `'self'`, frameSrc/objectSrc `'none'`, HSTS preload). Rate limiting: default 5 req/15 min per IP for form submissions; configure via env.

---

## 3. Code quality

- No `any`; use proper typing or `unknown` with type guards. Explicit Props/State interfaces; `type` for unions/primitives, `interface` for object shapes.
- Import order: node → external → `@/` → relative → index.
- Naming: PascalCase components (`.tsx`), `use`-prefixed hooks, camelCase utils in `/utils` or `/lib`, PascalCase types/interfaces (Props suffix for component props).
- Use project `logger` from `@/utils/logger`; no `console.log` in production code (only `console.warn`/`console.error` where appropriate).
- JSDoc for public functions and complex logic; `@example` for reusable hooks/utilities.

---

## 4. Accessibility (frontend/TSX)

- WCAG 2.1 AA: `alt` on all images; labels for all form inputs (`<label htmlFor="...">`); keyboard access and visible focus (`:focus-visible`).
- Prefer semantic elements (`<button>`, `<a>`) over `<div>`; `onClick` needs `onKeyDown` where applicable; modals/dialogs trap focus.
- ShadCN/Radix: use built-in a11y; don’t remove `role` or `aria-*` without reason; test with keyboard.

---

## 5. API and backend

- **New serverless handlers**: Use `withGuards` where appropriate (allowedMethods, allowedFields, rateLimit, requireCaptcha).
- **New auth-required routes**: Use `verifyClerkAuth(authHeader)`; return consistent error shape for missing/invalid token.
- **MongoDB**: Link users by `clerkId`.
- **Env**: See root `.env.example` and `docs/development/environment-setup.md` for required vars (e.g. `CLERK_SECRET_KEY`, `MONGODB_URI`).

---

## 6. What to flag

- Missing input sanitization (user-controlled data not passed through `sanitizeString` or equivalent).
- Routes that should be protected but don’t use `verifyClerkAuth`.
- `console.log` in production code paths.
- Use of `any` or missing explicit types for Props/State.
- Missing `<label>` for form inputs or missing `alt` on `<img>`.
- New form or submission endpoints without rate limiting (e.g. missing `withGuards` or `applyRateLimit`).
- Logging of request bodies that may contain passwords or tokens; logging PII without hashing.

---

## 7. Nia-suggested checks (from indexed repo)

*Added from Nia semantic search over lawmight/TCDynamics for security patterns and common serverless/React bugs.*

### Security & API

- **Rate limit key (frontend)**: If using client-side rate limiters (e.g. in `azureServices.ts`), use a stable key (user/session/`localStorage` client id), not `Date.now()` — otherwise the limiter never accumulates. Server-side rate limiting remains the real control.
- **Headers & CORS**: Security headers and CORS must be applied where HTTP responses are produced (server/Vercel), not only in frontend utilities.
- **Sanitize after validation**: For contact/demo and other forms, sanitize string fields (e.g. via `sanitizeString` or frontend `sanitizeInput`) after schema parse; validation ensures shape, not safety for rendering/logging/email.
- **Stripe webhooks**: Use the **raw request body** for signature verification; ensure body parsing isn’t consuming it first (Vercel/Express differ).
- **Express vs Vercel**: Single source of truth for production API (Vercel serverless); frontend base URL should be env-driven (`VITE_API_BASE_URL`); avoid dev hitting Express while prod hits Vercel without explicit config.

### Frontend / React

- **Router & ErrorBoundary**: Components using router hooks must render inside `<BrowserRouter>`; ensure ErrorBoundary wraps navigation and lazy routes to avoid blank/black page.
- **Lazy + Suspense**: Lazy-loaded pages must have a default export; handle ChunkLoadError (e.g. offer reload).
- **React Query retry**: Normalize fetch errors (e.g. `status` on thrown error) so retry logic doesn’t assume wrong shape; handle network errors (e.g. `TypeError`) explicitly.
- **SPA on Vercel**: Ensure `vercel.json` rewrites non-asset routes to `index.html` so direct navigation/refresh works.
- **No objects as React children**: Avoid rendering raw objects in JSX or toasts; can cause “Objects are not valid as a React child”.

### Env & ops

- **Env drift**: Keep a single env matrix (local/staging/prod) and validate required vars at startup in each serverless function; watch for `VITE_` prefix for frontend.

---

**Further context**: See `docs/` and root `README.md`. Repo is indexed in Nia; re-run search/oracle for fresh suggestions.
