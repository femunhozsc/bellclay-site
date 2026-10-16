import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local dev middleware that emulates Vercel /api/* routes during `npm run dev`
const infinitePayLocalApiPlugin = () => ({
  name: 'infinitepay-local-api',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (!req.url || !req.url.startsWith('/api/')) {
        return next();
      }

      const routePath = req.url.split('?')[0];
      let handlerModule: any = null;

      try {
        if (routePath === '/api/create-checkout') {
          handlerModule = await import('./api/create-checkout.js');
        } else if (routePath === '/api/payment-check') {
          handlerModule = await import('./api/payment-check.js');
        } else if (routePath === '/api/infinitepay-webhook') {
          handlerModule = await import('./api/infinitepay-webhook.js');
        } else {
          return next();
        }

        // Read request body
        let rawBody = '';
        for await (const chunk of req) {
          rawBody += chunk;
        }
        if (rawBody) {
          try {
            req.body = JSON.parse(rawBody);
          } catch {
            req.body = rawBody;
          }
        } else {
          req.body = {};
        }

        // Parse query parameters
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
        req.query = Object.fromEntries(urlObj.searchParams.entries());

        // Add Express/Vercel compatible helpers to res
        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        await handlerModule.default(req, res);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), infinitePayLocalApiPlugin()],
  server: {
    port: 3000,
  },
});
