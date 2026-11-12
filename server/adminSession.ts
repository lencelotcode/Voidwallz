import { HttpError, isProduction, digest } from "./security";
const encoder = new TextEncoder();
const ITERATIONS = 600_000;
const SESSION_SECONDS = 30 * 60;
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
function bytes(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid encoding");
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
}
async function passwordBits(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, key, 256));
}
export async function hashPassword(password: string) {
  if (password.length < 16 || password.length > 256) throw new Error("Use a unique password of 16–256 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256:${ITERATIONS}:${b64(salt)}:${b64(await passwordBits(password, salt))}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, iterations, salt, hash, extra] = encoded.split(":");
  if (algorithm !== "pbkdf2-sha256" || iterations !== String(ITERATIONS) || extra || !salt || !hash) throw new HttpError(503, "Admin authentication is not configured.");
  try {
    const expected = bytes(hash); const saltBytes = bytes(salt);
    if (expected.length !== 32 || saltBytes.length !== 16) throw new Error();
    const actual = await passwordBits(password, saltBytes);
    let difference = expected.length ^ actual.length;
    for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ actual[i];
    return difference === 0;
  } catch { throw new HttpError(503, "Admin authentication is not configured."); }
}
function cookieName() { return isProduction() ? "__Host-vw_admin" : "vw_admin_dev"; }
async function sessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new HttpError(503, "Admin authentication is not configured.");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function createSession() {
  const csrf = b64(crypto.getRandomValues(new Uint8Array(32)));
  const payload = b64(encoder.encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS, csrf, version: await digest(process.env.ADMIN_PASSWORD_HASH || "") })));
  const signature = b64(new Uint8Array(await crypto.subtle.sign("HMAC", await sessionKey(), encoder.encode(payload))));
  return { csrf, cookie: `${cookieName()}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${isProduction() ? "; Secure" : ""}` };
}
export function clearSessionCookie() { return `${cookieName()}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction() ? "; Secure" : ""}`; }
export async function requireSession(req: Request, csrfRequired = false) {
  const value = req.headers.get("cookie")?.split(";").map(c => c.trim()).find(c => c.startsWith(`${cookieName()}=`))?.slice(cookieName().length + 1);
  if (!value || value.length > 2048) throw new HttpError(401, "Sign in to the publishing studio.");
  try {
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra || !(await crypto.subtle.verify("HMAC", await sessionKey(), bytes(signature), encoder.encode(payload)))) throw new Error();
    const data = JSON.parse(new TextDecoder().decode(bytes(payload)));
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(data.exp) || data.exp <= now || data.exp > now + SESSION_SECONDS || typeof data.csrf !== "string" || data.csrf.length !== 43 || data.version !== await digest(process.env.ADMIN_PASSWORD_HASH || "")) throw new Error();
    if (csrfRequired && req.headers.get("x-csrf-token") !== data.csrf) throw new HttpError(403, "Request verification failed.");
    return data as { exp: number; csrf: string; version: string };
  } catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(401, "Your studio session has expired. Sign in again."); }
}
