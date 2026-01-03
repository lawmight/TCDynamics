# Implement Cursor Rules from Oracle Research Report

## Source Document

@docs/oracle-session-649640e5-258c-482b-a1e8-72e0f918c26c.md

---

## Critical Instructions

### Step 1: Read the Entire Source File

The Oracle research report above is **1,340 lines long**. You MUST read it completely before proceeding:

1. Use `view_file` to read lines **1-800**
2. Use `view_file` to read lines **801-1340**

**Do NOT proceed until both sections have been read.**

---

### Step 2: Create All Rule Files

Extract the complete `.mdc` rule files from the "Research Report" section (lines 30-649) and create them in the following structure:

```
.cursor/rules/
├── always/
│   ├── code-style.mdc
│   ├── security.mdc
│   └── accessibility.mdc
├── backend/
│   ├── api-patterns.mdc
│   └── validation.mdc
├── frontend/
│   ├── components.mdc
│   └── hooks.mdc
├── api/
│   └── serverless.mdc
└── testing/
    ├── unit-tests.mdc
    └── e2e-tests.mdc
```

Each file's content is provided in full in the research report, wrapped in markdown code blocks starting with the file path as a header (e.g., `### .cursor/rules/always/code-style.mdc`).

---

### Step 3: Complete the Serverless Rules

The `serverless.mdc` section was **cut off at line 649** in the report. To complete it:

1. Examine the `api/` folder for Vercel serverless function patterns
2. Reference `api/_lib/auth.js` for Supabase JWT verification patterns
3. Create a complete rule file covering:
   - ESM module structure for Vercel functions
   - Error handling and response format
   - Supabase auth verification pattern
   - CORS headers handling
   - Request validation patterns

---

### Step 4: Preserve Existing Files

**Keep** the existing `.cursor/rules/nia-oracle.mdc` file - do NOT overwrite or delete it.

---

### Step 5: Validate Completion

After creating all files, run:

```powershell
Get-ChildItem -Path ".cursor/rules" -Recurse
```

Confirm all subdirectories and files were created correctly.

---

## Tech Stack Context

For reference, here's the project's tech stack (already researched in the report):

| Layer        | Technologies                                                |
| ------------ | ----------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, ShadCN UI (Radix) |
| **Backend**  | Node.js, Express, TypeScript                                |
| **Database** | Supabase (PostgreSQL)                                       |
| **API**      | Vercel serverless functions                                 |
| **Payments** | Polar                                                       |
| **AI**       | Vertex AI                                                   |
| **Testing**  | Vitest, React Testing Library, Playwright E2E               |
| **CI/CD**    | GitHub Actions, Vercel                                      |

---

## Summary Checklist

- [ ] Read lines 1-800 of the Oracle report
- [ ] Read lines 801-1340 of the Oracle report
- [ ] Create `.cursor/rules/always/` directory with 3 files
- [ ] Create `.cursor/rules/backend/` directory with 2 files
- [ ] Create `.cursor/rules/frontend/` directory with 2 files
- [ ] Create `.cursor/rules/api/` directory with 1 file (complete the cut-off content)
- [ ] Create `.cursor/rules/testing/` directory with 2 files
- [ ] Preserve existing `nia-oracle.mdc`
- [ ] Validate all files were created
