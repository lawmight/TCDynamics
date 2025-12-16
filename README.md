# TCDynamics WorkFlowAI

AI-powered automation platform for French SMEs.

Hybrid system: Vercel serverless API + React frontend + Azure Functions (Python) for AI/vision. Express backend exists for local dev only.

## Project Structure

- `apps/frontend` — React 18 + Vite; deployed on Vercel (includes `/api` serverless routes copied from root `api/` during CI)
- `api` — Vercel serverless functions (contact, demo, chat, vision, stripe, health)
- `apps/functions` — Azure Functions (Python 3.11) for AI chat and vision; `function_app.py` is the active entrypoint
- `apps/backend` — Express server for local development/testing (not deployed to production)
- `tests/e2e` — Playwright e2e tests
- `docker/` — local docker-compose + nginx config

## Quick Start

```bash
npm install           # installs root + workspaces
npm run dev           # runs frontend + backend (local)
# or per app
npm run dev:frontend
npm run dev:backend   # local Express only
npm run dev:functions # Azure Functions local host
```

## Testing & Linting

```bash
npm run test          # frontend + backend + functions
npm run lint          # frontend + backend
npm run type-check
```

## Deployment

- **Frontend + serverless API**: Vercel
- **AI/vision**: Azure Functions (`apps/functions/function_app.py`)
- **Express backend**: local/dev only

### Vercel Deployment

For production deployment to Vercel:

```bash
npm run deploy:vercel
```

This script will:

1. Copy the `api` directory to `apps/frontend/api` (required for Vercel serverless functions)
2. Install API dependencies
3. Deploy to Vercel production from the `apps/frontend` directory

**Note**: Automatic deployments are configured via GitHub Actions on pushes to the `main` branch. Use the script above for manual deployments.

## Logging & Privacy

### PII Protection

Serverless API functions hash sensitive identifiers (orgId, userId) before logging using SHA-256.

- Identifiers are hashed with optional salt from `PII_HASH_SALT` or `IP_HASH_SALT` environment variables
- Error objects are sanitized to log only message and stack (dev only)
- See `apps/frontend/api/stripe/create-checkout-session.js` for implementation

### Log Retention & Access Control

- **Retention**: Logs retained per Vercel's default retention policy (typically 30 days for Hobby, 90 days for Pro/Enterprise)
- **Access Control**: Logs accessible only to authorized operations team members via Vercel dashboard
- **Storage**: Logs stored in Vercel Logs with encryption at rest
- **Audit**: All log access is tracked through Vercel's audit logs

## Documentation

Detailed project documentation, architecture diagrams, and implementation guides are maintained locally in the `md/` directory (excluded from this repository).
