# Automated Test & Script Update Guide

**Last Updated**: 2026-01-14  
**Status**: Active

## Overview

The automated test and script update system helps keep tests and scripts synchronized with code changes automatically. It detects when code changes and updates tests/scripts accordingly.

## Quick Start

### Check What Would Be Updated

```bash
npm run test:update:check
```

### Update Tests (Dry Run)

```bash
npm run test:update:dry
```

### Actually Update Tests

```bash
npm run test:update
```

## How It Works

### 1. Change Detection

The system analyzes git diffs to detect:
- Changed source files (`apps/frontend/src/**`, `apps/backend/src/**`, `api/**`)
- New files that might need tests
- Files that have been modified

### 2. Test Mapping

For each changed file, the system:
- Looks for co-located test files (e.g., `Button.test.tsx` next to `Button.tsx`)
- Checks for tests in `__tests__` directories
- Identifies missing tests

### 3. Snapshot Updates

If snapshot tests are detected:
- Automatically updates snapshots using Vitest/Jest `--update-snapshots` flag
- Creates a commit or PR with the updates
- Requires review for significant changes

### 4. Script Analysis

The system also:
- Detects scripts that import/require changed files
- Warns about potentially broken scripts
- Suggests updates

## Usage

### Local Development

**Check for issues:**
```bash
npm run test:update:check
```

**See what would be updated (dry run):**
```bash
npm run test:update:dry
```

**Update tests:**
```bash
npm run test:update
```

**Update only snapshots:**
```bash
npm run test:update -- --snapshots-only
```

**Verbose output:**
```bash
npm run test:update -- --verbose
```

### Command Line Options

The `auto-update-tests.js` script supports:

- `--dry-run` - Show what would be updated without making changes
- `--snapshots-only` - Only update snapshot tests
- `--check-only` - Only check for issues, don't update
- `--verbose` or `-v` - Show detailed output

### Examples

```bash
# Check what tests need updating
node tools/scripts/auto-update-tests.js --check-only

# See what snapshots would be updated
node tools/scripts/auto-update-tests.js --snapshots-only --dry-run

# Update everything with verbose output
node tools/scripts/auto-update-tests.js --verbose
```

## CI/CD Integration

### Automatic Updates on Push

The GitHub Action workflow (`.github/workflows/auto-update-tests.yml`) automatically:

1. **Detects changes** when you push code
2. **Analyzes tests** to find what needs updating
3. **Updates snapshots** if needed
4. **Creates a PR** with the updates (or commits directly to the branch)

### Workflow Triggers

The workflow runs on:
- **Push** to `main` or `cursor/**` branches
- **Pull requests** to `main`
- **Manual dispatch** via GitHub Actions UI

### Workflow Behavior

**On Push:**
- Updates snapshots automatically
- Commits directly to the branch (unless `create_pr: true` is set)
- Skips CI for auto-update commits (`[skip ci]`)

**On Pull Request:**
- Analyzes changes
- Creates a separate PR for snapshot updates
- Requires review before merging

**Manual Dispatch:**
- Can be triggered manually from GitHub Actions
- Options to control snapshot updates and PR creation

## Test File Patterns

The system recognizes these test file patterns:

### Frontend Tests

- Co-located: `Button.test.tsx` next to `Button.tsx`
- `__tests__` directory: `src/components/__tests__/Button.test.tsx`
- Same directory: `src/components/Button.test.tsx`

### Backend Tests

- Co-located: `route.test.js` next to `route.js`
- `__tests__` directory: `src/routes/__tests__/route.test.js`
- Same directory: `src/routes/route.test.js`

## Snapshot Testing

### What Are Snapshots?

Snapshot tests capture the rendered output of components and compare it against a stored "snapshot" file. If the output changes, the test fails until you update the snapshot.

### When Snapshots Are Updated

Snapshots are automatically updated when:
- Code changes affect component rendering
- You run `npm run test:update`
- The GitHub Action detects snapshot test failures

### Reviewing Snapshot Changes

**Always review snapshot changes** before committing:
1. Check the diff to see what changed
2. Verify changes are expected (not bugs)
3. Ensure no sensitive data is in snapshots
4. Approve if changes look correct

### Manual Snapshot Updates

You can also update snapshots manually:

```bash
# Frontend
cd apps/frontend
npm run test -- --update-snapshots

# Backend
cd apps/backend
npm run test -- -u
```

## Script Updates

### Detecting Affected Scripts

The system checks scripts in:
- `tools/scripts/`
- `apps/frontend/scripts/`
- `api/scripts/`

### What Gets Detected

Scripts are flagged if they:
- Import/require changed source files
- Reference changed file paths
- Use changed module names

### Manual Script Updates

When a script is flagged:
1. Review the warning message
2. Check if the script still works
3. Update imports/paths as needed
4. Test the script manually

## Best Practices

### 1. Review Auto-Updates

**Always review** automatic updates before merging:
- Check that changes are expected
- Verify no bugs were introduced
- Ensure tests still validate behavior

### 2. Use Dry Run First

Before updating, check what would change:
```bash
npm run test:update:dry
```

### 3. Keep Tests Up to Date

Run the update check regularly:
```bash
npm run test:update:check
```

### 4. Write Testable Code

- Keep components pure and testable
- Use dependency injection
- Avoid side effects in test code

### 5. Use Snapshots Wisely

- Use snapshots for stable UI components
- Don't snapshot frequently changing data
- Review snapshot diffs carefully

## Troubleshooting

### Tests Not Detected

**Problem**: Changed file doesn't have a corresponding test detected.

**Solutions**:
1. Check test file naming matches patterns
2. Ensure test file is in expected location
3. Run with `--verbose` to see detection logic

### Snapshots Not Updating

**Problem**: Snapshots aren't being updated automatically.

**Solutions**:
1. Check if tests use `toMatchSnapshot()` or `toMatchInlineSnapshot()`
2. Verify test framework (Vitest/Jest) is configured correctly
3. Run update manually: `npm run test -- --update-snapshots`

### Script Warnings

**Problem**: Scripts are flagged but don't need updates.

**Solutions**:
1. False positives can occur - verify manually
2. Script might use dynamic imports not detected
3. Update script to use explicit imports

### CI/CD Failures

**Problem**: GitHub Action fails to update tests.

**Solutions**:
1. Check workflow logs for errors
2. Verify git permissions (token has write access)
3. Check if branch protection rules allow auto-commits
4. Review PR creation settings

## Advanced Usage

### Custom Base Reference

The script uses `HEAD~1` by default. To use a different base:

```bash
# In the script, modify getChangedFiles() call
# Or set GIT_BASE_REF environment variable
GIT_BASE_REF=origin/main node tools/scripts/auto-update-tests.js
```

### Excluding Files

To exclude files from analysis, modify the script's filtering logic:

```javascript
// In auto-update-tests.js, add to the skip list:
if (file.includes('your-pattern')) continue
```

### Integration with Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run test:update:check
```

## Related Documentation

- [Testing Strategy](./strategy.md) - Overall testing approach
- [Testing Guide](../TESTING_GUIDE.md) - Manual testing procedures
- [E2E Testing](./e2e.md) - End-to-end testing guide
- [CI/CD Guide](../deployment/ci-cd.md) - CI/CD pipeline details

## Future Enhancements

Planned improvements:
- [ ] AI-powered test generation for new code
- [ ] Automatic test update suggestions using AI
- [ ] Script dependency graph visualization
- [ ] Test coverage gap analysis
- [ ] Integration with code review tools

---

**Last Updated**: 2026-01-14
