# Test Watch Mode

Starts Vitest watch mode for frontend from root. Automatically re-runs tests on file changes.

**Usage:**
- Type `/test-watch` in the chat input box
- Vitest will start in watch mode and monitor for file changes
- Tests will automatically re-run when you save changes

**What it does:**
1. Starts Vitest in watch mode for the frontend
2. Monitors test files and source files for changes
3. Automatically re-runs relevant tests when files are saved

**Example:**
Running `/test-watch` will execute:
```bash
cd apps/frontend && npm run test
```
(Vitest runs in watch mode by default)

**Perfect for:**
- TDD (Test-Driven Development) workflows
- Continuous test feedback while coding
- Debugging with automatic test re-runs

**Note:** This runs from root but executes in the frontend workspace. Press `q` to quit watch mode.
