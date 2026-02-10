# Shared Configuration Directory

This directory contains shared configuration files used across the monorepo workspaces.

## Available Configurations

### ESLint
- **File**: `eslint.config.js`
- **Purpose**: Main ESLint configuration for the frontend workspace
- **Usage**: Extended by root `eslint.config.js` for e2e tests
- **Features**: 
  - TypeScript support with strict rules
  - React hooks and accessibility (WCAG 2.1 AA)
  - Tailwind CSS linting
  - Import organization
  - Prettier integration

### CommitLint
- **File**: `commitlint.config.cjs`
- **Purpose**: Commit message validation using conventional commits
- **Usage**: Referenced by Husky pre-commit hook
- **Rules**:
  - Type enum: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
  - Subject case: no start-case, pascal-case, or upper-case
  - Header max length: 100 characters
  - No trailing periods in subject

### Jest
- **File**: `jest.config.cjs`
- **Purpose**: Root-level Jest configuration to prevent test discovery in wrong directories
- **Usage**: Only backend workspace uses Jest; frontend uses Vitest, API uses Node.js test runner
- **Features**:
  - Restricts test discovery to backend directory only
  - Ignores frontend, API, and e2e test directories
  - Prevents conflicts with other test runners

### Prettier
- **Files**: 
  - `.prettierrc` - Formatting rules
  - `.prettierignore` - Files to ignore during formatting
- **Purpose**: Consistent code formatting across the project
- **Usage**: Referenced in package.json scripts with `--config` and `--ignore-path` flags
- **Settings**:
  - No semicolons
  - Single quotes
  - 2-space indentation
  - 80 character line width
  - Trailing commas in ES5

### Components
- **File**: `components.json`
- **Purpose**: ShadCN UI component library configuration
- **Style**: Default (slate-based color scheme)
- **Usage**: Used by `npx shadcn-ui@latest add` command

## Referencing Configurations

When referencing these configs from workspace scripts, use relative paths:

```json
{
  "scripts": {
    "format": "prettier --write . --config ../../tools/configs/.prettierrc --ignore-path ../../tools/configs/.prettierignore"
  }
}
```

For Husky hooks:

```sh
npx --no -- commitlint --edit "$1" --config tools/configs/commitlint.config.cjs
```

## Adding New Shared Configurations

1. Place the config file in this directory
2. Update this README to document the new configuration
3. Update workspace scripts to reference the new config
4. Ensure relative paths work from all workspace directories