import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '../../config/clientEnv';

/** Public, read-only catalogue client. Elevated credentials are never imported here. */
export const supabase = clientEnv.galleryConfigured
  ? createClient(clientEnv.supabaseUrl, clientEnv.supabasePublicKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (url, options) =>
          fetch(url, {
            ...options,
            signal: options?.signal
              ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)])
              : AbortSignal.timeout(15_000),
          }),
      },
    })
  : null;
