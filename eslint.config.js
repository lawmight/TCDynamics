import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tailwindcss from 'eslint-plugin-tailwindcss'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['tests/e2e/third-party-resources.spec.ts'],
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
      'jsx-a11y': jsxA11y,
      tailwindcss,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...tailwindcss.configs.recommended.rules,
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: [
            'bg-primary',
            'hover:bg-primary',
            'text-primary',
            'border-primary',
            'bg-card',
            'text-card',
            'border-card',
            'bg-muted',
            'text-muted',
            'border-muted',
            'text-primary-foreground',
            'bg-primary-foreground',
            'border-border',
            'text-border',
            'bg-background',
            'text-background',
            'border-primary/20',
            'bg-primary/95',
            'bg-primary/20',
            'bg-primary/5',
            'text-primary/50',
            'text-primary/20',
            'bg-card/95',
            'bg-card/50',
            'flex-shrink-0',
          ],
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Requires type info
      '@typescript-eslint/prefer-optional-chain': 'off', // Requires type info
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
    },
  }
)
