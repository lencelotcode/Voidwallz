import { serverEnv } from '../config/env';
const encoder = new TextEncoder();
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function isProduction() {
  return serverEnv().production;
}
export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
}
export function assertOrigin(req: Request) {
  const url = new URL(req.url);
  const origin = req.headers.get('origin');
  const allowed = new Set(['https://voidwallz.live']);
  if (!isProduction() && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    allowed.add(url.origin);
  if (
    url.protocol !== 'https:' &&
    (isProduction() || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
  )
    throw new HttpError(400, 'HTTPS is required.');
  const sameOriginRead =
    req.method === 'GET' &&
    !origin &&
    allowed.has(url.origin) &&
    req.headers.get('sec-fetch-site') === 'same-origin';
  if (
    (!sameOriginRead && (!origin || !allowed.has(origin))) ||
    req.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new HttpError(403, 'Request origin is not allowed.');
  if (req.headers.get('x-voidwallz-request') !== '1')
    throw new HttpError(403, 'Request verification failed.');
}
export async function readBody(req: Request, maxBytes: number) {
  const length = req.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes))
    throw new HttpError(413, 'Request is too large.');
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Request is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return body;
}
export async function readJson(req: Request, limit = 4096) {
  if (req.headers.get('content-type')?.split(';')[0] !== 'application/json')
    throw new HttpError(415, 'JSON is required.');
  try {
    const value = JSON.parse(new TextDecoder().decode(await readBody(req, limit)));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Invalid JSON.');
  }
}
export async function readForm(req: Request, limit: number) {
  const type = req.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    throw new HttpError(415, 'A multipart form is required.');
  const body = await readBody(req, limit);
  try {
    return await new Response(body, { headers: { 'Content-Type': type } }).formData();
  } catch {
    throw new HttpError(400, 'Invalid form data.');
  }
}
export function textField(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== 'string') throw new HttpError(400, `Invalid ${label}.`);
  const text = value.trim();
  if (
    text.length < min ||
    text.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)
  )
    throw new HttpError(400, `Invalid ${label}.`);
  return text;
}
export async function digest(value: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function clientKey(req: Request) {
  // Vercel overwrites this header at its trusted edge. Do not deploy this API
  // behind an arbitrary proxy without providing an equivalent trusted IP source.
  const ip = isProduction()
    ? req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for')
    : 'local-development';
  if (!ip || ip.length > 200) throw new HttpError(503, 'Request protection is unavailable.');
  const salt = serverEnv().securityLogSalt;
  if (isProduction() && (!salt || salt.length < 32))
    throw new HttpError(503, 'Request protection is unavailable.');
  return (await digest(`${salt || 'development-only'}:${ip.split(',')[0].trim()}`)).slice(0, 32);
}
export function logSecurity(
  event: string,
  details: { requestId: string; client?: string; status?: number },
) {
  console.warn(JSON.stringify({ event, ...details, time: new Date().toISOString() }));
}
export function errorResponse(error: unknown, requestId: string) {
  const status = error instanceof HttpError ? error.status : 500;
  logSecurity(status === 429 ? 'rate_limit' : status < 500 ? 'request_rejected' : 'server_error', {
    requestId,
    status,
  });
  return json(
    {
      error: error instanceof HttpError ? error.message : 'The request could not be completed.',
      requestId,
    },
    status,
    status === 429 ? { 'Retry-After': '120' } : {},
  );
}
