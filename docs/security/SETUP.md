# Security deployment checklist

These changes are prepared locally. They are not a statement that production is already protected.
Do not deploy the new write endpoints until the database migration and server environment are configured.

1. Sign in to the Supabase project used by the live site. The public gallery currently references project **wrvgosqpjqrthmtpzmrm**. The local `.env` / `.env.local` gallery settings are placeholders; do not apply changes to a different project based on them.
2. Take a database backup. Inspect existing `public.void_packs` and `storage.objects` policies/grants. Review and apply `supabase/migrations/20261111_security_hardening.sql`. It prevents browser roles from writing packs/wallpaper objects, preserves public artwork reads, and creates a server-only atomic token bucket. It does not delete existing content. Other tables/functions still need a provider-side audit; the migration deliberately does not rewrite unknown application schemas.
3. Run `supabase/tests/security.test.sql` with pgTAP on a disposable/staging copy. It is supplied but has not been run in this session. Verify anon/authenticated writes fail, artwork reads work, and the rate-limit RPC is inaccessible to browser roles.
4. In your own terminal run `npm run security:setup`. Choose a new, unique password of at least 16 characters. Do not reuse the previous client-side passkey. The helper writes a salted PBKDF2 hash and new random session/logging secrets to ignored `.env.local`, without saving or printing the password. It does not update the hosting provider.
5. Configure these **server-only** hosting environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `SECURITY_LOG_SALT`, and `DISCORD_WEBHOOK_URL`. Never use the `VITE_` prefix for them. Supply hash/secrets exactly, without adding literal quote characters in the hosting dashboard. The public frontend needs only `VITE_SUPABASE_URL` and a publishable/anon `VITE_SUPABASE_ANON_KEY`.
6. Deploy the reviewed commit to Vercel using `npm run build`. Vercel provides the HTTP-to-HTTPS redirect; this project supplies HSTS and rejects non-HTTPS production API requests. Verify the actual redirect and response headers after deploy. The API trusts the client-IP header overwritten by Vercel; another host/proxy needs an equivalent trusted IP configuration.
7. Verify `/api/admin` rejects unauthenticated requests, the old passkey/session-storage flag cannot grant access, studio sign-in works, cookies have `Secure`, `HttpOnly`, `SameSite=Strict`, and the session expires after 30 minutes. Logout clears the browser cookie; a stolen stateless token can remain valid until expiry. Rotating the session secret or password hash invalidates all existing tokens.
8. Verify reports with valid consent reach your Discord destination, failures never report success, invalid/over-limit uploads are rejected, and repeated requests receive 429. **No real reports or uploads were sent during tests in this review.** Request protection fails closed with 503 if server credentials or the rate-limit RPC are missing.
9. Validate the CSP on the deployed site, including Google Fonts and Supabase artwork/downloads. It allows inline styles required by GSAP, but not inline scripts/eval. Third-party image/CDN domains other than `*.supabase.co` require an explicit allowlist update. Admin metadata is noindex and APIs return no-store.
10. Review deployment logs/retention/alerting. Security logs contain event IDs, status and salted address digests, not passwords, session tokens, webhook URLs, report contents or full addresses. Configure alerting in the hosting provider; no external monitoring subscription was created.

## Operational limits

- Reports: title 3–160 characters; description 10–3,500; screenshot PNG/JPEG/WebP up to 2 MB.
- Publishing: 1–5 PNG/JPEG/WebP images, **3 MB combined** (kept below the serverless request limit), dimensions at most 16,384 per side and 80 million pixels. SVG/HTML and mismatched signatures/MIME types are rejected. Validation does not replace antivirus scanning or a full image re-encoding pipeline.
- Studio authentication: one server-configured administrator password; no public sign-up or email reset endpoint. Reset by generating new server configuration. Add provider-managed MFA/individual accounts if the studio later has multiple administrators.
- Rate limiter: durable shared database token buckets in production; the in-memory fallback is development-only. Login has independent address/account buckets. Public reports are deliberately anonymous and are still subject to distributed bot/DoS risk beyond application rate limits; configure provider edge limits for that risk.
- The admin UI no longer exposes the unsafe direct-to-database uploader or client-side delete controls. The guarded DELETE API retains original storage files, so it is not a permanent file-purge endpoint.

## Credentials and history

`docs/security/secret-scan.json` contains only credential classifications, locations and short fingerprints. Historical client-side admin credential references exist. The current build removes that mechanism, and the old `VITE_ADMIN_PASSKEY` has been removed from local env files and the example. Do not reuse it anywhere.

The scan found configured Discord webhook URLs only in ignored local env files, not reachable Git text history. Their presence in server configuration is not proof of a leak. No Google API key, privileged Supabase key, GitHub token or private key was detected by the pattern scan. No provider key was revoked or regenerated because no such leak was established and provider settings were not authenticated. Check historic deployed bundles, provider logs and other repositories; revoke/rotate a secret at its provider if those checks find exposure. Public Supabase anon/publishable keys are expected in browser code and should be protected with grants/RLS, not treated as service secrets.

History was not rewritten or force-pushed. A pattern scan cannot prove absence of every secret, and cannot inspect binary metadata or unreachable Git objects.
