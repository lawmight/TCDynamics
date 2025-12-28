# AGENTS.md - TCDynamics Project Guide

## Build/Test/Lint Commands

```bash
# Run tests
npm run test                # Frontend + backend
npm run test:frontend       # Frontend only (vitest)
npm run test:backend        # Backend only (jest)
npm run test:watch          # Watch mode (backend)
npm run test:coverage       # Coverage reports

# Linting & formatting
npm run lint                # ESLint for all
npm run lint:fix            # Fix linting errors
npm run format              # Prettier format
npm run type-check          # TypeScript check

# Development & building
npm run dev                 # Frontend + Express backend
npm run build               # Build all apps
npm run clean               # Clean dist + node_modules
```

## Architecture & Codebase Structure

**Monorepo**: Workspace at root with `apps/frontend`, `apps/backend`, `api/` (Vercel serverless functions)

- **Frontend** (`apps/frontend`): React 18 + Vite + Tailwind CSS, deployed on Vercel
- **Backend** (`apps/backend`): Express server (local dev only), not deployed to production
- **API** (`api/`): Vercel serverless functions (contact, demo, chat, vision, stripe, health)
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe integration (via serverless functions)
- **Archived**: `apps/functions-archive/` contains old Azure Functions (Python) — see archive README

## Code Style Guidelines

**TypeScript First**: Use TS for frontend/backend; Python archived in functions-archive

**Imports**: ESLint enforces `import/order` — organize by: externals → internals → relative → side-effects

**Formatting**: Prettier (no semicolons, single quotes, 2-space tabs, 80 char line width, trailing commas)

**Naming**: Use camelCase for variables/functions, PascalCase for components/classes, UPPER_SNAKE_CASE for constants

**Error Handling**: Use Zod for validation (frontend), Joi (backend). Hash PII (orgId, userId) with SHA-256 before logging

**Exports**: Use ESM (`type: "module"`); prefer named exports for functions/components

**Components**: Functional React with hooks; use Radix UI primitives with Tailwind CSS

**No console in prod**: ESLint warns on `console.*` (debug in development only)

**Cursor Rules** (`.cursorrules`): Exclude `node_modules/`, `.venv/`, focus on source/configs/docs
