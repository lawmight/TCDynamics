# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

AI-powered automation platform for French SMEs. Monorepo with npm workspaces + Turborepo:

- `apps/frontend` — React 18 + Vite (local dev port from `apps/frontend/vite.config.ts`, often **3100** on Windows when **3000** is inside an excluded TCP range)
- `api/` — Vercel serverless functions; local `npm run dev:vercel` listens on **3201** (see root `package.json`, `vercel.api.dev.json`)
- `apps/backend` — Express server (optional, local dev only, port 8080)
- `packages/shared-types`, `packages/shared-utils` — shared TS packages (must be built before type-checking)

### Node Version

Requires **Node 20.x** (`engines.node: "20.x"` in root `package.json`). Use `nvm use 20` before all commands. The VM default is set to Node 20 via nvm.

### Running the Dev Server

See `README.md` Quick Start section. Key command: `npm run dev` runs both frontend (Vite, port from `vite.config.ts`) and Vercel dev server (API, port **3201** in current scripts) concurrently. The Vite dev server proxies `/api` to the URL in `apps/frontend/vite.config.ts` (typically **http://localhost:3201**).

### Clerk Authentication

The app uses Clerk for auth. **In development mode**, `ThemedClerkProvider` in `App.tsx` reads `VITE_CLERK_PREVIEW_PUBLISHABLE_KEY` (not `VITE_CLERK_PUBLISHABLE_KEY`). Both must be set in `apps/frontend/.env.local` to the same `pk_test_...` value. Without either key, the frontend runs in degraded mode (no auth). The `CLERK_SECRET_KEY` env var is needed for API functions.

### Shared Packages

Before running `type-check` or if you see TS6305 errors referencing shared packages, rebuild them:
```bash
cd packages/shared-types && npx tsc --build && cd ../shared-utils && npx tsc --build
```

### Lint / Test / Build Commands

Standard commands documented in `README.md`. Quick reference:
- **Lint**: `npm run lint` (all), `npm run lint:frontend`, `npm run lint:backend`
- **Test**: `npm run test:frontend -- --run` (vitest, 418 tests), `npm run test:backend` (jest, 108 tests)
- **Type-check**: `npm run type-check:frontend`
- **Build**: `npm run build:frontend`
- **Dev**: `npm run dev` (frontend + API), `npm run dev:frontend` (frontend only)

### Environment Variables

Frontend env file: `apps/frontend/.env.local`. See `apps/frontend/.env.example` for full list. Most features work without external service credentials. Required for API features: `CLERK_SECRET_KEY`, `MONGODB_URI`.

### Vercel Dev Server (API Functions)

`npm run dev:vercel` requires Vercel CLI authentication. The `--token` flag must be passed explicitly (the `VERCEL_TOKEN` env var alone is not enough). Run `vercel link --yes --token $VERCEL_TOKEN --scope tcd-ynamics` first, then start the server.

**Known issue in Cloud VM:** The `vercel dev` initial build hangs during `npm install` inside the `@vercel/static-build` builder worker. Workaround: use a minimal `vercel.json` with explicit `builds` config (API functions only) during dev. The frontend runs separately via Vite (see `vite.config.ts` for the local URL/port).

To verify MongoDB connectivity independently: `cd api && node --input-type=module -e "import{MongoClient}from'mongodb';const c=new MongoClient(process.env.MONGODB_URI);await c.connect();console.log('OK');await c.close()"`

### Gotchas

- The `rollup-plugin-visualizer` devDep requires Node 22; safe to ignore the EBADENGINE warning on Node 20 — it only runs during `vite build --mode analyze`.
- Frontend lint has `--max-warnings 150` threshold; currently ~5 warnings (Tailwind class order + React hooks).
- The `vercel` CLI (`npm run dev:vercel`) auto-creates `.vercel/` config on first run with `--yes` flag.
- `npm run dev` sets `NODE_OPTIONS="--max-http-header-size=65536"` to accommodate large Clerk auth tokens; if you get 431 errors, ensure you use `npm run dev` not just `npm run dev:frontend`.
- When adding secrets in Cursor Cloud, enter ONLY the value (e.g. `pk_test_abc123...`), not `KEY=VALUE` format. Clerk publishable keys must start with `pk_test_` or `pk_live_`.
- Do NOT install `yarn` globally — the Vercel CLI misdetects it as the package manager and causes `packageManager` field conflicts. This project uses npm only.

## Learned User Preferences

- When the user names a specific OpenRouter model slug or route for in-app AI, use that exact value (for example `openrouter/free`) instead of a different OpenRouter default.
- For authenticated `/app` and related product UI, large layout or design revamps are acceptable when moving toward coherent, industry-standard patterns.
- Requests phrased like “start the local host” mean run the documented dev command and report the live local URL, including when the default Vite port is unavailable on the host OS.

## Learned Workspace Facts

- On Windows, `netsh interface ipv4 show excludedportrange protocol=tcp` often lists ranges that include **2991–3090**; binding Vite to **3000** can fail with `EACCES`, so this repo often uses another dev port (for example **3100**) in `apps/frontend/vite.config.ts`, with `/api` proxied to the local Vercel dev port configured there (currently **3201** with root `npm run dev`).
- Server-side chat goes through OpenRouter (`api/ai.js`); without `OPENROUTER_API_KEY` the API responds as IA not configured and the chat UI shows an error. Integration notes live under `docs/integrations/` (including model routes such as `openrouter/free` where relevant).
