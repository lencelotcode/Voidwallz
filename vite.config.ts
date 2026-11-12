import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { environmentGuard, browserDefines } from './config/vite/environmentGuard';
import { developmentApi } from './config/vite/developmentApi';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Private keys and deployment metadata are never injected implicitly.
    envPrefix: [],
    define: browserDefines(env),
    plugins: [react(), tailwindcss(), environmentGuard(env), developmentApi(env)],
    build: { sourcemap: false },
    esbuild: { drop: ['debugger'], pure: ['console.log', 'console.debug'] },
    server: {
      host: '127.0.0.1',
      port: 3000,
      cors: false,
      fs: {
        strict: true,
        deny: [
          '.env',
          '.env.*',
          '**/.git/**',
          '**/*.pem',
          '**/*.key',
          '**/server/**',
          '**/docs/security/**',
        ],
      },
      // Keep the existing development-session motion/HMR preference.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
