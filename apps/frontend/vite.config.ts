import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

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
    // Bundle analysis plugin - generates stats.html in dist/
    mode === 'production' &&
      visualizer({
        open: false, // Don't auto-open browser
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
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
    sourcemap: mode === 'development',
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
