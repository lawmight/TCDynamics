# Personalized Prompt Templates for TCDynamics

## Quick exercise (with tool access)

You can run commands and tests. Use this prompt:

"Implement `add(a, b)` in `src/utils/math.ts`, create `src/utils/__tests__/math.test.ts` with cases for positive, negative, zero, and floats, and run `npm run verify:exercise`. Fix issues until tests pass. Keep code idiomatic TypeScript and match project paths alias `@/*`."

## Quick exercise (without tool access)

You cannot run commands. Use this prompt:

"Provide `src/utils/math.ts` with an `add(a, b)` implementation and `src/utils/__tests__/math.test.ts` using Vitest. I will run `npm run verify:exercise` and paste results back. Iterate until it passes."

## Context to include for agents

- Test runner: Vitest (`happy-dom`), setup file: `src/test/setup.ts`
- TS paths alias: `@/*`
- Scripts: `verify:exercise` runs lint (target files), type-check, and the targeted test
- Use `vitest --run` to avoid watch mode

## Self-verification checklist

- Run: `npm run verify:exercise`
- Ensure ESLint passes for touched files
- Ensure TS `--noEmit` passes
- Ensure `src/utils/__tests__/math.test.ts` passes

## Model selection

- Fast model for coding loop; slow model in background for larger refactors with a clear plan and acceptance criteria. Provide autonomy, clear validation, and expected artifacts.

## Background agent pattern

- Give: objective, environment (scripts, tools), verification steps, and allowed changes
- Let it execute end-to-end and report a concise summary with failing contexts if any

## Parallel agents guidance

- Max 1–3 agents, each with non-overlapping tasks
- Example split: UI polish, API typing, test stabilization
