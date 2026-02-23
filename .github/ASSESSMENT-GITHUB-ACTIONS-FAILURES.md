# Assessment: Why GitHub Actions Are Failing

Assessment report from the plan in `assess_github_actions_failures_4b6050b2.plan.md`. Fixes were applied as below.

---

## Fixes applied (2026-02-23)

| Area | Change |
|------|--------|
| **Quality Gate (Lint)** | (1) Frontend cache in `.github/actions/install-dependencies/action.yml` uses no `restore-keys`—only exact key match, so Dependabot frontend-deps PRs get a full `npm ci` and correct `node_modules`. (2) Lint step in `.github/workflows/quality-gate.yml` runs `./node_modules/.bin/eslint . --ext ts,tsx ...` so ESLint is invoked explicitly and not via PATH. |
| **Bump dev deps** | Added no-op `"lint": "echo 'No lint for shared-types'"` and `"lint": "echo 'No lint for shared-utils'"` to `packages/shared-types/package.json` and `packages/shared-utils/package.json` so `npm run lint -ws` no longer fails with "Missing script: lint". |
| **Dependabot backend** | Removed the separate backend entry (`directory: '/apps/backend'`) from `.github/dependabot.yml`. Root npm entry (`directory: '/'`) now covers the whole monorepo; backend deps are resolved from root and workspace layout, avoiding `dependency_file_not_resolvable` and peer errors. |
| **Deploy MVP** | No change. Failures were caused by Quality Gate failing; fixing Quality Gate unblocks Deploy MVP. |

---

## 1. Quality Gate – Lint step failures

### Error modes

- **A:** `sh: 1: eslint: not found` (exit 127) — e.g. runs 22297948538, 22297090962.
- **B:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js'` when loading `eslint.config.js` — e.g. run 22295424677 (frontend-deps PR).

### Repo state verified

- **Lint step:** `quality-gate.yml` runs `npm run lint` with `working-directory: ./apps/frontend` (lines 99–103). Same job as Install; no separate job.
- **Install:** Quality Gate calls `install-dependencies` with `skip-root: true` and does **not** set `skip-frontend`. So “Install frontend dependencies” always runs: `npm ci` in `./apps/frontend`. `apps/frontend/node_modules` is populated in the same job before Lint.
- **Frontend lint script:** `"lint": "npx eslint . --ext ts,tsx ..."` — so the intended command is `npx eslint`, not bare `eslint`.
- **Frontend deps:** `eslint` and `@eslint/js` are in `devDependencies`. `eslint.config.js` (line 1) does `import js from '@eslint/js'` (ESM); resolution must be from `apps/frontend` so `@eslint/js` is found in `apps/frontend/node_modules`.

### Disambiguation (A vs B)

- **Error A (`eslint: not found`):** Indicates something is invoking `eslint` without a path (e.g. not via `npx eslint`). With `working-directory: ./apps/frontend`, `npm run lint` should run `npx eslint`, which should resolve from `./node_modules/.bin`. So A suggests either (1) the Lint step is not actually running in `apps/frontend`, or (2) `apps/frontend/node_modules` is missing/incomplete so `npx` cannot resolve `eslint`, or (3) another script/tool calls `eslint` directly (e.g. a different step or a wrapper). Without the exact failing log line, the most likely is (2): frontend `node_modules` missing or incomplete when the Lint step runs.
- **Error B (`Cannot find package '@eslint/js'`):** Consistent with Node loading `eslint.config.js` from `apps/frontend` but resolving `@eslint/js` from a context where `apps/frontend/node_modules` is not used (e.g. wrong cwd, or ESM resolution from repo root). So B points to install/cache or ESM resolution: either `@eslint/js` is not in `apps/frontend/node_modules`, or the config is loaded from a different directory.

### Install and PATH

- With `skip-root: true`, `skip-frontend` is still false, so frontend install always runs. Lint runs in the same job after Install, with `working-directory: ./apps/frontend`, so in principle `npx` should see `./node_modules/.bin` and ESLint should load the config from `apps/frontend` and resolve `@eslint/js` from `apps/frontend/node_modules`. So **if** install completes correctly and the step really runs in `apps/frontend`, both A and B are unexpected unless install or cache is wrong.

### Cache and dependency resolution

