import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    topLevelAwait(),
  ],
  server: {
    port: 5375
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util'
    }
  }
})
