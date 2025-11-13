import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/manifest.json',
          dest: '.'
        },
        {
          src: 'src/content/content.css',
          dest: 'content'
        },
        {
          src: 'assets/**/*',
          dest: 'assets'
        },
        {
          src: 'src/assets/templates/**/*',
          dest: 'assets/templates'
        }
      ]
    })
  ],
  build: {
    target: 'esnext', // T003: Chrome 92+ supports modern JS (crypto.randomUUID, etc.)
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging
    minify: 'terser', // Better compression than esbuild
    chunkSizeWarningLimit: 600, // T006: Warn if chunks exceed 600KB
    rollupOptions: {
      input: {
        'popup': resolve(__dirname, 'src/popup/popup.html'),
        'options': resolve(__dirname, 'src/options/options.html'),
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.js'),
        'content/content': resolve(__dirname, 'src/content/content.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // Prevent code splitting by returning undefined for all modules
        manualChunks: undefined
      },
      // CRITICAL: Preserve entry signatures to prevent merging
      preserveEntrySignatures: 'strict'
    },
    // T005: Terser options for maximum compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 2 // Multiple compression passes
      },
      format: {
        comments: false // Remove comments
      }
    }
  },
  // T007: Define global constants
  define: {
    __APP_VERSION__: JSON.stringify('0.2.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  // Optimize dependencies during dev
  optimizeDeps: {
    include: [] // jsPDF lazy-loaded, don't pre-bundle
  }
});