- **Frontend cache:** `install-dependencies` caches `apps/frontend/node_modules` with key `${{ runner.os }}-node-frontend-${{ hashFiles('apps/frontend/package-lock.json') }}` and `restore-keys: ${{ runner.os }}-node-frontend-`.
- On **dependabot frontend-deps PRs**, `apps/frontend/package-lock.json` changes, so the primary key misses; restore-keys can restore a cache from an older lockfile. Then `npm ci` runs and should replace `node_modules` with the current lockfile. So a wrong or partial `node_modules` could happen if: (1) cache restore leaves a bad state and `npm ci` doesn’t run or fails, or (2) `npm ci` is run from the wrong directory, or (3) a race/flake leaves `node_modules` incomplete.
- **Run pattern:** Many Quality Gate failures are on **dependabot frontend-dependencies** PRs (e.g. 22295424677, 22297090962, 22297948538). Passing runs on similar PRs exist (e.g. 21701157491, 21854073877). So the failure is intermittent and correlates with frontend-deps PRs; cache/restore or install reliability on those PRs is a plausible cause.

### ESLint flat config and ESM

- Quality Gate uses Node 20 and the same runner for install and lint. `eslint.config.js` is ESM and imports `@eslint/js`; Node resolves from the config file location. If the config is loaded from `apps/frontend`, resolution should use `apps/frontend/node_modules`. So ESM resolution alone doesn’t explain B unless the config is loaded from elsewhere or `node_modules` is missing.

### Deliverable (Quality Gate)

- **Runs:** Error A (`eslint: not found`) appears in runs such as 22297948538, 22297090962; error B (`@eslint/js` not found) in 22295424677. Both occur on frontend-deps or frontend-touching runs.
- **Install and PATH:** Config is correct: frontend install runs (skip-root only, not skip-frontend), same job as Lint, and Lint uses `working-directory: ./apps/frontend`. So install and PATH are correct in design; failures suggest install didn’t produce a valid `apps/frontend/node_modules` in those runs, or the step context (cwd) was wrong.
- **Cause:** Most likely **cache restore + install**: on frontend-deps PRs, restore-keys can restore an old frontend cache; if `npm ci` doesn’t run or doesn’t fully overwrite `node_modules`, or if there’s a flake, `eslint` or `@eslint/js` can be missing and produce A or B. ESM resolution is secondary: it fails once the package isn’t present.
- **Fix directions:** (1) Ensure frontend install always runs and completes before Lint (no conditional skip). (2) Consider not using restore-keys for frontend (or invalidating frontend cache when lockfile changes) so a stale cache never replaces a full install. (3) Optionally run `npx eslint` with an explicit path to the frontend binary so the command is robust to PATH issues.

---

## 2. Bump dev dependencies – Verify step (lint -ws)

### Observed error

- `npm run lint -ws` fails with “Missing script: lint” for `@tcd/shared-types` and `@tcd/shared-utils`.

### Repo state verified

- **Workflow:** `bump-dev-deps.yml` line 59 runs `npm run lint -ws` at repo root after `npm ci`.
- **Root:** `package.json` has `"lint": "npm run lint -ws"`, so root lint delegates to all workspaces.
- **Workspaces:** `package.json` has `"workspaces": ["apps/*","api","packages/*"]`, so `packages/shared-types` and `packages/shared-utils` are workspaces.
- **Scripts:**  
  - **Have `lint`:** root (delegates), `apps/frontend`, `apps/backend`, `api` (echo no-op).  
  - **No `lint`:** `packages/shared-types`, `packages/shared-utils` (only `build`, `dev`, `check-types`).

### Deliverable (Bump dev)

- The failure is due to **`npm run lint -ws` requiring a `lint` script in every workspace**. npm tries to run `lint` in each workspace; `@tcd/shared-types` and `@tcd/shared-utils` do not define `lint`, so npm reports “Missing script: lint” for those packages. No other workspaces are missing `lint` (api has a no-op lint). Fix: add a no-op or real `lint` script to `packages/shared-types` and `packages/shared-utils`, or change the workflow to run lint only in workspaces that define it (e.g. `npm run lint -w apps/frontend -w apps/backend -w api` or a script that filters workspaces).

---

## 3. Dependabot – Backend (`/apps/backend`)

### Observed error

- “Dependabot encountered an error performing the update” — `dependency_file_not_resolvable` / “Error while updating peer dependency” for 8 deps: cors, dotenv, isomorphic-dompurify, nodemailer, pg, @playwright/test, @types/node, nodemon.

### Lockfile layout

- **Repo:** Root `package-lock.json`; **apps/backend/package-lock.json** and **apps/frontend/package-lock.json** also exist. No `api/package-lock.json` in the repo. So the repo uses a **mixed layout**: root lockfile plus per-app lockfiles for frontend and backend.
- **Dependabot:** Backend config uses `directory: '/apps/backend'`. Dependabot will look for dependency files (and typically a lockfile) under that directory. Backend has its own `package-lock.json`, so the layout is compatible with a per-directory Dependabot entry.

### Backend dependencies (8 named)

