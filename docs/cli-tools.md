# Recommended CLI Tools for TCDynamics

**Last Updated**: 2026-01-09
**Status**: Active

This document lists CLI tools that can streamline your development workflow.

## Essential Tools

### 1. **GitHub CLI (`gh`)** ⭐ Highly Recommended
**Why**: You have GitHub Actions workflows - this makes managing PRs, issues, and workflows much easier.

**Install**:
```bash
# Arch Linux
sudo pacman -S github-cli

# Or via package manager
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
**Why**: You use MongoDB Atlas - useful for direct database queries and debugging.

**Install**:
```bash
# Arch Linux (via AUR - requires yay or paru)
yay -S mongosh-bin
# or
paru -S mongosh-bin

# Or via npm (recommended - works everywhere)
npm install -g mongosh

# Or download binary directly
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

### 3. **jq** - JSON Processor
**Why**: Great for parsing JSON responses, configs, and API outputs.

**Install**:
```bash
# Arch Linux
sudo pacman -S jq
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

### 4. **HTTPie** - Modern HTTP Client
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
http POST localhost:3000/api/vertex prompt="test"
http GET localhost:3000/api/health

# With auth headers
http GET localhost:3000/api/users Authorization:"Bearer $TOKEN"
```

## Development Tools

### 5. **Node Version Manager (`fnm` or `nvm`)** - Optional
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

### 6. **direnv** - Environment Variable Management
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

### 7. **bat** - Better `cat`
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

### 8. **fd** - Better `find`
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

### 9. **ripgrep (`rg`)** - Better `grep`
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

### 10. **tldr** - Simplified Man Pages
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

### 11. **zoxide** - Smarter `cd`
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

### 12. **exa** - Better `ls`
**Why**: Modern replacement with colors, git status, tree view.

**Install**:
```bash
sudo pacman -S exa
```

**Usage**:
```bash
exa -l --git    # List with git status
exa --tree      # Tree view
```

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

**Last Updated**: 2026-01-09
