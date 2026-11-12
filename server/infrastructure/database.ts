import { serverEnv } from '../config/env';
import { createClient } from '@supabase/supabase-js';
import { HttpError, isProduction } from '../http/security';

export function serverDatabase() {
  const url = serverEnv().databaseUrl;
  const key = serverEnv().databaseKey;
  if (!url || !key || !url.startsWith('https://') || url.includes('your-project-id'))
    throw new HttpError(503, 'Server storage is not configured.');
  // Never send elevated credentials to a URL supplied by a request or an
  // accidentally mismatched public frontend configuration.
  const publicUrl = serverEnv().publicDatabaseUrl;
  try {
    if (
      publicUrl &&
      !publicUrl.includes('your-project-id') &&
      new URL(publicUrl).origin !== new URL(url).origin
    )
      throw new Error();
    new URL(url);
  } catch {
    throw new HttpError(503, 'Server storage is not configured.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, options) => fetch(input, { ...options, signal: AbortSignal.timeout(10_000) }),
    },
  });
}
