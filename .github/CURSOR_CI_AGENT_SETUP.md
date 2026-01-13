# Cursor CI Agent Setup Guide

This guide explains how the Cursor CI Agent is configured for the TCDynamics repository.

## Overview

The Cursor CI Agent automatically:
1. Monitors GitHub Actions workflows for failures
2. Analyzes failures using Cursor's AI capabilities
3. Attempts to automatically fix issues
4. Commits fixes or comments on PRs if fixes aren't possible

## Configuration

### Required Secrets

Add the following secret to your GitHub repository:

**Repository Settings → Secrets and variables → Actions → New repository secret**

- **Name**: `CURSOR_AUTH_TOKEN`
- **Value**: `key_ba838a1290ff09216c3ca301bb91b89fb35697517b20de2e8649c6a403a9722d`

### Workflow Triggers

The workflow triggers on:
- **Push events**: On every push to any branch
- **Workflow completion**: When other workflows (CI, Test, Build, Lint) complete with failures

### How It Works

1. **Detection**: The workflow detects failed CI/CD runs either:
   - Via `workflow_run` trigger when other workflows fail
   - By checking workflow status after a push

2. **Analysis**: Uses Cursor CLI to analyze failure context including:
   - Failed job names
   - Failed step details
   - Workflow logs and context

3. **Fixing**: Cursor AI attempts to:
   - Identify root causes
   - Make targeted fixes to files
   - Preserve code style and patterns
   - Focus on the entire monorepo (frontend + backend)

4. **Commit or Comment**:
   - If fixes are made: Automatically commits with message `fix: auto-fix CI failures [cursor-ci-agent]`
   - If fixes aren't possible: Comments on the PR with analysis

## File Structure

```
.github/
├── workflows/
│   └── cursor-ci-agent.yml      # Main workflow file
├── scripts/
│   ├── check-workflow-status.js  # Check for failed workflows
│   ├── get-latest-failed-workflow.js  # Get failed workflow ID
│   ├── get-failure-context.js    # Extract failure details
│   └── comment-on-pr.js          # Post PR comments
└── CURSOR_CI_AGENT_SETUP.md      # This file
```

## Workflow Details

### Job: `wait-and-analyze`

Runs on `ubuntu-latest` and:
- Checks out the repository
- Installs Cursor CLI
- Authenticates with the provided token
- Checks for failed workflows
- Analyzes and attempts fixes
- Commits fixes or comments on PRs

### Scripts

#### `check-workflow-status.js`
- Checks if any workflows failed for the current commit
- Uses GitHub API to query workflow runs
- Outputs status to `GITHUB_OUTPUT`

#### `get-latest-failed-workflow.js`
- Retrieves the most recent failed workflow ID
- Used when workflow_run trigger isn't available

#### `get-failure-context.js`
- Extracts detailed failure information:
  - Workflow name and status
  - Failed jobs
  - Failed steps
- Provides context for Cursor AI analysis

#### `comment-on-pr.js`
- Finds the PR associated with the branch
- Posts a formatted comment with analysis
- Handles cases where no PR exists

## Usage

### Automatic Operation

The workflow runs automatically. No manual intervention needed.

### Manual Trigger

You can manually trigger the workflow:
1. Go to **Actions** tab
2. Select **Cursor CI Agent**
3. Click **Run workflow**

### Monitoring

Check workflow runs in:
- **Actions** tab → **Cursor CI Agent**
- Look for annotations in failed workflows
- Check PR comments for analysis

## Troubleshooting

### Workflow Not Running

1. Check that `CURSOR_AUTH_TOKEN` secret is set
2. Verify workflow file is in `.github/workflows/`
3. Check workflow syntax in Actions tab

### Fixes Not Being Applied

1. Check Cursor CLI output in workflow logs
2. Verify authentication token is valid
3. Review `cursor-analysis.txt` in workflow artifacts

### PR Comments Not Appearing

1. Ensure the branch has an associated PR
2. Check GitHub token permissions
3. Review script logs for errors

## Customization

### Modify Workflow Names

Edit the `workflow_run` trigger in `cursor-ci-agent.yml`:

```yaml
workflow_run:
  workflows: ['CI', 'Test', 'Build', 'Lint']  # Add your workflow names
```

### Adjust Analysis Prompt

Edit the prompt in the "Analyze and fix failures" step to customize what Cursor analyzes.

### Change Commit Message

Modify the commit message in the "Commit fixes" step.

## Security Notes

- The Cursor auth token is stored as a GitHub secret
- Scripts use `GITHUB_TOKEN` for API access (automatically provided)
- No sensitive data is logged in workflow output

## Limitations

- The agent can only fix issues it understands
- Complex architectural changes may require manual intervention
- Some failures may need human review even after analysis

## Support

For issues or questions:
- Check workflow logs in GitHub Actions
- Review PR comments for detailed analysis
- Consult Cursor CLI documentation: https://cursor.com/docs/cli
