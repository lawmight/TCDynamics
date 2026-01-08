import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type Plugin } from 'vite'
import { existsSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Use absolute path for alias resolution to ensure it works in monorepo/Vercel builds
const srcPath = path.resolve(__dirname, 'src')

// Custom plugin to ensure @/api/metrics resolves correctly in Vercel builds
const metricsResolverPlugin = (): Plugin => {
  return {
    name: 'metrics-resolver',
    resolveId(id) {
      // Handle @/api/metrics imports explicitly
      if (id === '@/api/metrics') {
        const possiblePaths = [
          path.resolve(srcPath, 'api', 'metrics.ts'),
          path.resolve(srcPath, 'api', 'metrics.tsx'),
          path.resolve(srcPath, 'api', 'metrics.js'),
        ]
        for (const filePath of possiblePaths) {
          if (existsSync(filePath)) {
            return filePath
          }
        }
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '127.0.0.1',
    port: 5173,
    // Proxy API requests to Vercel Dev (serverless functions with MongoDB)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    // Pre-warm frequently used files for faster dev server
    warmup: {
      clientFiles: [
        './src/components/**/*.tsx',
        './src/pages/**/*.tsx',
        './src/hooks/**/*.ts',
      ],
    },
  },
  plugins: [
    metricsResolverPlugin(),
    react(),
    // Sentry source maps plugin (production only)
    mode === 'production' &&
      process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release:
          process.env.SENTRY_RELEASE ||
          process.env.VERCEL_GIT_COMMIT_SHA ||
          'frontend-local',
        sourcemaps: {
          assets: './dist/**',
          ignore: ['node_modules'],
          rewriteSources: source => source.replace(/^\/@fs/, ''),
        },
      }),
    // Bundle analysis plugin - generates stats.html in dist/
    // Runs in both analyze mode and production builds
    (mode === 'analyze' || mode === 'production') &&
      visualizer({
        open: mode === 'analyze', // Auto-open browser in analyze mode
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Use treemap visualization
      }),
    // Image optimization removed (vite-plugin-imagemin vulns/Vercel issues)
    // Vite handles basic opt natively
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': srcPath,
    },
    // Explicit extension resolution order - TypeScript first for better Vercel compatibility
    extensions: ['.ts', '.tsx', '.mts', '.js', '.jsx', '.mjs', '.json'],
    // Ensure proper extension resolution during build
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    // Disable symlink preservation for Vercel builds (case-sensitive filesystem)
    preserveSymlinks: false,
  },
  build: {
    target: 'es2020', // Good balance of modern features + browser support
    minify: 'terser',
    modulePreload: {
      polyfill: false, // Modern targets; avoid extra preload polyfill cost
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          vendor: ['react', 'react-dom'],
          // React Router (if/when used extensively)
          router: ['react-router-dom'],
          // Radix UI components
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          // React Query for data fetching
          query: ['@tanstack/react-query'],
          // Icon library
          icons: ['lucide-react'],
          // Utility libraries
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
      // Size budget enforcement - fail build if exceeded
      onwarn(warning, warn) {
        // Fail on large chunks
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return // Ignore circular dependency warnings
        }
        warn(warning)
      },
    },
    // Stricter chunk size limits (down from 600KB)
    chunkSizeWarningLimit: 400,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs:
          mode === 'production'
            ? ['console.log', 'console.info', 'console.debug', 'console.warn']
            : [],
      },
    },
    // Generate sourcemaps in development and production (when Sentry is configured)
    // Sentry requires sourcemaps to map production errors back to source code
    sourcemap:
      mode === 'development' ||
      (mode === 'production' && !!process.env.SENTRY_AUTH_TOKEN),
    reportCompressedSize: false, // Disable gzip size reporting for faster builds
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@tanstack/react-query',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
    ],
  },
}))
