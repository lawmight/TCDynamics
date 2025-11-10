import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwindcss from 'eslint-plugin-tailwindcss';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'public/**',
      '*.config.{js,ts,mjs}',
      '**/*.config.{js,ts,mjs}',
      'playwright-report/**',
      '*.js', // Ignore root-level .js files
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // project: './tsconfig.json', // Commented out to avoid project-wide type checking
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        RequestInit: 'readonly',
        AbortController: 'readonly',
        Window: 'readonly',
        localStorage: 'readonly',
        FormData: 'readonly',
        alert: 'readonly',
        PerformanceObserver: 'readonly',
        PerformanceObserverInit: 'readonly',
        // DOM types
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        // React types
        React: 'readonly',
        JSX: 'readonly',
        // Node globals (for config files)
        global: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'jsx-a11y': jsxA11y,
      'tailwindcss': tailwindcss,
      'import': importPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // TypeScript strict rules
      ...typescript.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Accessibility - WCAG 2.1 AA Level
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': ['error', {
        elements: ['img', 'object', 'area', 'input[type="image"]'],
      }],
      'jsx-a11y/anchor-is-valid': ['error', {
        components: ['Link'],
        specialLink: ['to'],
      }],
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': ['error', {
        required: { some: ['nesting', 'id'] },
      }],
      'jsx-a11y/no-autofocus': ['warn', { ignoreNonDOM: true }],
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',

      // Tailwind CSS
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off', // Allow custom classes
      'tailwindcss/no-contradicting-classname': 'error',

      // Import organization
      'import/order': ['warn', {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      }],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      'jsx-a11y': {
        components: {
          // Map custom components to standard HTML elements
          Button: 'button',
          Input: 'input',
          Textarea: 'textarea',
          Select: 'select',
          Link: 'a',
        },
        polymorphicPropName: 'as', // For components with "as" prop
      },
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva'],
        config: 'tailwind.config.ts',
      },
    },
  },
  prettier, // Must be last to override other configs
];
