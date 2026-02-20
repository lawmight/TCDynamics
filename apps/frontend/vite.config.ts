import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// ESM-compatible __dirname (required for Vite 7+ on Linux/Vercel)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Get environment variables for HTML replacement
  const frontendUrl =
    process.env.VITE_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    'https://tcdynamics.fr'
  const apiUrl =
    process.env.VITE_API_URL ||
    process.env.API_URL ||
    'https://api.tcdynamics.fr'

  return {
    server: {
      host: '127.0.0.1',
      port: 3000,
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
      react(),
      Icons({ compiler: 'jsx' }),
      // HTML env variable replacement plugin
      {
        name: 'html-env-replace',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_FRONTEND_URL%/g, frontendUrl)
            .replace(/%API_URL%/g, apiUrl)
        },
      },
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
        '@': path.resolve(__dirname, 'src'),
      },
      // Required for Vite 7 on Linux - explicit TypeScript extension resolution
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
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
      exclude: ['@tcd/shared-types', '@tcd/shared-utils'],
      include: [
        'react',
        'react-dom',
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
  }
})
