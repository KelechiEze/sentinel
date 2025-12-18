import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'https://sentinel-production-3479.up.railway.app',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api prefix
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log(`🔄 Proxying: ${req.method} ${req.url}`);
                // Add necessary headers
                proxyReq.setHeader('Host', 'sentinel-production-3479.up.railway.app');
                proxyReq.setHeader('Origin', 'http://localhost:3000');
              });
            },
            // Add timeout and retry options
            proxyTimeout: 30000,
            timeout: 30000
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_RAILWAY_URL': JSON.stringify('https://sentinel-production-3479.up.railway.app')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: true
      }
    };
});