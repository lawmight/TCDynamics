# Git Status & Branch Management

**Last Updated**: 2026-01-09
**Status**: Active

This document provides information about git branch status, remotes, and recommended workflows.

**Note**: Branch listings in this document may become outdated. For current branch status, run `git branch -vv` (local branches with tracking info) or `git branch -a` (all branches including remotes).

## Git Remotes

You have **2 remotes** configured:

1. **`origin`** → `https://github.com/lawmight/TCDynamics.git`
   - This is your main repository
   - Your `main` branch tracks `origin/main`

2. **`functions`** → `https://github.com/lawmight/TCDynamics-Functions.git`
   - This is a separate repository for Azure Functions
   - You have a local branch `functions/main` that tracks this

---

## Branch Inventory

### Local Branches (9 total)
- `main` ⭐ (current)
- `bugbots-automated-fixes`
- `cursor/analyse-azure-integration-cf97`
- `cursor/analyse-code-quality-and-provide-feedback-4600`
- `cursor/analyse-code-quality-and-provide-feedback-74ab`
- `cursor/analyse-code-quality-and-provide-feedback-a8a7`
- `feat/light-dark-theme`
- `functions/main` (tracks `functions` remote)
- `update-functions` (tracks `functions` remote)

### Remote Branches on GitHub (50+ branches)
Many `cursor/*` branches from automated fixes, plus:
- `main` ✅ (synced with local)
- `feat/light-dark-theme`
- `bugbots-automated-fixes`
- `refactor/typescript-migration-and-cleanup` (merged into main)
- Multiple `dependabot/*` branches
- Many `cursor/*` branches (not all checked out locally)

---

## Quick Commands Reference

```bash
# See all branches (local + remote)
git branch -a

# See branch tracking info
git branch -vv

# See what's different from remote
git diff origin/main

# See uncommitted changes
git status

# Check Vercel connection (if you have Vercel CLI)
vercel inspect
```

---

## Important Notes

1. **Vercel deploys from GitHub**, not your local machine
2. **You have 50+ branches on GitHub** - consider cleaning up old `cursor/*` branches
3. **Two separate repos**: Main repo + Functions repo (different remotes)

---

**Note**: This document consolidates previous branch status analyses. For current status, run `git status` and `git branch -vv`.
