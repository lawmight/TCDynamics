# Ship

Commits changes, pushes to GitHub, and deploys to Vercel production. One command to ship your code.

**Usage:**
- Type `/ship` in the chat input box
- Executes: commit → push → deploy to production

**What it does:**
1. Commits all staged changes (or prompts to stage if none)
2. Pushes to the current branch (usually `main`)
3. Deploys to Vercel production (`npm run deploy:vercel`)

**Execution Steps:**
```bash
# 1. Check git status
git status

# 2. Stage changes (if needed)
git add .

# 3. Commit with conventional commit message (or prompt user)
git commit -m "feat: [describe changes]"

# 4. Push to current branch
git push

# 5. Deploy to Vercel production
npm run deploy:vercel
```

**Safety Checks:**
- Verify there are changes to commit
- Confirm branch (warn if not on main/production branch)
- Run quick lint check before committing (optional)
- Confirm before pushing to production

**Perfect for:**
- Final deployment after code review
- Quick production deployments
- Automated release workflow

**Note:** This deploys to production. Make sure all tests pass and code is reviewed before shipping.
