# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

AI-powered automation platform for French SMEs. Monorepo with npm workspaces + Turborepo:

- `apps/frontend` — React 18 + Vite (port 3000)
- `api/` — Vercel serverless functions (port 3001 via `vercel dev`)
- `apps/backend` — Express server (optional, local dev only, port 8080)
- `packages/shared-types`, `packages/shared-utils` — shared TS packages (must be built before type-checking)

### Node Version

Requires **Node 20.x** (`engines.node: "20.x"` in root `package.json`). Use `nvm use 20` before all commands. The VM default is set to Node 20 via nvm.

### Running the Dev Server

See `README.md` Quick Start section. Key command: `npm run dev` runs both frontend (Vite, port 3000) and Vercel dev server (API, port 3001) concurrently. The Vite dev server proxies `/api` requests to port 3001.

### Clerk Authentication

The app uses Clerk for auth. Without `VITE_CLERK_PUBLISHABLE_KEY`, the frontend runs in a degraded mode (no auth features). The code in `App.tsx` and `useAuth.tsx` handles this gracefully in development mode. To test auth features, set `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` env vars.

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

`npm run dev:vercel` requires Vercel CLI authentication. Set `VERCEL_TOKEN` as a secret/env var, or run `vercel login` interactively. Without it, the API functions on port 3001 won't start. The frontend still runs standalone on port 3000 — API proxy calls to `/api` will fail gracefully.

To verify MongoDB connectivity independently: `cd api && node --input-type=module -e "import{MongoClient}from'mongodb';const c=new MongoClient(process.env.MONGODB_URI);await c.connect();console.log('OK');await c.close()"`

### Gotchas

- The `rollup-plugin-visualizer` devDep requires Node 22; safe to ignore the EBADENGINE warning on Node 20 — it only runs during `vite build --mode analyze`.
- Frontend lint has `--max-warnings 150` threshold; currently ~5 warnings (Tailwind class order + React hooks).
- The `vercel` CLI (`npm run dev:vercel`) auto-creates `.vercel/` config on first run with `--yes` flag.
- `npm run dev` sets `NODE_OPTIONS="--max-http-header-size=65536"` to accommodate large Clerk auth tokens; if you get 431 errors, ensure you use `npm run dev` not just `npm run dev:frontend`.
