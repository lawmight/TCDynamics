# All Agents

Launches all 4 specialized subagents in parallel for comprehensive codebase analysis and development.

**Usage:**

- Type `/all-agents` in the chat input box
- All 4 subagents will be spawned simultaneously to work in parallel

**To execute:** Spawn the following subagents in parallel:

- `code-reviewer`
- `frontend-specialist`
- `backend-specialist`
- `test-runner`

**What it does:**
Spawns the following subagents concurrently:

1. **code-reviewer** - Security, quality, and maintainability reviews (read-only)
2. **frontend-specialist** - React/TypeScript/Vite frontend development (apps/frontend/)
3. **backend-specialist** - Vercel serverless/MongoDB/API development (api/, apps/backend/)
4. **test-runner** - Test execution and analysis (all test suites)

**Parallel Execution:**
All agents are designed to work simultaneously without conflicts:

- ✅ **code-reviewer**: Read-only, can review any files
- ✅ **frontend-specialist**: Operates exclusively in `apps/frontend/`
- ✅ **backend-specialist**: Operates exclusively in `api/` and `apps/backend/`
- ✅ **test-runner**: Coordinates test execution with watch mode if needed

**Perfect for:**

- Comprehensive codebase analysis
- Multi-domain feature development
- Full-stack implementation tasks
- Large refactoring efforts
- Getting parallel expert perspectives

**Execution Instructions:**
When this command is invoked, spawn all 4 subagents simultaneously and coordinate their work:

```markdown
Please spawn the following subagents in parallel to work together:
1. code-reviewer - for code quality and security reviews (read-only analysis)
2. frontend-specialist - for React/TypeScript frontend work (apps/frontend/)
3. backend-specialist - for API/database backend work (api/, apps/backend/)
4. test-runner - for test execution and analysis (all test suites)

All agents should:
- Work in parallel with isolated file scopes
- Coordinate through the main agent if cross-domain work is needed
- Provide updates on their progress
- Report any issues or conflicts
```

**After agents complete their work:**
- Aggregate results from all agents
- Present a unified summary
- Highlight any conflicts or coordination needed

**Note:** All agents are decoupled and safe to run simultaneously. Each agent operates within its defined file scope boundaries to prevent conflicts.
