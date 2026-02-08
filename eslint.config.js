import eslintConfig from './apps/frontend/eslint.config.js'

// Root ESLint config that extends frontend config for tests/e2e
export default [
  ...eslintConfig,
  {
    // Override for e2e tests that need allowDefaultProject
    files: ['tests/e2e/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: true,
        },
      },
    },
  }
]
