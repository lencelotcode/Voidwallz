import { serverDatabase } from '../infrastructure/database';
import { HttpError, isProduction } from './security';
import { serverEnv } from '../config/env';
const localBuckets = new Map<string, { tokens: number; updated: number }>();
export async function rateLimit(key: string, capacity: number, refillSeconds: number) {
  if (!isProduction() && !serverEnv().databaseKey) {
    const now = Date.now();
    const old = localBuckets.get(key) || { tokens: capacity, updated: now };
    const tokens = Math.min(capacity, old.tokens + (now - old.updated) / (refillSeconds * 1000));
    if (tokens < 1) throw new HttpError(429, 'Too many requests. Please try later.');
    if (localBuckets.size > 10_000) localBuckets.clear();
    localBuckets.set(key, { tokens: tokens - 1, updated: now });
    return;
  }
  const { data, error } = await serverDatabase().rpc('security_take_token', {
    p_key: key,
    p_capacity: capacity,
    p_refill_seconds: refillSeconds,
  });
  if (error || typeof data !== 'boolean')
    throw new HttpError(503, 'Request protection is unavailable.');
  if (!data) throw new HttpError(429, 'Too many requests. Please try later.');
}
