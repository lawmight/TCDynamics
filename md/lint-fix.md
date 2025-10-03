# Lint & Format – How to Fix Issues Fast

This project uses ESLint + Prettier for TypeScript/React with strict rules and Husky/lint-staged on commits.

## Quick commands

```bash
# Frontend (root)
npm run lint           # report issues
npm run lint:fix       # auto-fix
npm run format         # prettier write
npm run format:check   # prettier check only
npm run type-check     # TS types
```

If you are working only in `backend/`, linting is not configured there (plain JS). Prefer running Node with `nodemon` for quick dev:

```bash
cd backend
npm run dev
```

## ESLint config highlights

- Files: `**/*.{ts,tsx}`
- Extends: `@eslint/js` + `typescript-eslint`
- Plugins: `react-hooks`, `react-refresh`, `prettier`
- Notable rules:
  - `prettier/prettier: error` (formatting errors will fail lint)
  - `@typescript-eslint/no-unused-vars: error`
  - `no-console: warn` (CI build strips console in prod via Vite/Terser)

See `eslint.config.js` for full rules.

## Fixing common issues

- Unused variables: remove or prefix with `_`.
- Any types: prefer specific types; `any` is `warn` (not blocking).
- Console in prod: logs are dropped during `vite build` (see `vite.config.ts`), but prefer `logger` utils where possible.
- React hooks: follow the rules of hooks; add missing deps to effect arrays.

## Pre-commit hooks

Husky + lint-staged auto-fixes staged files:

- `*.{ts,tsx}`: `eslint --fix` then `prettier --write`
- `*.{json,md,css}`: `prettier --write`

If a commit fails, run:

```bash
npm run lint:fix && npm run format
```

## Recommended local workflow

```bash
# while coding
npm run type-check
npm run lint

# before commit
npm run lint:fix && npm run format

# prior to PR
npm run test:coverage
```

Tip: Use your editor’s ESLint/Prettier integration to auto-fix on save.
