# Automated Test & Script Update System - Assessment

**Created**: 2026-01-14  
**Status**: Assessment & Design Phase

## Problem Statement

Tests and scripts are not automatically updated when code changes are pushed, leading to:
- Test failures due to outdated test expectations
- Broken scripts that reference changed APIs or file paths
- Manual intervention required to keep tests in sync
- CI/CD failures that could be prevented

## Current State Analysis

### Test Infrastructure

**Frontend Tests** (Vitest):
- **Location**: `apps/frontend/src/**/__tests__/` and `*.test.tsx`
- **Count**: ~40 test files
- **Framework**: Vitest 3.2.4 with React Testing Library
- **Coverage**: 60% threshold enforced in CI
- **Watch Mode**: Available but manual (`npm run test:watch`)

**Backend Tests** (Jest):
- **Location**: `apps/backend/src/**/__tests__/` and `*.test.js`
- **Count**: ~12 test files
- **Framework**: Jest 30.2.0 with Supertest
- **Coverage**: 70% threshold
- **Watch Mode**: Available but manual (`npm run test:watch`)

**E2E Tests** (Playwright):
- **Location**: `tests/e2e/*.spec.ts`
- **Count**: 3 spec files
- **Framework**: Playwright
- **Manual execution only**

### Script Infrastructure

**Utility Scripts**:
- `tools/scripts/test-this.js` - Test single file
- `tools/scripts/fix-current.js` - Auto-fix current workspace
- `tools/scripts/pre-push-checks.js` - Pre-push validation
- `tools/scripts/quick-check.js` - Quick validation
- `apps/frontend/scripts/*.js` - Frontend-specific scripts
- `api/scripts/*.js` - API migration scripts

### CI/CD Integration

**Current Workflow** (`quality-gate.yml`):
- Runs on PR and push to `main`
- Executes: Type check → Lint → Tests → Coverage check → Build
- **Does NOT** auto-update tests
- **Does NOT** detect missing tests
- **Fails** if tests are outdated

### Change Detection

**Current Capabilities**:
- Git diff available in CI
- File change detection via GitHub Actions paths
- No automated test update mechanism

## Root Causes

1. **No Change-to-Test Mapping**: No system to detect which tests should be updated when code changes
2. **Manual Test Updates**: Developers must manually update tests after code changes
3. **No Test Generation**: No automated test generation for new code
4. **Script Dependencies**: Scripts reference code that may have changed (APIs, paths, etc.)
5. **No Pre-commit Hooks**: Pre-push checks run tests but don't update them

## Solution Options

### Option 1: Snapshot Testing with Auto-Update (Recommended for UI)

**Pros**:
- Vitest/Jest already support snapshots
- Automatic snapshot updates with `-u` flag
- Great for component rendering tests
- Low maintenance

**Cons**:
- Only works for snapshot-based tests
- Doesn't help with logic/behavior tests
- Can mask real bugs if overused

**Implementation**:
- Convert component tests to use snapshots
- Add `--update-snapshots` to CI on test failures
- Review snapshot diffs before committing

### Option 2: AI-Powered Test Update (Most Comprehensive)

**Pros**:
- Can update any type of test
- Understands code context
- Can generate new tests for new code
- Can update scripts that reference changed code

**Cons**:
- Requires AI API access (OpenAI, Anthropic, etc.)
- More complex implementation
- May require review before committing

**Implementation**:
- GitHub Action that:
  1. Detects changed files
  2. Identifies affected tests/scripts
  3. Uses AI to analyze changes and update tests
  4. Creates PR with updates or commits directly

### Option 3: Heuristic-Based Test Update (Balanced)

**Pros**:
- No external dependencies
- Fast execution
- Predictable behavior
- Can detect common patterns

**Cons**:
- Limited to known patterns
- May miss complex changes
- Requires maintenance of heuristics

**Implementation**:
- Script that:
  1. Analyzes git diff
  2. Maps changes to test files
  3. Uses AST parsing to detect API changes
  4. Updates test expectations based on patterns

### Option 4: Hybrid Approach (Recommended)

**Combines Options 1, 2, and 3**:
- **Snapshot tests**: Auto-update snapshots on failure
- **Heuristic updates**: Handle common patterns (renames, type changes)
- **AI updates**: For complex changes or new test generation
- **Manual review**: PR-based workflow for AI updates

## Recommended Solution: Hybrid Approach

### Phase 1: Snapshot Auto-Update (Quick Win)

1. **Convert component tests to snapshots** where appropriate
2. **Add GitHub Action** that:
   - Runs tests on push
   - If snapshot tests fail, auto-update snapshots
   - Creates commit with updated snapshots
   - Requires review if significant changes

### Phase 2: Change Detection & Test Mapping

1. **Create script** (`tools/scripts/auto-update-tests.js`):
   - Detects changed files from git diff
   - Maps source files to test files
   - Identifies missing tests
   - Detects outdated test patterns

2. **GitHub Action integration**:
   - Runs on push/PR
   - Analyzes changes
   - Reports missing/outdated tests
   - Optionally auto-updates simple cases

### Phase 3: AI-Powered Updates (Advanced)

1. **AI Test Update Service**:
   - Uses OpenAI/Anthropic API
   - Analyzes code changes
   - Updates or generates tests
   - Creates PR with updates

2. **Review Workflow**:
   - AI updates go through PR review
   - Human approval required
   - Can be auto-merged if confidence high

### Phase 4: Script Update Detection

1. **Script Dependency Analysis**:
   - Detects scripts that import/require changed code
   - Validates script compatibility
   - Suggests updates

2. **Auto-fix Scripts**:
   - Update import paths
   - Fix API calls
   - Update configuration references

## Implementation Plan

### Immediate (Week 1)

1. ✅ Create assessment document (this file)
2. Create `tools/scripts/auto-update-tests.js` - Basic change detection
3. Add GitHub Action for snapshot auto-update
4. Document the system

### Short-term (Week 2-3)

1. Implement heuristic-based test updates
2. Add test coverage gap detection
3. Create PR workflow for test updates

### Long-term (Month 1+)

1. Integrate AI-powered test updates
2. Add script dependency tracking
3. Create dashboard for test health

## Success Metrics

- **Test Failure Rate**: Reduce CI test failures by 80%
- **Test Coverage**: Maintain or improve coverage thresholds
- **Update Time**: Tests updated within 1 hour of code changes
- **Manual Effort**: Reduce manual test updates by 90%

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auto-updates mask bugs | High | Require review for significant changes |
| AI updates incorrect | Medium | PR review required, confidence thresholds |
| Performance impact | Low | Run in parallel, cache results |
| False positives | Medium | Heuristic tuning, manual override |

## Next Steps

1. Review this assessment
2. Choose solution approach (recommend Hybrid)
3. Implement Phase 1 (Snapshot auto-update)
4. Iterate based on results

---

**Last Updated**: 2026-01-14