- In **apps/backend/package.json**:  
  - **dependencies:** cors, dotenv, isomorphic-dompurify, nodemailer, pg (and others).  
  - **devDependencies:** @playwright/test, @types/node, nodemon (and others).  
- None of these are declared as `peerDependencies` or `optionalDependencies` in backend’s package.json; they are normal or dev dependencies. The “Error while updating peer dependency” message is likely from Dependabot’s resolution (e.g. a transitive peer) or from npm’s resolution when Dependabot runs in isolation under `/apps/backend`.

### Monorepo and Dependabot

- With `directory: '/apps/backend'`, Dependabot treats that directory as the project root. In a monorepo, backend depends on workspace packages (`@tcd/shared-types`, `@tcd/shared-utils`). Those are resolved from the root workspace when you run `npm install` at root; under `/apps/backend` only, workspace symlinks and root lockfile are not in scope, so resolution can differ and peer/transitive resolution can fail, producing `dependency_file_not_resolvable` or peer update errors. So the failure is consistent with **Dependabot resolving only within `/apps/backend`** while the real install is done at repo root with workspaces.

### Deliverable (Dependabot backend)

- **Lockfile:** Root plus `apps/backend` and `apps/frontend` each have their own `package-lock.json`. Backend has a lockfile in its directory.
- **Peer/optional:** The 8 deps are regular or dev dependencies in backend; the “peer dependency” error is likely from transitive/peer resolution when Dependabot runs in `/apps/backend` only.
- **Conclusion:** **Dependabot’s backend config is likely incompatible with the monorepo/workspace setup**: targeting `directory: '/apps/backend'` forces resolution in isolation, so workspace deps and possibly root-level constraints are missing, leading to `dependency_file_not_resolvable` and “Error while updating peer dependency”. Recommended approach: either (1) point backend updates at repo root and use a single lockfile, or (2) use a Dependabot/monorepo pattern that runs from root and restricts updates to backend files, so resolution matches local `npm install`.

---

## 4. Deploy MVP to Vercel

### Repo state verified

- **deploy-mvp.yml:** The `deploy` job has `needs: quality-gate` (line 71). It runs only when `needs.quality-gate.result == 'success' || needs.quality-gate.result == 'skipped'` (and similar for workflow_dispatch cases) (lines 74–84).

### Causality from run list

- Failed Deploy MVP runs in the table: 21682814191, 22188138319, 22225519397, 22226040709, 22236063959.
- Same timestamps or same push:  
  - 22188138319 (Deploy failure) and 22188138307 (Quality Gate failure) — same push “chore: ship deployment at 2026-02-19 16:27:34”.  
  - 22225519397 (Deploy failure) and 22225514449 (Quality Gate failure) — same merge.  
  - 22226040709 (Deploy failure) and 22226040723 (Quality Gate failure) — same “chore: ship deployment”.  
  - 22236063959 (Deploy failure) and 22236063969 (Quality Gate failure) — same “fix: API audit …” push.
- So whenever Deploy failed, the corresponding Quality Gate run for that ref also failed. There is no run where Deploy failed and Quality Gate succeeded.

### Deliverable (Deploy MVP)

- **Deploy MVP failures are caused by Quality Gate failing.** No separate deploy-step failure (e.g. Vercel API, build, or copy) was identified; the deploy job is skipped or not run when Quality Gate fails.

---

## 5. Summary and ordering

| Area | Root cause | Fix direction |
|------|------------|---------------|
| **Quality Gate (Lint)** | (A) `eslint` not on PATH or not installed in frontend; (B) `@eslint/js` not resolvable from `apps/frontend`. Both consistent with frontend `node_modules` missing or wrong, likely due to cache restore + install on frontend-deps PRs. | Ensure frontend install always completes; tighten or drop frontend cache restore-keys; optionally use explicit eslint path. |
| **Bump dev deps** | `npm run lint -ws` requires a `lint` script in every workspace; `@tcd/shared-types` and `@tcd/shared-utils` do not define `lint`. | Add `lint` (no-op or real) to those packages, or run lint only in workspaces that define it. |
| **Dependabot backend** | Config targets `directory: '/apps/backend'`; resolution in isolation conflicts with monorepo/workspaces and leads to `dependency_file_not_resolvable` and peer update errors. | Run backend updates from root or use a monorepo-aware Dependabot pattern. |
| **Deploy MVP** | Consequence of Quality Gate failure; deploy job not run or skipped when Quality Gate fails. | Fix Quality Gate; no separate deploy fix needed unless a deploy-specific error appears later. |

**Suggested order of work:** (1) Quality Gate (unblocks Deploy MVP), (2) Bump dev deps (add lint script or narrow lint -ws), (3) Dependabot backend (config/lockfile), (4) Deploy MVP (confirm only; no change if QG is fixed).
