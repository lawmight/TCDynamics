# Test This

Runs tests on the currently open file. Auto-detects workspace (frontend/backend) and uses Vitest (frontend) or Jest (backend).

**Usage:**
- Open the file you want to test in the editor
- Type `/test-this` in the chat input box
- The command will automatically detect which workspace the file belongs to and run the appropriate test command

**What it does:**
1. Detects if the file is in `apps/frontend` or `apps/backend`
2. Runs Vitest for frontend files or Jest for backend files
3. Tests only the specified file and its related test files

**Example:**
If you have `apps/frontend/src/components/Button.tsx` open, running `/test-this` will execute:
```bash
cd apps/frontend && npm run test -- src/components/Button.tsx
```

**Perfect for:**
- File-by-file debugging and optimization
- Quick test feedback during development
- TDD workflows
