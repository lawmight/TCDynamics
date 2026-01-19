module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console.log in backend
    'import/extensions': 'off', // Allow imports without extensions
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'semi': ['error', 'never'], // No semicolons per project standard
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
    'camelcase': 'off', // Allow snake_case (database fields)
    'func-names': 'off', // Allow anonymous functions
    'max-classes-per-file': 'off', // Allow multiple classes per file
    'radix': ['error', 'as-needed'], // Radix only when needed
    'no-use-before-define': ['error', { functions: false }], // Allow function hoisting
    'no-restricted-globals': ['error', 'event', 'fdescribe'], // Only restrict specific globals
    'prefer-destructuring': 'off', // Don't enforce destructuring
    'no-nested-ternary': 'warn', // Warn but don't error
    'no-useless-escape': 'error', // Keep this one
  },
  ignorePatterns: ['node_modules/', 'test-integration.js', 'dist/'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      globals: {
        NodeJS: 'readonly',
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-undef': 'off', // TypeScript handles this
      },
    },
    {
      files: ['**/*.test.js', '**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
