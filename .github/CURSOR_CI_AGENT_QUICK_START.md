# Cursor CI Agent - Quick Start

## ✅ What's Been Set Up

The Cursor CI Agent has been configured for your TCDynamics repository with the following:

### Files Created

1. **`.github/workflows/cursor-ci-agent.yml`** - Main workflow file
2. **`.github/scripts/check-workflow-status.js`** - Checks for failed workflows
3. **`.github/scripts/get-latest-failed-workflow.js`** - Gets failed workflow ID
4. **`.github/scripts/get-failure-context.js`** - Extracts failure details
5. **`.github/scripts/comment-on-pr.js`** - Posts PR comments
6. **`.github/CURSOR_CI_AGENT_SETUP.md`** - Full documentation

## 🚀 Next Steps

### 1. Add GitHub Secret

Go to your TCDynamics repository on GitHub:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CURSOR_AUTH_TOKEN`
4. Value: `key_ba838a1290ff09216c3ca301bb91b89fb35697517b20de2e8649c6a403a9722d`
5. Click **Add secret**

### 2. Commit and Push

```bash
cd /path/to/TCDynamics
git add .github/
git commit -m "feat: add Cursor CI Agent for automatic failure analysis and fixes"
git push
```

### 3. Test the Workflow

The workflow will automatically:
- Run on every push
- Monitor other workflows (CI, Test, Build, Lint) for failures
- Analyze and attempt to fix issues
- Comment on PRs if fixes aren't possible

## 📋 How It Works

1. **On Push**: Checks if any workflows failed for that commit
2. **On Workflow Failure**: Triggers when other workflows complete with failures
3. **Analysis**: Uses Cursor CLI to analyze failure context
4. **Fixing**: Attempts automatic fixes to files
5. **Commit**: Commits fixes with message `fix: auto-fix CI failures [cursor-ci-agent]`
6. **Comment**: If fixes aren't possible, comments on the PR with analysis

## 🔍 Monitoring

- View runs in **Actions** tab → **Cursor CI Agent**
- Check PR comments for analysis when fixes aren't possible
- Review workflow logs for detailed execution

## ⚙️ Customization

### Add More Workflows to Monitor

Edit `.github/workflows/cursor-ci-agent.yml`:

```yaml
workflow_run:
  workflows: ['CI', 'Test', 'Build', 'Lint', 'Your-Workflow-Name']
```

### Adjust Analysis Prompt

Edit the prompt in the "Analyze and fix failures" step to customize what Cursor analyzes.

## 🐛 Troubleshooting

### Workflow Not Running
- ✅ Check that `CURSOR_AUTH_TOKEN` secret is set
- ✅ Verify workflow file syntax is correct
- ✅ Check Actions tab for errors

### Fixes Not Applied
- Check Cursor CLI output in workflow logs
- Verify authentication token is valid
- Review analysis output in `cursor-analysis.txt`

### Need Help?
See full documentation in `.github/CURSOR_CI_AGENT_SETUP.md`
