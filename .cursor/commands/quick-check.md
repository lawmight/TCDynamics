# Quick Check

Runs lint + type-check only (no tests) for the workspace you're in. Fast feedback loop for syntax/type errors.

**Usage:**
- Be in a file from `apps/frontend` or `apps/backend`
- Type `/quick-check` in the chat input box
- Get instant feedback on lint and type errors without waiting for tests

**What it does:**
1. Runs ESLint to check for code quality issues
2. Runs TypeScript type checking
3. Skips tests for faster feedback

**Example:**
If you're working in `apps/frontend`, running `/quick-check` will execute:
```bash
cd apps/frontend && npm run lint && npm run type-check
```

**Perfect for:**
- Quick iterations when debugging
- Fast feedback on syntax/type errors
- Pre-commit checks without running slow tests
- When you just want to verify code quality, not functionality

**Note:** Much faster than `verify` because it skips tests. Use when you need quick feedback on code quality.
