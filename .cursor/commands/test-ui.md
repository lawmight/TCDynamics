# Test UI

Opens Vitest UI for frontend from root. Interactive test interface with coverage, filtering, and debugging.

**Usage:**

- Type `/test-ui` in the chat input box
- Vitest UI will open in your browser
- Use the interactive interface to run, filter, and debug tests

**What it does:**

1. Starts Vitest UI server
2. Opens interactive test interface in browser
3. Provides visual test results, coverage reports, and filtering

**Example:**
Running `/test-ui` will execute:

```bash
npm run test:ui
```

**Features in UI:**

- Visual test results with pass/fail indicators
- Coverage reports with line-by-line highlighting
- Filter tests by file, name, or status
- Watch mode toggle
- Better debugging experience than CLI
- Test execution history

**Perfect for:**

- File-by-file debugging with visual feedback
- Exploring test coverage
- Filtering and running specific test suites
- Better debugging experience than terminal output

**Note:** The UI will open automatically in your default browser. Accessible from root without needing to `cd apps/frontend`.
