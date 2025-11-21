import { defineConfig } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [
    webExtension({
      manifest: JSON.parse(readFileSync('./src/manifest.json', 'utf-8'))
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'assets/icons/*.png',
          dest: 'assets/icons'
        },
        {
          src: 'src/options/options.html',
          dest: 'src/options'
        },
        {
          src: 'src/options/options-standalone.js',
          dest: 'src/options'
        },
        {
          src: 'src/options/options.css',
          dest: 'src/options'
        }
      ]
    })
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 600
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  optimizeDeps: {
    include: []
  }
});
