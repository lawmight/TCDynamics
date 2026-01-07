# Fix Current Workspace

Runs format + lint:fix + type-check on the current workspace only (faster and safer). Auto-detects which workspace you're in.

**Usage:**
- Be in a file from `apps/frontend` or `apps/backend`
- Type `/fix` in the chat input box
- The command will automatically detect your workspace and fix only that workspace

**What it does:**
1. Formats code with Prettier
2. Fixes linting issues automatically
3. Runs TypeScript type checking

**Example:**
If you're working in `apps/frontend`, running `/fix` will execute:
```bash
cd apps/frontend && npm run format && npm run lint:fix && npm run type-check
```

**Perfect for:**
- Quick code quality fixes before committing
- Fixing formatting and linting issues in one command
- Ensuring type safety without running slow tests

**Note:** This only affects the current workspace (frontend OR backend), not both. Safer and faster than running on all workspaces.
