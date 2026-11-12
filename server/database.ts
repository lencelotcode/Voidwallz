import { createClient } from "@supabase/supabase-js";
import { HttpError, isProduction } from "./security";

export function serverDatabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith("https://") || url.includes("your-project-id")) throw new HttpError(503, "Server storage is not configured.");
  // Never send elevated credentials to a URL supplied by a request or an
  // accidentally mismatched public frontend configuration.
  const publicUrl = process.env.VITE_SUPABASE_URL;
  if (publicUrl && !publicUrl.includes("your-project-id") && new URL(publicUrl).origin !== new URL(url).origin) throw new HttpError(503, "Server storage is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, options) => fetch(input, { ...options, signal: AbortSignal.timeout(10_000) }) } });
}
const localBuckets = new Map<string, { tokens: number; updated: number }>();
export async function rateLimit(key: string, capacity: number, refillSeconds: number) {
  if (!isProduction() && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const now = Date.now(); const old = localBuckets.get(key) || { tokens: capacity, updated: now };
    const tokens = Math.min(capacity, old.tokens + (now - old.updated) / (refillSeconds * 1000));
    if (tokens < 1) throw new HttpError(429, "Too many requests. Please try later.");
    if (localBuckets.size > 10_000) localBuckets.clear();
    localBuckets.set(key, { tokens: tokens - 1, updated: now }); return;
  }
  const { data, error } = await serverDatabase().rpc("security_take_token", {
    p_key: key, p_capacity: capacity, p_refill_seconds: refillSeconds,
  });
  if (error || typeof data !== "boolean") throw new HttpError(503, "Request protection is unavailable.");
  if (!data) throw new HttpError(429, "Too many requests. Please try later.");
}
