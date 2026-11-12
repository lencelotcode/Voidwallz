import type { Plugin } from 'vite';
export const PUBLIC_BROWSER_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
export function browserDefines(env: Record<string, string>) {
  return Object.fromEntries(
    PUBLIC_BROWSER_KEYS.map((key) => [`import.meta.env.${key}`, JSON.stringify(env[key] || '')]),
  );
}
export function environmentGuard(env: Record<string, string>): Plugin {
  return {
    name: 'browser-environment-guard',
    configResolved(config) {
      if (config.command !== 'build') return;
      const allowed = new Set<string>(PUBLIC_BROWSER_KEYS);
      // Deployment metadata and the retired client passkey may remain in an
      // existing hosting project. Neither is exposed by the explicit define
      // list above; the passkey never authorizes the server-side studio.
      const exposed = Object.keys(env).filter(
        (key) =>
          key.startsWith('VITE_') &&
          !key.startsWith('VITE_VERCEL_') &&
          key !== 'VITE_ADMIN_PASSKEY' &&
          !allowed.has(key),
      );
      if (exposed.length)
        throw new Error(`Unapproved browser environment variables: ${exposed.join(', ')}`);
      if (env.VITE_ADMIN_PASSKEY)
        console.warn(
          '[security] Ignoring retired VITE_ADMIN_PASSKEY. Remove this obsolete setting from the hosting environment; studio login uses server-only credentials.',
        );
      const publicKey = env.VITE_SUPABASE_ANON_KEY || '';
      if (publicKey.startsWith('sb_secret_'))
        throw new Error('A server secret was assigned to the public Supabase key.');
      try {
        const role = JSON.parse(
          Buffer.from(publicKey.split('.')[1] || '', 'base64url').toString(),
        ).role;
        if (role === 'service_role')
          throw new Error('A privileged Supabase key cannot be exposed to the browser.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('privileged')) throw error;
      }
    },
  };
}
