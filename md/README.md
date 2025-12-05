# TCDynamics WorkFlowAI

Hybrid system: Vercel serverless API + React frontend + Azure Functions (Python) for AI/vision. Express backend exists for local dev only.

## Authoritative Status
See `md/docs/PROJECT_MASTER.md` for the single source of truth (status, architecture, roadmap).

## Project Layout (current)
- `apps/frontend` — React 18 + Vite; deployed on Vercel (includes `/api` serverless routes copied from root `api/` during CI).
- `api` — Vercel serverless functions (contact, demo, chat, vision, stripe, health).
- `apps/functions` — Azure Functions (Python 3.11) for AI chat and vision; `function_app.py` is the active entrypoint.
- `apps/backend` — Express server for local development/testing (not deployed to production).
- `tests/e2e` — Playwright e2e.
- `docker/` — local docker-compose + nginx config.
- `md/` — project docs and guides.

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

## Deployment (current)
- Frontend + serverless API: Vercel.
- AI/vision: Azure Functions (`apps/functions/function_app.py`).
- Express backend: local/dev only.

## Docs Pointers
- Master status: `md/docs/PROJECT_MASTER.md`
- E2E docs: `md/tests/e2e/README.md`
- Implementation tasks: `md/implementation-tasks.md`
- File upload API: `md/docs/API_FILES_UPLOAD.md`
