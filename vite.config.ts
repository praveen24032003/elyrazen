import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const hmrEnabled = process.env.DISABLE_HMR !== 'true';
  const hmrPort = Number(process.env.HMR_PORT) || 24678;

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: hmrEnabled
        ? {
            port: hmrPort,
          }
        : false,
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

            if (id.includes('@react-three/drei')) {
              return 'three-drei';
            }

            if (id.includes('@react-three/fiber')) {
              return 'three-fiber';
            }

            if (id.includes('/three/')) {
              return 'three-core';
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            if (id.includes('motion')) {
              return 'motion-vendor';
            }

            if (id.includes('axios')) {
              return 'network-vendor';
            }

            return undefined;
          },
        },
      },
    },
  };
});
