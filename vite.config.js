import { defineConfig } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: '', // CRITICAL: Use relative paths for Chrome extensions
  plugins: [
    webExtension({
      manifest: {
        manifest_version: 3,
        name: "ScopeShield",
        version: pkg.version,
        description: "Automatically detect scope creep in freelance projects and generate billable change orders",
        permissions: [
          "activeTab",
          "storage",
          "notifications"
        ],
        host_permissions: [
          "*://mail.google.com/*"
        ],
        background: {
          service_worker: "src/background/service-worker.js",
          type: "module"
        },
        content_scripts: [
          {
            matches: ["*://mail.google.com/*"],
            js: ["src/content/content.js"],
            css: ["src/content/content-styles.css"],
            run_at: "document_idle",
            all_frames: false
          }
        ],
        action: {
          default_popup: "src/popup/popup.html",
          default_icon: {
            "16": "assets/icons/icon16.png",
            "48": "assets/icons/icon48.png",
            "128": "assets/icons/icon128.png"
          }
        },
        icons: {
          "16": "assets/icons/icon16.png",
          "48": "assets/icons/icon48.png",
          "128": "assets/icons/icon128.png"
        },
        options_page: "src/options/options.html"
      },
      additionalInputs: {
        html: ["src/options/options.html"],
        scripts: []
      }
    })
  ],
  build: {
    target: 'esnext', // T003: Chrome 92+ supports modern JS (crypto.randomUUID, etc.)
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging
    minify: false, // TEMP: Disable minification to preserve initialization code
    chunkSizeWarningLimit: 600, // T006: Warn if chunks exceed 600KB
    rollupOptions: {
      treeshake: false // CRITICAL: Preserve initialization code in popup.js
    },
    // T005: Terser options for maximum compression
    terserOptions: {
      compress: {
        // Remove only debug logs, preserve console.error/warn for production error reporting
        pure_funcs: ['console.log', 'console.debug', 'console.trace'],
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
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  // Optimize dependencies during dev
  optimizeDeps: {
    include: [] // jsPDF lazy-loaded, don't pre-bundle
  }
});
