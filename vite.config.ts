import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function apiPlugin(): Plugin {
  return {
    name: 'agora-api',
    async configureServer(server) {
      const { handleApi } = await import('./server/api.mjs');
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        try {
          const handled = await handleApi(req, res);
          if (!handled) next();
        } catch (err) {
          next(err as Error);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
