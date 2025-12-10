import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
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
      '@': path.resolve(__dirname, './src'),
    },
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
