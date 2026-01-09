# Preview

Commits changes, pushes to GitHub, and deploys to Vercel preview. Safe way to test changes before production.

**Usage:**
- Type `/preview` in the chat input box
- Executes: commit → push → deploy to Vercel preview

**What it does:**
1. Commits all staged changes (or prompts to stage if none)
2. Pushes to the current branch
3. Deploys to Vercel preview environment (not production)

**Execution Steps:**
```bash
# 1. Check git status
git status

# 2. Stage changes (if needed)
git add .

# 3. Commit with conventional commit message
git commit -m "feat: [describe changes]"

# 4. Push to current branch
git push

# 5. Deploy to Vercel preview (creates preview URL)
vercel --yes
```

**Safety Checks:**
- Verify there are changes to commit
- Preview deployments are safe (non-production)

**Perfect for:**
- Testing changes before production
- Creating preview URLs for review
- Safe deployment workflow

**Note:** Preview deployments don't affect production. Perfect for testing.
