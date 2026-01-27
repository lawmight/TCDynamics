import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/', 'node_modules/', 'test-integration.js'],
  },
  // JavaScript files configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // Backend-specific rules
      'no-console': 'off', // Allow console.log in backend
      'import/extensions': 'off', // Allow imports without extensions
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      semi: ['error', 'never'], // No semicolons per project standard
      'import/prefer-default-export': 'off',
      'comma-dangle': ['error', 'always-multiline'], // Trailing commas per project standard
      'arrow-parens': ['error', 'as-needed'], // Parens only when needed
      'max-len': ['error', { code: 120 }], // Increase max line length
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'consistent-return': 'off', // Allow implicit undefined returns
      'no-underscore-dangle': 'off', // Allow underscores (CSRF tokens, etc.)
      'no-plusplus': 'off', // Allow ++ and --
      'no-await-in-loop': 'off', // Allow await in loops
      'no-restricted-syntax': 'off', // Allow for...in and for...of loops
      'global-require': 'off', // Allow require() inside functions (for dynamic imports)
      camelcase: 'off', // Allow snake_case (database fields)
      'func-names': 'off', // Allow anonymous functions
      'max-classes-per-file': 'off', // Allow multiple classes per file
      radix: ['error', 'as-needed'], // Radix only when needed
      'no-use-before-define': ['error', { functions: false }], // Allow function hoisting
      'no-restricted-globals': ['error', 'event', 'fdescribe'], // Only restrict specific globals
      'prefer-destructuring': 'off', // Don't enforce destructuring
      'no-nested-ternary': 'warn', // Warn but don't error
      'no-useless-escape': 'error', // Keep this one
    },
  },
  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        NodeJS: 'readonly',
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,

      // Backend-specific rules
      'no-console': 'off', // Allow console.log in backend
      'import/extensions': 'off', // Allow imports without extensions
      'no-unused-vars': 'off', // Handled by TypeScript ESLint
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      semi: ['error', 'never'], // No semicolons per project standard
      'import/prefer-default-export': 'off',
      'comma-dangle': ['error', 'always-multiline'], // Trailing commas per project standard
      'arrow-parens': ['error', 'as-needed'], // Parens only when needed
      'max-len': ['error', { code: 120 }], // Increase max line length
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'consistent-return': 'off', // Allow implicit undefined returns
      'no-underscore-dangle': 'off', // Allow underscores (CSRF tokens, etc.)
      'no-plusplus': 'off', // Allow ++ and --
      'no-await-in-loop': 'off', // Allow await in loops
      'no-restricted-syntax': 'off', // Allow for...in and for...of loops
      'global-require': 'off', // Allow require() inside functions (for dynamic imports)
      camelcase: 'off', // Allow snake_case (database fields)
      'func-names': 'off', // Allow anonymous functions
      'max-classes-per-file': 'off', // Allow multiple classes per file
      radix: ['error', 'as-needed'], // Radix only when needed
      'no-use-before-define': ['error', { functions: false }], // Allow function hoisting
      'no-restricted-globals': ['error', 'event', 'fdescribe'], // Only restrict specific globals
      'prefer-destructuring': 'off', // Don't enforce destructuring
      'no-nested-ternary': 'warn', // Warn but don't error
      'no-useless-escape': 'error', // Keep this one

      // TypeScript-specific rules
      'no-undef': 'off', // TypeScript handles this
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]
