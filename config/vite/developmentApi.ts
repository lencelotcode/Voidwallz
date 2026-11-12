import { Readable } from 'node:stream';
import type { Plugin } from 'vite';
export function developmentApi(env: Record<string, string>): Plugin {
  return {
    name: 'local-api-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.split('?')[0];
        if (!['/api/report', '/api/admin'].includes(route || '')) return next();
        try {
          for (const key of [
            'DISCORD_WEBHOOK_URL',
            'SUPABASE_URL',
            'VITE_SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'ADMIN_PASSWORD_HASH',
            'ADMIN_SESSION_SECRET',
            'SECURITY_LOG_SALT',
          ]) {
            if (env[key]) process.env[key] = env[key];
          }
          const reportModule = await server.ssrLoadModule(`${route}.ts`);
          const handler = reportModule.default;

          const url = `http://${req.headers.host || 'localhost:3000'}${req.url}`;
          const webReq = new Request(url, {
            method: req.method,
            headers: req.headers as any,
            ...(!['GET', 'HEAD'].includes(req.method || '')
              ? { body: Readable.toWeb(req as any) as any }
              : {}),
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
          console.error('[dev-api] request_failed');
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'The request could not be completed.' }));
        }
      });
    },
  };
}
