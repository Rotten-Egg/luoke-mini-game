import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api/app': {
        target: 'http://2706xxdt3506.vicp.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/app/, '/api/app')
      }
    }
  }
});