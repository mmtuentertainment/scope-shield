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
          src: 'assets/**/*',
          dest: 'assets'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
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
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
