import react from '@vitejs/plugin-react';

import { defineConfig, loadEnv } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());
  console.log('Loaded environment variables:', env); // Debugging line
  return {
    plugins: [react(),topLevelAwait(),],
        define: {
      global: 'globalThis',
    },
      build: {
    outDir: 'dist',
  },
   base: '/',
  server: {
    port: 5375, // Vite development server port
    // proxy: {
    //     '/api': {target: env.VITE_PROXY_URL || 'http://localhost:8033', // Fallback if VITE_PROXY_URL is not set
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''), // Adjust according to backend routes}
    //   },
    // },
  },
  };
});