# Managing Multiple Code Review Bots

## Overview

This repository uses multiple automated code review agents to ensure code quality:

1. **Greptile** - In-depth code analysis, logical errors, style guidelines
2. **Cubic** - Code review summaries and analysis
3. **Cursor Bugbot** - Automated code review from Cursor AI

## Strategy for Managing Multiple Reviewers

### 1. Define Roles and Responsibilities

**Greptile:**
- Focus: Code quality, logic errors, style consistency
- Configuration: `greptile.json` in repo root
- Triggers: Pull requests (can be filtered by labels, branches)

**Cubic:**
- Focus: PR summaries, code analysis summaries
- Configuration: Dashboard settings
- Triggers: Pull requests

**Cursor Bugbot:**
- Focus: Automated suggestions from Cursor AI
- Configuration: Cursor dashboard settings
- Triggers: Pull requests

### 2. Handling Overlapping Suggestions

When multiple bots suggest similar changes:

1. **Compare suggestions** - Review which bot's suggestion is more aligned with your codebase standards
2. **Prioritize by severity**:
   - Security issues (highest priority)
   - Logic/bug fixes
   - Style/formatting (lowest priority)
3. **Merge similar suggestions** - If multiple bots suggest the same fix, apply it once

### 3. Configuration Strategies

#### Option A: Specialized Roles (Recommended)

Configure each bot to focus on different aspects:

```json
// greptile.json - Focus on code quality
{
  "strictness": 2,
  "commentTypes": ["logic", "security"],
  "customRules": {
    "enforceTypeSafety": true,
    "preferAsyncAwait": true,
    "requireErrorHandling": true
  }
}
```

- **Greptile**: Code quality, type safety, error handling
- **Cubic**: Summaries and high-level analysis
- **Cursor Bugbot**: Quick fixes and patterns

#### Option B: Conditional Triggers

Use labels or branch patterns to control which bots review:

- `[review:greptile]` - Only Greptile reviews
- `[review:cubic]` - Only Cubic reviews
- `[skip-review]` - Skip automated reviews (for urgent fixes)

#### Option C: Reduce Redundancy

1. **Disable one bot** if reviews are too similar
2. **Adjust strictness levels** to get different types of feedback
3. **Use bot-specific ignore patterns** in configurations

### 4. Practical Workflow

#### For Regular PRs:

1. **Create PR** → All bots review automatically
2. **Review suggestions** in this order:
   - Security issues (all bots)
   - Logic errors (Greptile priority)
   - Style/formatting (lowest priority)
3. **Apply suggestions**:
   - Use GitHub's "Apply suggestion" for each change
   - Batch apply when multiple suggestions in same file
   - Manually implement complex suggestions
4. **Address conflicts**:
   - If bots disagree, use your judgment or team standards
   - Check project documentation/cursorrules

#### For Urgent/Hotfix PRs:

1. **Add label**: `[skip-review]` or `[hotfix]`
2. **Manual review only** - Skip automated reviews
3. **Post-merge review** - Run reviews after merge if needed

### 5. Managing Review Volume

If you're getting too many suggestions:

#### Reduce Greptile Suggestions:
```json
// greptile.json
{
  "strictness": 1,  // Lower strictness (1-3 scale)
  "commentTypes": ["logic"],  // Only logic, skip style
  "excludedAuthors": ["dependabot[bot]", "renovate[bot]"]
}
```

#### Disable Specific Bot Reviews:

**Via GitHub UI:**
- Go to repository Settings → Integrations
- Find the bot (Greptile/Cubic) → Configure
- Adjust review triggers or disable for specific branches

**Via Labels:**
- Check if bots respect `[skip-review]` or similar labels
- Add labels to skip automated reviews

**Via Cursor Dashboard:**
- Go to Cursor dashboard → Bugbot settings
- Adjust review frequency or disable for specific patterns

### 6. Best Practices

1. **Don't apply all suggestions blindly**
   - Review each suggestion for context
   - Consider your project's specific needs
   - Some suggestions may conflict with project patterns

2. **Prioritize by impact**
   - Security vulnerabilities → Fix immediately
   - Bug fixes → High priority
   - Style/formatting → Can batch or defer

3. **Use consistent formatting**
   - Let Prettier/ESLint handle formatting (prevents style suggestions)
   - Run `npm run format` before creating PRs

4. **Document decisions**
   - If you ignore a suggestion, add a comment explaining why
   - Helps future reviewers understand context

5. **Regular bot maintenance**
   - Review bot configurations quarterly
   - Adjust strictness based on team feedback
   - Disable redundant bots if reviews overlap too much

### 7. Troubleshooting

#### Too Many Overlapping Reviews

**Solution**: Reduce number of active bots or specialize their roles

```bash
# Option 1: Disable one bot (via GitHub Settings → Integrations)
# Option 2: Adjust greptile.json strictness
# Option 3: Use branch/label filtering
```

#### Conflicting Suggestions

**Solution**: Use project standards (`.cursorrules`, `eslint.config.js`) as the source of truth

#### Review Performance Impact

**Solution**: 
- Use conditional triggers (labels/branches)
- Reduce bot strictness
- Disable for draft PRs if possible

### 8. Quick Reference

| Bot | Configuration File | Dashboard | Focus Area |
|-----|-------------------|-----------|------------|
| Greptile | `greptile.json` | greptile.com/dashboard | Code quality, logic |
| Cubic | Dashboard only | cubic.dev | Summaries, analysis |
| Cursor Bugbot | Cursor settings | cursor.com/dashboard | AI suggestions |

### 9. Recommended Settings

For a balanced setup:

**greptile.json:**
```json
{
  "strictness": 2,
  "commentTypes": ["logic", "security"],
  "excludedAuthors": ["dependabot[bot]", "renovate[bot]"],
  "customRules": {
    "enforceTypeSafety": true,
    "requireErrorHandling": true
  }
}
```

**Cursor Bugbot:**
- Enable for PRs
- Focus on: Security, bugs, patterns
- Skip: Style/formatting (let Prettier handle)

**Cubic:**
- Enable summaries
- Use for high-level analysis

---

## Questions or Issues?

If you're getting too many reviews or conflicting suggestions:
1. Check this guide first
2. Review bot configurations
3. Consider disabling one bot if redundant
4. Adjust strictness levels
