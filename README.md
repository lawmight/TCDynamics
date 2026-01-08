# TCDynamics WorkFlowAI

AI-powered automation platform for French SMEs.

Hybrid system: Vercel serverless API + React frontend. Express backend exists for local dev only.

## Project Structure

- `apps/frontend` — React 18 + Vite; deployed on Vercel (includes `/api` serverless routes copied from root `api/` during CI)
- `api` — Vercel serverless functions (contact, demo, chat, vision, polar, health)
- `apps/backend` — Express server for local development/testing (not deployed to production)
- `apps/functions-archive/` — Archived Azure Functions (Python) code (see archive README for details)
- `tests/e2e` — Playwright e2e tests
- `docker/` — local docker-compose + nginx config

## Quick Start

```bash
npm install           # installs root + workspaces
npm run dev           # runs frontend + backend (local)
# or per app
npm run dev:frontend
npm run dev:backend   # local Express only
```

## Testing & Linting

```bash
npm run test          # frontend + backend
npm run lint          # frontend + backend
npm run type-check
```

## Deployment

- **Frontend + serverless API**: Vercel
- **Express backend**: local/dev only

**Note**: Azure Functions have been archived to `apps/functions-archive/`. See the archive README for restoration instructions if needed.

**Important**: The archived Azure Functions use `azure-ai-vision-imageanalysis` which depends on Azure Computer Vision - Image Analysis API. This API will be retired on September 25, 2028, with migration recommended by September 2026. See `docs/azure-vision-migration.md` for migration tracking and planning.

### Vercel Deployment

**Configuration**: Vercel deployment uses a single root-level `vercel.json` configuration file (located at the project root). This is the canonical source for all Vercel settings including:

- Build commands and output directories (configured for monorepo structure)
- Security headers (including `Cross-Origin-Embedder-Policy: credentialless`; see `docs/coep-header-fix.md` for rationale)
- Rewrites, redirects, and caching rules
- Environment variables

**Rationale**: Using a single root config prevents configuration drift, ensures consistency across deployments, and aligns with Vercel's best practices for monorepo deployments. The previous `apps/frontend/vercel.json` has been renamed to `vercel.json.backup` for reference.

For production deployment to Vercel, you have two options:

**Option 1: Frontend + API (Full Deployment)**

```bash
npm run deploy:vercel
```

This script deploys both the frontend and API serverless functions. Note: Vercel Hobby plan has a limit of 12 serverless functions.

**Option 2: Frontend Only (Static Build)**

```bash
npm run deploy:vercel:frontend
```

This script deploys only the frontend static build without serverless functions. Use this if you're hitting the 12 function limit or if your APIs are hosted elsewhere.

**Note**: Automatic deployments are configured via GitHub Actions on pushes to the `main` branch. Use the scripts above for manual deployments.

## Logging & Privacy

### PII Protection

Serverless API functions hash sensitive identifiers (orgId, userId) before logging using SHA-256.

- Identifiers are hashed with optional salt from `PII_HASH_SALT` or `IP_HASH_SALT` environment variables
- Error objects are sanitized to log only message and stack (dev only)
- See `api/polar/create-checkout-session.js` for implementation

### Log Retention & Access Control

- **Retention**: Logs retained per Vercel's default retention policy (typically 30 days for Hobby, 90 days for Pro/Enterprise)
- **Access Control**: Logs accessible only to authorized operations team members via Vercel dashboard
- **Storage**: Logs stored in Vercel Logs with encryption at rest
- **Audit**: All log access is tracked through Vercel's audit logs

## Documentation

Detailed project documentation, architecture diagrams, and implementation guides are maintained locally in the `md/` directory (excluded from this repository).
