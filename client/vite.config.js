/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL)
      ? {}
      : {
          '/api': {
            target: 'http://localhost:4000',
            changeOrigin: true,
          },
        },
  },
});


