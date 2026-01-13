# Cursor CI Agent - Troubleshooting Guide

## Common Issues and Solutions

### 1. Workflow Fails at "Install Cursor CLI"

**Symptoms:**
- Workflow fails immediately after trying to install Cursor CLI
- Error about `agent` command not found

**Solutions:**
- Check if the install script is accessible: `curl https://cursor.com/install -fsS`
- Verify the PATH is set correctly in subsequent steps
- Check workflow logs for installation errors

### 2. "Agent command not found"

**Symptoms:**
- Error: `agent: command not found`
- Installation step succeeds but agent is unavailable

**Solutions:**
- The workflow now explicitly sets PATH: `export PATH="$HOME/.cursor/bin:$PATH"`
- Verify installation by checking `$HOME/.cursor/bin/agent` exists
- Ensure GITHUB_PATH is set correctly (it should be automatic)

### 3. Authentication Failures

**Symptoms:**
- Agent fails with authentication errors
- "Invalid token" or similar messages

**Solutions:**
- Verify `CURSOR_AUTH_TOKEN` secret is set correctly in repository settings
- Check that the token value matches: `key_ba838a1290ff09216c3ca301bb91b89fb35697517b20de2e8649c6a403a9722d`
- Ensure the secret name is exactly `CURSOR_AUTH_TOKEN` (case-sensitive)

### 4. Script Execution Errors

**Symptoms:**
- Node.js scripts fail
- "Missing required environment variables"

**Solutions:**
- Scripts now handle missing env vars gracefully
- Check that `GITHUB_TOKEN` is available (should be automatic)
- Verify Node.js is installed (workflow uses Node 18)

### 5. Workflow Doesn't Trigger

**Symptoms:**
- Workflow doesn't run on push
- Doesn't respond to other workflow failures

**Solutions:**
- Check workflow file is in `.github/workflows/` directory
- Verify YAML syntax is correct
- Check branch filters match your branch names
- For `workflow_run` trigger, ensure workflow names match exactly

### 6. No Failed Workflows Detected

**Symptoms:**
- Workflow runs but exits early
- "No failed workflows found" message

**Solutions:**
- This is expected behavior if no workflows failed
- Check that other workflows are actually failing
- Verify the workflow names in `workflow_run` trigger match your actual workflow names

## Debugging Steps

### 1. Check Workflow Logs

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Cursor CI Agent** workflow
4. Click on the failed run
5. Expand each step to see detailed logs

### 2. Verify Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify `CURSOR_AUTH_TOKEN` exists
3. Check the value is correct (you can't see it, but verify it was added)

### 3. Test Cursor CLI Locally

```bash
# Install locally
curl https://cursor.com/install -fsS | bash

# Set token
export CURSOR_AUTH_TOKEN="key_ba838a1290ff09216c3ca301bb91b89fb35697517b20de2e8649c6a403a9722d"

# Test agent
$HOME/.cursor/bin/agent -p "test"
```

### 4. Check Script Permissions

Scripts should be executable. If needed:
```bash
chmod +x .github/scripts/*.js
```

## Getting Help

If issues persist:

1. **Share the error message** from the workflow logs
2. **Check which step failed** (Install, Authenticate, Check status, Analyze, etc.)
3. **Verify your workflow names** match the trigger configuration
4. **Test the Cursor CLI locally** to verify the token works

## Recent Fixes Applied

- ✅ Added explicit PATH setting for agent command
- ✅ Added verification step after installation
- ✅ Made scripts handle missing env vars gracefully
- ✅ Added better error handling in agent execution
- ✅ Improved error messages and debugging output
