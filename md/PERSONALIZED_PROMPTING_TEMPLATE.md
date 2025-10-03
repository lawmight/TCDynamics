# Personalized Agent Prompting Template for TCDynamics

Use this template when running a background agent in Cursor/Composer. Replace bracketed fields.

## Agent Context

- Project: TCDynamics mono-repo (frontend React/Vite + backend Express)
- Frontend tests: Vitest + Testing Library (happy-dom), setup at `src/test/setup.ts`
- Backend: Node/Express (`backend/src/server.js`), scripts: `npm --workspace backend start`
- Code style: TypeScript for frontend, JS for backend. Follow existing patterns.

## Objective

- [What should the agent deliver? One clear outcome.]

## Environment & Tools

- Tools available: terminal, git, vitest, eslint, prettier
- Self-run allowed: yes (agent may run tests/lint)
- Constraints: Do not change git config; avoid long-lived processes

## Inputs & Initial State

- Branch: [name]
- Entry points likely involved: [files]
- Edge cases to consider: [list]

## Step-by-step Plan

1. Create/Update tests first (TDD where possible)
2. Implement minimal code to satisfy tests
3. Run: `npm run test -- --run` and ensure green
4. Run: `npm run lint` and `npm run type-check`
5. If UI changes, validate via story-like render tests

## Verification Checklist

- Unit tests pass (Vitest)
- Lint passes; no new warnings introduced
- Type-check passes
- No secrets added; env-sensitive values use placeholders

## Output Format

- Provide: changed files, reasoning for non-trivial decisions, and follow-up TODOs.

## Example Task

- Add utility `add(a,b)` in `src/lib/utils.ts`, with tests in `src/lib/__tests__/add.test.ts`. Run tests until green.
