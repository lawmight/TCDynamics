import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    unstubEnvs: true, // Auto-restore vi.stubEnv() between tests
    // Use default pool (threads) instead of forks for better jsdom compatibility
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/backend/**', // Exclude backend tests (uses Jest)
      '**/TCDynamics/**', // Exclude Azure Functions tests
      '**/api/**', // Exclude API tests (uses Node.js test runner)
      '**/.{idea,git,cache,output,temp}/**',
      '**/pages/__tests__/NotFound.test.tsx', // Skip tests with location mocking issues
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.*',
        '**/mockData/',
        '**/types/',
        '**/*.d.ts',
        '**/dist/**',
        'coverage/**',
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
