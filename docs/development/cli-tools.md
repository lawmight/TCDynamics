# CLI Tools for TCDynamics

**Last Updated**: 2026-02-01
**Status**: Active

This document provides comprehensive documentation for CLI tools used in the TCDynamics project, including recommended tools and a complete inventory of all CLI tools referenced by scripts and documentation.

---

## Recommended CLI Tools

This section lists CLI tools that can streamline your development workflow.  
**Full inventory**: See [Full inventory by script/docs](#full-inventory-by-scriptdocs) below for every CLI used by scripts and where it's referenced.

---

## All CLI tools in this project (summary)

| Role | Tools |
|------|--------|
| **Required by scripts** | `git`, `vercel`, `gh`, `npm`/`npx`, `node`, PowerShell |
| **Via npm (no global)** | eslint, prettier, vitest, playwright, vite, concurrently, cross-env, rimraf, husky, commitlint, tsc |
| **Optional** | mongosh, jq, http (HTTPie), bat, fd, rg (ripgrep) |

---

## Add these to ease your use (recommended)

Based on project usage, common DX best practices, and **NIA research** (indexed Turborepo/Vercel/dotenv docs):

1. **Pin Vercel CLI** – Add `vercel` to root `package.json` devDependencies (e.g. `^50.9.6`) so `npm run dev:vercel` and deploy scripts use a consistent version.
2. **gh** – Already in use via `scripts/github-actions.ps1`. Install if you haven't; needed for workflow list/trigger/status/watch.
3. **mongosh** – For MongoDB Atlas; use `scripts/mongosh.sh` (or Windows equivalent) with `MONGODB_URI` from `vercel env pull`.
4. **Turbo** (NIA-backed) – Task orchestration for monorepos: `turbo run lint test build`; parallel + cached. Eases running lint/test/build across workspaces. Add to root devDependencies or `npm i -g turbo`.
5. **dotenv-cli** (NIA-backed) – Load `.env`/`.env.local` into commands (e.g. `dotenv -- vercel dev`, `dotenv -- turbo run build`). Add `dotenv-cli` to root devDependencies; use in scripts as `dotenv -- <command>`.
6. **jq, HTTPie, bat, fd, ripgrep** – Optional but useful for JSON, API calls, and code search (see Optional section below).
7. **pnpm** (optional) – Faster, disk-efficient installs. Only if you're open to switching from npm; not required.
8. **dotenvx** (optional) – Alternative to dotenv-cli; cross-platform env + optional encryption.
9. **fnm / nvm** – If you need to match CI Node 20/22 locally.

**Full "consider adding" list with install notes**: See [Consider adding to ease use (NIA-backed)](#consider-adding-to-ease-use-nia-backed) below.

---

## Essential Tools

### 1. **GitHub CLI (`gh`)** ⭐ Highly Recommended

**Why**: You have GitHub Actions workflows - this makes managing PRs, issues, and workflows much easier. Used by `scripts/github-actions.ps1`.

**Install**:

```bash
# Windows (winget)
winget install GitHub.cli

# Windows (scoop)
scoop install gh

# Arch Linux
sudo pacman -S github-cli

# Or via package manager (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

**Useful Commands**:

```bash
# Authenticate
gh auth login

# View/manage PRs
gh pr list
gh pr create
gh pr checkout <number>
gh pr view <number>

# Manage workflows
gh workflow list
gh workflow run quality-gate.yml
gh workflow run deploy-mvp.yml --field environment=staging

# View workflow runs
gh run list
gh run view <run-id>
gh run watch <run-id>

# Manage issues
gh issue list
gh issue create
gh issue view <number>

# Clone repos faster
gh repo clone owner/repo
```

### 2. **MongoDB Shell (`mongosh`)** ⭐ Recommended

**Why**: You use MongoDB Atlas - useful for direct database queries and debugging. Use `scripts/mongosh.sh` (Bash) or load `.env.local` in PowerShell and run `mongosh $env:MONGODB_URI`.

**Install**:

```bash
# Windows (winget)
winget install MongoDB.Shell

# Or via npm (works everywhere)
npm install -g mongosh

# Arch Linux (via AUR)
yay -S mongosh-bin
# or: paru -S mongosh-bin

# Or download binary
# https://www.mongodb.com/try/download/shell
```

**Useful Commands**:

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net/dbname" --username <user>

# Or with connection string from env
mongosh $MONGODB_URI

# Run queries
mongosh --eval "db.users.find().limit(5)"
```

### 3. **Vercel CLI (`vercel`)** ⭐ Required for dev/deploy

**Why**: Used by `dev:vercel`, `deploy-vercel.ps1`, and related scripts. Pin the version in the project for consistency.

**Install**:

```bash
# Global (any OS)
npm install -g vercel

# Or add to root package.json devDependencies (recommended)
# "vercel": "^50.9.6"
# Then: npm install
```

**Verify**: `vercel whoami` (login: `vercel login`).

---

### 4. **jq** - JSON Processor

**Why**: Great for parsing JSON responses, configs, and API outputs.

**Install**:

```bash
# Arch Linux
sudo pacman -S jq
```

**Install (Windows)**:

```bash
# Windows (winget)
winget install jqlang.jq

# Or Chocolatey: choco install jq
```

**Useful Commands**:

```bash
# Parse package.json
cat package.json | jq '.scripts'

# Filter API responses
curl https://api.example.com/data | jq '.results[] | select(.status == "active")'

# Pretty print JSON
cat config.json | jq '.'
```

### 5. **HTTPie** - Modern HTTP Client

**Why**: Better alternative to curl for testing your Vercel API endpoints.

**Install**:

```bash
# Arch Linux
sudo pacman -S httpie

# Or via pip
pip install httpie
```

**Useful Commands**:

```bash
# Test API endpoints
http POST localhost:3000/api/ai provider==openai action==chat message="test"
http GET localhost:3000/api/health

# With auth headers
http GET localhost:3000/api/users Authorization:"Bearer $TOKEN"
```

## Development Tools

### 6. **Node Version Manager (`fnm` or `nvm`)** - Optional

**What it is**: A tool to install and switch between different Node.js versions (like 18, 20, 22).

**Why**: Your CI tests Node 20 and 22 - this lets you test locally with the same versions.

**Note**: This is NOT related to Vercel CLI. The install script just happens to be hosted on `fnm.vercel.app` (Vercel's domain), but it's a completely separate tool for managing Node.js versions.

**Do you need it?**

- ✅ **Yes** if you want to test with Node 20 and 22 locally (to match CI)
- ❌ **No** if you only use one Node version and don't need to match CI exactly

**Install fnm** (faster, written in Rust):

```bash
# Via install script (recommended)
curl -fsSL https://fnm.vercel.app/install | bash

# Or via cargo (if you have Rust installed)
cargo install fnm

# After installation, add to ~/.zshrc:
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc
source ~/.zshrc
```

**Install nvm** (alternative, more widely used):

```bash
# Via install script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Useful Commands**:

```bash
# Install Node versions
fnm install 20
fnm install 22

# Use specific version
fnm use 20
fnm use 22

# Set default
fnm default 20

# Auto-switch based on .nvmrc or .node-version file
# (if you add eval "$(fnm env --use-on-cd)" to .zshrc)
```

### 7. **direnv** - Environment Variable Management

**Why**: Automatically load `.env` files when entering directories.

**Install**:

```bash
# Arch Linux
sudo pacman -S direnv

# Add to ~/.zshrc
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
```

**Usage**:

```bash
# Create .envrc in project root
echo 'dotenv .env' > .envrc
direnv allow
```

### 8. **bat** - Better `cat`

**Why**: Syntax highlighting for code files.

**Install**:

```bash
sudo pacman -S bat
```

**Usage**:

```bash
bat package.json
bat apps/frontend/src/App.tsx
```

### 9. **fd** - Better `find`

**Why**: Faster and more intuitive than `find`.

**Install**:

```bash
sudo pacman -S fd
```

**Usage**:

```bash
# Find TypeScript files
fd '\.tsx?$'

# Find files by name
fd 'button' apps/frontend
```

### 10. **ripgrep (`rg`)** - Better `grep`

**Why**: Much faster than grep for code search.

**Install**:

```bash
sudo pacman -S ripgrep
```

**Usage**:

```bash
# Search in code
rg 'useQuery' apps/frontend
rg 'TODO|FIXME'
```

## Optional but Useful

### 11. **tldr** - Simplified Man Pages

**Why**: Quick examples instead of full man pages.

**Install**:

```bash
sudo pacman -S tldr
tldr --update
```

**Usage**:

```bash
tldr git
tldr npm
tldr docker
```

### 12. **zoxide** - Smarter `cd`

**Why**: Jump to directories by name, learns your habits.

**Install**:

```bash
sudo pacman -S zoxide

# Add to ~/.zshrc
echo 'eval "$(zoxide init zsh)"' >> ~/.zshrc
```

**Usage**:

```bash
z frontend  # Jump to frontend directory
z api       # Jump to api directory
```

### 13. **eza** - Better `ls` (exa successor)

**Why**: Modern replacement with colors, git status, tree view. (exa was renamed to eza.)

**Install (Windows)**:

```powershell
winget install --id eza-community.eza
```

**Usage**:

```bash
eza -l --git    # List with git status
eza --tree      # Tree view
```

### 14. **Turbo** - Monorepo task runner (optional)

**Why**: Run lint/test/build across workspaces in parallel with caching. Eases use when you run many tasks often.

**Install**: `npm install -g turbo` or add to root devDependencies.

**Usage**: `turbo run lint`, `turbo run build`, `turbo dev --filter=apps/frontend`.

### 15. **pnpm** - Alternative package manager (optional)

**Why**: Faster installs and less disk usage. Only consider if you're open to switching from npm.

**Install**: `npm install -g pnpm` or [pnpm.io/installation](https://pnpm.io/installation).

### 16. **dotenvx** - Env and secrets (optional)

**Why**: Cross-platform env loading, multi-environment, optional encryption. Alternative to manual `.env`/`.env.local`.

**Install**: `npm install -g @dotenvx/dotenvx` or [dotenvx.com](https://dotenvx.com).

---

## Quick Install Script

For Arch Linux, install packages in two steps:

**Step 1: Official Repository Packages**

```bash
sudo pacman -S \
  github-cli \
  jq \
  httpie \
  direnv \
  bat \
  fd \
  ripgrep \
  tldr \
  zoxide \
  exa
```

**Step 2: AUR Packages** (requires `yay` or `paru`)

```bash
# Install mongosh from AUR
yay -S mongosh-bin
# or
paru -S mongosh-bin
```

**Step 3: Install fnm** (via script - not in repos)

```bash
curl -fsSL https://fnm.vercel.app/install | bash
# Then add to ~/.zshrc: eval "$(fnm env --use-on-cd)"
```

**Alternative: Install mongosh via npm** (if you prefer)

```bash
npm install -g mongosh
```

## Connecting Services to CLI Tools

### 1. **GitHub CLI (`gh`)** ✅ Already Connected

Your GitHub CLI is already authenticated. Verify with:

```bash
gh auth status
```

**If you need to re-authenticate**:

```bash
gh auth login
# Follow the prompts to authenticate via browser or token
```

### 2. **MongoDB Shell (`mongosh`)** - Connection Setup

MongoDB Shell uses your connection string from environment variables.

**Option A: Pull from Vercel (Recommended)**

```bash
# Pull environment variables from Vercel (includes MONGODB_URI)
vercel env pull .env.local --environment=development

# Then connect using the helper script
./scripts/mongosh.sh
```

**Option B: Use helper script (after pulling env vars)**

```bash
# The helper script automatically loads .env.local or .env
./scripts/mongosh.sh

# With additional mongosh arguments
./scripts/mongosh.sh --eval "db.users.find().limit(5)"
```

**Option C: Manual connection**

```bash
# Load environment and connect
source .env.local 2>/dev/null || source .env
mongosh "$MONGODB_URI"
```

**Option D: Direct connection string**

```bash
# Connect directly with connection string (not recommended - use env vars)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
```

**Test your connection**:

```bash
# Quick test query
./scripts/mongosh.sh --eval "db.adminCommand('ping')"
```

### 3. **Vercel CLI** ✅ Already Connected

Your Vercel CLI is already set up. Verify with:

```bash
vercel whoami
```

**If you need to re-authenticate**:

```bash
vercel login
```

### 4. **Optional: Clerk CLI** (Not Required)

Clerk doesn't have an official CLI tool. Authentication is handled via:

- Frontend: `@clerk/clerk-react` package
- Backend: `@clerk/backend` package
- Webhooks: Configured in Clerk Dashboard

### 5. **Optional: Sentry CLI** (For Releases)

If you want to upload source maps or manage releases via CLI:

**Install**:

```bash
# Via npm
npm install -g @sentry/cli

# Or via package manager (if available)
```

**Authenticate**:

```bash
# Set auth token from environment
export SENTRY_AUTH_TOKEN="your_token_here"

# Or create ~/.sentryclirc
cat > ~/.sentryclirc << EOF
[auth]
token=your_sentry_auth_token_here

[defaults]
org=your-org-slug
project=your-project-slug
EOF
```

**Get your token**: Sentry Dashboard → Settings → Auth Tokens

**Note**: Sentry CLI is optional - your app works without it. It's mainly useful for:

- Uploading source maps during build
- Managing releases
- Creating releases programmatically

## Integration with Your Workflow

### GitHub Actions

```bash
# Trigger workflows from CLI
gh workflow run quality-gate.yml
gh workflow run deploy-mvp.yml --field environment=staging

# Watch deployment
gh run watch
```

### Vercel

```bash
# Your existing scripts use vercel CLI
npm run dev:vercel  # Uses: vercel dev

# Deploy
vercel --prod

# View deployments
vercel ls
```

### MongoDB

```bash
# Quick database queries (requires MONGODB_URI in environment)
mongosh "$MONGODB_URI" --eval "db.users.countDocuments()"

# Interactive shell
mongosh "$MONGODB_URI"

# Run a script
mongosh "$MONGODB_URI" < script.js
```

## Zsh Plugins (Optional)

Since you're using zsh, consider these plugins:

```bash
# Install oh-my-zsh or zinit, then add:
# - zsh-autosuggestions
# - zsh-syntax-highlighting
# - git
# - npm
# - node
```

---

## Full inventory by script/docs

**Generated**: 2026-02-01  
**Purpose**: Single source of truth for all CLI tools referenced by scripts, docs, and tooling.

---

### 1. Essential (required by scripts)

| CLI | Where used | Install |
|-----|------------|--------|
| **git** | `ship.ps1`, pre-push, husky hooks | System / [git-scm.com](https://git-scm.com/) |
| **vercel** | `dev:vercel`, `deploy-vercel.ps1`, `deploy-vercel-preview.ps1`, `deploy-vercel-frontend-only.ps1`, `scripts/mongosh.sh`, `scripts/verify-cli-connections.sh` | `npm i -g vercel` or add to root `devDependencies` |
| **gh** (GitHub CLI) | `scripts/github-actions.ps1` (list/trigger/status/watch workflows) | [cli.github.com](https://cli.github.com/) |
| **npm** / **npx** | All `package.json` scripts, lint, build, test | Bundled with Node.js |
| **node** | `pre-push-checks.js`, `fix-current.js`, `test-this.js`, tools | Bundled with Node.js |
| **PowerShell** | `ship.ps1`, `deploy-vercel*.ps1`, `github-actions.ps1` | Windows built-in |

---

### 2. Used via npm (no global install needed)

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

### 3. Optional (documented or in verify script)

| CLI | Where referenced | Purpose |
|-----|------------------|---------|
| **mongosh** | `scripts/mongosh.sh`, `scripts/verify-cli-connections.sh` | MongoDB Atlas shell |
| **jq** | `docs/development/cli-tools.md`, `verify-cli-connections.sh` | JSON parsing |
| **http** (HTTPie) | `docs/development/cli-tools.md`, `verify-cli-connections.sh` | API testing |
| **bat** | `docs/development/cli-tools.md`, `verify-cli-connections.sh` | Syntax-highlighted cat |
| **fd** | `docs/development/cli-tools.md`, `verify-cli-connections.sh` | Fast find |
| **rg** (ripgrep) | `docs/development/cli-tools.md`, `verify-cli-connections.sh` | Fast grep |

---

### 4. Optional (recommended, see docs/cli-tools.md)

| CLI | Purpose | Install (Windows) |
|-----|---------|------------------|
| **fnm** / **nvm** | Node version switching (match CI Node 20/22) | winget: Schniz.fnm |
| **direnv** | Auto-load `.env` per directory | winget: direnv.direnv |
| **tldr** | Short man-page examples | winget: dbrgn.tealdeer |
| **zoxide** | Smarter `cd` (jump by name) | winget: ajeetdsouza.zoxide |
| **eza** | Modern `ls` with git status (exa successor) | winget: eza-community.eza |
| **Sentry CLI** | Source maps, releases | `npm i -g @sentry/cli` |

---

### 5. Consider adding to ease use (NIA-backed)

Research (indexed monorepo + Vercel/Turborepo docs) suggests these CLIs to add for a React + Vite + Vercel monorepo:

| CLI | Why add | Install |
|-----|---------|--------|
| **Turbo** | Run `lint`, `test`, `build` across workspaces in parallel with caching. Eases `npm run lint -ws` / multi-step flows. | `npm i -g turbo` or add to root `devDependencies` |
| **dotenv-cli** | Load `.env` / `.env.local` into commands (e.g. `dotenv -- vercel dev`, `dotenv -- turbo run build`). Fits Vercel + Turbo workflows. | `npm i -D dotenv-cli` (root) |
| **pnpm** (optional) | Faster installs, less disk use. Only if you're open to switching from npm. | [pnpm.io/installation](https://pnpm.io/installation) |
| **fnm** / **nvm** | Match CI Node 20/22 locally. | See [Node Version Manager](#6-node-version-manager-fnm-or-nvm---optional) section above |

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

---

**Last Updated**: 2026-02-01
