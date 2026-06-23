import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import build from '@hono/vite-build/vercel';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';

export default defineConfig(({ mode, command }) => {
  if (mode === 'client') {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        outDir: '.vercel/output/static',
        emptyOutDir: true,
        sourcemap: true,
      },
    };
  }

  if (command === 'serve') {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      server: {
        port: 3000,
        proxy: {
          '/api': {
            target: backendUrl,
            changeOrigin: true,
            cookieDomainRewrite: 'localhost',
            secure: false,
          },
        },
      },
    };
  }

  return {
    plugins: [
      build({
        entry: './src/server.ts',
        vercel: {
          name: 'api',
          routes: [{ src: '^/api(?:/.*)?$' }],
          function: {
            maxDuration: 30,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
