# CLI Tools Used in TCDynamics Project

**Generated**: 2026-02-01  
**Purpose**: Single source of truth for all CLI tools referenced by scripts, docs, and tooling.

---

## 1. Essential (required by scripts)

| CLI | Where used | Install |
|-----|------------|--------|
| **git** | `ship.ps1`, pre-push, husky hooks | System / [git-scm.com](https://git-scm.com/) |
| **vercel** | `dev:vercel`, `deploy-vercel.ps1`, `deploy-vercel-preview.ps1`, `deploy-vercel-frontend-only.ps1`, `scripts/mongosh.sh`, `scripts/verify-cli-connections.sh` | `npm i -g vercel` or add to root `devDependencies` |
| **gh** (GitHub CLI) | `scripts/github-actions.ps1` (list/trigger/status/watch workflows) | [cli.github.com](https://cli.github.com/) |
| **npm** / **npx** | All `package.json` scripts, lint, build, test | Bundled with Node.js |
| **node** | `pre-push-checks.js`, `fix-current.js`, `test-this.js`, tools | Bundled with Node.js |
| **PowerShell** | `ship.ps1`, `deploy-vercel*.ps1`, `github-actions.ps1` | Windows built-in |

---

## 2. Used via npm (no global install needed)

| Tool | Where used | Package |
|------|------------|---------|
| **eslint** | `lint`, `lint:fix`, lint-staged | `apps/frontend` devDependencies |
| **prettier** | `format`, format:check, lint-staged | workspace devDependencies |
| **vitest** | `test`, `test:ui`, `test:coverage` | `apps/frontend` devDependencies |
| **playwright** | `test:e2e` | `apps/frontend` devDependencies |
| **vite** | `dev`, `build` (frontend) | `apps/frontend` devDependencies |
| **concurrently** | `dev`, `dev:all` | root devDependencies |
| **cross-env** | `dev:vercel`, frontend dev | root / frontend devDependencies |
| **rimraf** | `clean`, `clean:frontend`, `clean:backend` | root devDependencies |
| **husky** | Git hooks (prepare) | `apps/frontend` devDependencies |
| **commitlint** | Commit message lint (husky hook) | `apps/frontend` devDependencies |
| **typescript** (tsc) | `type-check` | workspace devDependencies |

---

## 3. Optional (documented or in verify script)

| CLI | Where referenced | Purpose |
|-----|------------------|---------|
| **mongosh** | `scripts/mongosh.sh`, `scripts/verify-cli-connections.sh` | MongoDB Atlas shell |
| **jq** | `docs/cli-tools.md`, `verify-cli-connections.sh` | JSON parsing |
| **http** (HTTPie) | `docs/cli-tools.md`, `verify-cli-connections.sh` | API testing |
| **bat** | `docs/cli-tools.md`, `verify-cli-connections.sh` | Syntax-highlighted cat |
| **fd** | `docs/cli-tools.md`, `verify-cli-connections.sh` | Fast find |
| **rg** (ripgrep) | `docs/cli-tools.md`, `verify-cli-connections.sh` | Fast grep |

---

## 4. Optional (recommended, see docs/cli-tools.md)

| CLI | Purpose | Install (Windows) |
|-----|---------|------------------|
| **fnm** / **nvm** | Node version switching (match CI Node 20/22) | winget: Schniz.fnm |
| **direnv** | Auto-load `.env` per directory | winget: direnv.direnv |
| **tldr** | Short man-page examples | winget: dbrgn.tealdeer |
| **zoxide** | Smarter `cd` (jump by name) | winget: ajeetdsouza.zoxide |
| **eza** | Modern `ls` with git status (exa successor) | winget: eza-community.eza |
| **Sentry CLI** | Source maps, releases | `npm i -g @sentry/cli` |

---

## 5. Consider adding to ease use (NIA-backed)

Research (indexed monorepo + Vercel/Turborepo docs) suggests these CLIs to add for a React + Vite + Vercel monorepo:

| CLI | Why add | Install |
|-----|---------|--------|
| **Turbo** | Run `lint`, `test`, `build` across workspaces in parallel with caching. Eases `npm run lint -ws` / multi-step flows. | `npm i -g turbo` or add to root `devDependencies` |
| **dotenv-cli** | Load `.env` / `.env.local` into commands (e.g. `dotenv -- vercel dev`, `dotenv -- turbo run build`). Fits Vercel + Turbo workflows. | `npm i -D dotenv-cli` (root) |
| **pnpm** (optional) | Faster installs, less disk use. Only if you’re open to switching from npm. | [pnpm.io/installation](https://pnpm.io/installation) |
| **fnm** / **nvm** | Match CI Node 20/22 locally. | See docs/cli-tools.md § Node Version Manager |

**Summary**: Pin **vercel** in root `devDependencies`; install **gh** and **mongosh** if not already. For smoother monorepo DX, add **Turbo** and **dotenv-cli**; optionally **pnpm** and **fnm**/nvm.

---

## Quick check (verify script)

```bash
# Bash (WSL/Git Bash)
./scripts/verify-cli-connections.sh
```

On Windows you can check manually:

- `git --version`
- `vercel --version`
- `gh auth status`
- `mongosh --version` (optional)
