import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Readable } from 'stream';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Opt out of Vite's broad VITE_* injection. Only these two public gallery
    // settings may reach the client, including when code reads import.meta.env.
    envPrefix: [],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'private-server-api-and-env-guard',
        configResolved(config) {
          if (config.command !== 'build') return;
          const allowed = new Set(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);
          // Vercel automatically provides VITE_VERCEL_* build metadata. Accept
          // its presence without adding it to the browser's explicit allowlist.
          const exposed = Object.keys(env).filter(key => key.startsWith('VITE_') && !key.startsWith('VITE_VERCEL_') && !allowed.has(key));
          if (exposed.length) throw new Error(`Unapproved browser environment variables: ${exposed.join(', ')}`);
          const publicKey = env.VITE_SUPABASE_ANON_KEY || '';
          if (publicKey.startsWith('sb_secret_')) throw new Error('A server secret was assigned to the public Supabase key.');
          try {
            const role = JSON.parse(Buffer.from(publicKey.split('.')[1] || '', 'base64url').toString()).role;
            if (role === 'service_role') throw new Error('A privileged Supabase key cannot be exposed to the browser.');
          } catch (error) { if (error instanceof Error && error.message.includes('privileged')) throw error; }
        },
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const route = req.url?.split('?')[0];
            if (!['/api/report', '/api/admin'].includes(route || '')) return next();
            try {
              for (const key of ['DISCORD_WEBHOOK_URL', 'SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'SECURITY_LOG_SALT']) {
                if (env[key]) process.env[key] = env[key];
              }
              const reportModule = await server.ssrLoadModule(`${route}.ts`);
              const handler = reportModule.default;

              const url = `http://${req.headers.host || 'localhost:3000'}${req.url}`;
              const webReq = new Request(url, {
                method: req.method,
                headers: req.headers as any,
                ...(!['GET', 'HEAD'].includes(req.method || '') ? { body: Readable.toWeb(req as any) as any } : {}),
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
              res.end(JSON.stringify({ error: 'The request could not be completed.' }));
            }
          });
        },
      },
    ],
    build: { sourcemap: false },
    esbuild: { drop: ['debugger'], pure: ['console.log', 'console.debug'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 3000,
      cors: false,
      fs: { strict: true, deny: ['.env', '.env.*', '**/.git/**', '**/*.pem', '**/*.key', '**/server/**', '**/docs/security/**'] },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
