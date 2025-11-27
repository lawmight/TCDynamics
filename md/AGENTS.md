# TCDynamics Agents Guide

## Commands

**Single test:**
- Frontend: `npm run test:frontend -- <test-file-path>` (or `cd apps/frontend && npm test <file>`)
- Backend: `npm run test:backend -- <test-file-path>` (or `cd apps/backend && npm test <file>`)

**Build/Lint/Test:**
- `npm run build` - Build frontend & backend
- `npm run test` - Run all tests (frontend, backend, functions)
- `npm run lint` - Run ESLint on frontend & backend
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript validation

## Architecture

**Workspace:** Monorepo with npm workspaces in `apps/` (frontend, backend, functions)
- **Frontend** (`apps/frontend/`): React 18 + TypeScript + Vite + Playwright e2e tests
- **Backend** (`apps/backend/`): Express.js + TypeScript + Jest
- **Functions** (`apps/functions/`): Python Azure Functions
- **API** (`api/`): Vercel serverless functions (Stripe, contact forms, etc.)
- **Database:** Supabase PostgreSQL (schema in `supabase-schema-enhanced.sql`)
- **Key APIs:** Stripe, Supabase, Resend (email), Azure Functions

## Code Style

**TypeScript:** Strict mode enabled (`noImplicitAny`, `strictNullChecks`)
- Import alias: `@/*` → `src/*`
- No `any` types; use `@typescript-eslint/no-explicit-any: warn`
- Frontend: React components export only (eslint-plugin-react-refresh)

**Formatting:** Prettier (2 spaces, single quotes, 80 char line, no semicolons)

**ESLint:** Enforces `const`/`no-var`, `prefer-template`, `object-shorthand`, `prefer-arrow-callback`, no unused vars/imports

**Error Handling:** Use Winston (backend) or Sonner (frontend) toast notifications; avoid `console.log` (warn)

**Naming:** camelCase for vars/functions, PascalCase for React components, UPPERCASE for constants
