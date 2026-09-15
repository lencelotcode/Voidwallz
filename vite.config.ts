import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Readable } from 'stream';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api-report-handler',
        configureServer(server) {
          server.middlewares.use('/api/report', async (req, res, next) => {
            if (req.method !== 'POST') {
              return next();
            }
            try {
              if (env.DISCORD_WEBHOOK_URL) {
                process.env.DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
              }
              const reportModule = await server.ssrLoadModule('/api/report.ts');
              const handler = reportModule.default;

              const url = `http://${req.headers.host || 'localhost:3000'}${req.url}`;
              const webReq = new Request(url, {
                method: req.method,
                headers: req.headers as any,
                body: Readable.toWeb(req as any) as any,
                duplex: 'half',
              } as any);

              const webRes: Response = await handler(webReq);
              res.statusCode = webRes.status;
              webRes.headers.forEach((value: string, key: string) => {
                res.setHeader(key, value);
              });
              const text = await webRes.text();
              res.end(text);
            } catch (err: any) {
              console.error('[dev-api] Error handling /api/report:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
