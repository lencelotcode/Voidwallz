# Voidwallz security review — 12 November 2026

The source changes are complete and locally tested. **The live site is not yet covered by these fixes.** Database permission changes, production server secrets, and the new deployment remain open. The Supabase dashboard requires sign-in for the project used by the live public gallery (`wrvgosqpjqrthmtpzmrm`). Local project variables are placeholders and are not a valid basis for changing a production database.

## Priority findings and changes

1. **Critical: client-side admin authorization.** The previous browser-delivered passkey and `sessionStorage` flag could unlock a direct-to-Supabase publishing UI. Removed that mechanism and its client writes. The replacement validates credentials on the server, uses a salted PBKDF2-SHA256 hash (600,000 iterations), and issues a signed 30-minute session in a production `Secure; HttpOnly; SameSite=Strict` cookie. A separate CSRF token is required for mutations. Historical copies of the old credential remain in Git/deployed artifacts; do not reuse that password. The new admin credentials are not configured yet.
2. **High: unprotected report forwarding.** Added request-origin checks, a required custom header, bounded streaming request reads, consent/field validation, image signature/MIME/dimension/size checks, sanitized errors, server timeouts, generated attachment names, disabled Discord mentions, and real failure statuses. Production requests require the shared database rate limiter and fail closed if it is unavailable. Tests mock Discord; no messages were sent.
3. **High: database/storage write permissions unverified.** Prepared a migration to make pack metadata and the wallpaper bucket read-only to browser roles, add restrictive write-deny policies, cap bucket uploads, and provide a service-only token-bucket RPC. **It has not been applied or tested against production.** Unknown tables/functions need a provider-side audit too. No service key was created, retrieved, revoked or exposed during this review.
4. **Dependency advisories.** Removed unused Google GenAI, Express, dotenv, and redundant type packages. Updated compatible dependency versions and lockfile, including Vite 6.4.6, Supabase 2.119.0, React 19.3.1, Tailwind 4.3.5, and JSZip 3.10.2. The npm audit changed from **11 advisories (2 critical, 7 high, 1 moderate, 1 low)** to **0 known advisories**. This is the audit database's result, not a guarantee of absence of vulnerabilities.
5. **Production hardening prepared.** Added CSP, nosniff, frame denial, permissions/referrer policies, COOP, HSTS, no-store APIs, and noindex admin metadata. Removed the Gemini build-time key injection and verbose Supabase configuration logging. Builds reject unapproved `VITE_` values and public service-role/secret keys. Source maps are disabled; env files and security reports are excluded from deployment inputs. The dev server now binds to loopback and blocks env/Git/server paths.

## Checklist, in the requested order

“Implemented/tested” means the local code path was tested. It does **not** mean deployed or that the provider settings were changed.

| Item | Status | What changed / verification / remaining work |
|---|---|---|
| 2. Hide API keys | Implemented/tested; provider audit open | Removed Gemini key injection and unused SDK; server-only credential variables never enter frontend imports. Build tests reject unknown browser env vars, new secret keys and legacy service-role JWTs. Production bundle scan finds no server credential markers. Supabase publishable/anon keys are intentionally public and require RLS. |
| 3. Lock the database | **Open: migration prepared** | Grants/RLS and restrictive pack/storage write policies are in `supabase/migrations/20261111_security_hardening.sql`. Needs authenticated project access, review of existing policies, application and real allow/deny tests. No production schema or data was modified. |
| 4. Enforce HTTPS | Live redirect verified; additional config prepared | Read-only probe confirms live HTTP returns 308 to HTTPS; HTTPS already has hosting HSTS. Added project HSTS, apex canonical redirect and HTTP rejection in production APIs. Verify new deployment headers. |
| 5. Hash passwords | Implemented/tested; credentials setup open | Salted PBKDF2-SHA256, 600,000 iterations; independent salts, correct/incorrect password tests, no plaintext storage. Helper prompts without echo; owner must set a new password and production hash/secrets. |
| 6. Server-side validation | Implemented/tested | Typed/length-bounded form fields, consent, email/device/browser/viewport checks, JSON and multipart validation, bounded body streams, server-generated storage paths. Invalid cases rejected before forwarding/upload. |
| 7. Block XSS | Escaping verified; CSP prepared | Actual wallpaper-card rendering escapes malicious title/alt markup. Application avoids raw HTML injection. Production CSP disallows inline/eval scripts, objects and framing. React motion still requires inline styles. Deployed CSP compatibility remains to be checked. |
| 8. Log suspicious activity | Implemented; external alerts open | Structured event/request IDs for rejected requests, login failure, rate-limit events and admin writes. Address digests are salted; passwords/tokens/webhooks/report bodies are not logged. Hosting log retention and alerts are not configured here. |
| 9. Lock admin routes | Implemented/tested; production setup open | Publishing UI no longer trusts storage flags or browser passwords and never writes directly with the public database client. Signed cookies, expiry, CSRF, and per-operation server checks. Forged/legacy flags and unauthenticated publishing receive 401. Studio password/session secrets still need setup. |
| 10. Parameterized queries | Verified in code/tests; DB tests open | Supabase query-builder filters and fixed RPC argument names are used, with no string-built SQL from requests. Injection-shaped pack IDs rejected. Migration uses static SQL and a restricted search path. Actual database privilege tests need a database connection. |
| 11. Env variables | Implemented/tested | Only public gallery URL/key are explicitly exposed to the browser; automatically injected `VITE_VERCEL_*` build metadata is accepted but excluded from client JavaScript; retired `VITE_ADMIN_PASSKEY` removed from local files/template. Server settings documented without values; env files ignored/excluded. Local production-equivalent settings are not configured. |
| 12. Rate limiting | Implemented/tested; durable backend open | Shared database token bucket, independent IP/account login buckets, report/admin limits, trusted Vercel IP source, 429 + Retry-After. Missing protection fails closed with 503. Local mocks test allow/deny/failure; real concurrent database behavior is not yet verified. |
| 13. Restrict CORS | Implemented/tested | Exact same-origin allowlist and custom request header; foreign origins and preflight-only attempts denied without wildcard ACAO. Browser session reads require same-origin fetch metadata. Dev-server CORS disabled. |
| 14. Security headers | Configured/tested locally; **not deployed** | CSP, HSTS, nosniff, frame denial, referrer/permissions policy and COOP. Current live read-only check still lacks the new headers apart from hosting HSTS. |
| 15. Secure cookies | Implemented/tested | Production host-only Secure/HttpOnly/Strict cookie, no browser token storage, 30-minute maximum age; logout clears it. A stolen stateless token can remain valid until expiry; rotating password hash/session secret invalidates existing sessions. Production browser verification remains open. |
| 16. CSRF protection | Implemented/tested | Admin mutation requires signed session + matching random CSRF header + allowed origin/custom header. Report endpoint requires origin/custom header despite its multipart format. Missing/forged tokens and foreign origins denied. |
| 17. Expiring reset links | Not applicable to current app | No public account/password-reset endpoint remains. Admin password reset is an owner-run server configuration change; generated new secrets invalidate sessions. Session expiration itself was tested. Do not add email reset links without single-use provider tokens and expiry. |
| 18. Upload limits | Implemented/tested; bucket policy open | Reports: 2 MB image. Packs: 1–5 images, 3 MB combined, PNG/JPEG/WebP only, max 16,384 per dimension / 80 million pixels. Signature/MIME mismatch, SVG, excessive count/size/dimensions rejected. Bucket limits require migration. No antivirus/content re-encoding service was configured. |
| 19. Verify prices | Not applicable to current app | No checkout/payment/price-calculation endpoint or payment SDK is present. All current download paths are free. Any future checkout must calculate/verify prices on the server. |
| 20. Debug mode off | Implemented/tested | No raw server/upstream errors sent to clients, no fake report success, source maps off, debug statements/verbose client logs stripped, dev host restricted to loopback. Server security events remain enabled deliberately. |
| 21. Update dependencies | Implemented/verified | Compatible updates and audited lockfile; npm audit reports 0 known vulnerabilities. Major framework migrations were not needed to remove the reported advisories. |
| 22. Remove unused packages | Implemented/verified | Removed five unused direct packages/type stubs and their transitive packages; moved build-only tools to dev dependencies. Lint/build/tests pass. |
| 23. Exposed files | Verified within scope | Local HTTP probes return 403 for env/Git/server code paths; dist contains no env files or source maps. Read-only production probes return the SPA HTML, not env/Git content. Deployment ignore rules exclude env files/security reports. Broader provider artifact/backups review remains open. |
| 24. Scan Git history | Completed within stated scan limits | Pattern scan of reachable text Git blobs plus current source/build/env files; see `secret-scan.json` for the exact count and redacted locations. Historical client admin credential references found. Binary metadata, unreachable objects, other repos and provider logs were not scanned. History was not rewritten. |
| 25. Revoke leaked keys | Legacy mechanism removed; provider checks open | Old browser passkey mechanism retired; new unique studio configuration required before deployment. No privileged provider key leak was established by the scan, so no provider key was revoked. Ignored local Discord webhook configuration is not evidence of a leak. Rotate any secret found in external/deployed artifacts at its provider; never rely on deleting Git text alone. |
| 26. Full security review | Source/dependency review done; production incomplete | Reviewed application routes, APIs, public reads, storage writes, environment boundaries, dependency tree and reachable history. New code is locally verified. Provider-side policy audit, SQL execution, deployment and post-deploy regression tests remain open; this is not an independent penetration-test certification. |
| 27. Test + report | Completed locally | 27 security tests + 4 sitemap tests + 7 social metadata tests pass, TypeScript check passes, production build succeeds, build-secret guard checks pass, local HTTP rejection checks pass, and npm audit is clean. SQL test suite is supplied but **not executed**; production changes are not deployed. |

## Evidence

- `scripts/security.test.ts`: 27 automated cases, including valid mocked report delivery/publishing and adversarial cases; no real uploads/deletes/messages.
- `scripts/sitemap.test.ts`: 4 passing crawler/URL regression cases.
- `scripts/social-pages.test.ts`: 7 passing Open Graph, HTML escaping, safe output path, canonical and static routing checks; all 104 generated HTML pages checked before JavaScript execution.
- `docs/security/dependency-audit-before.json` and `dependency-audit-after.json`: advisory comparison.
- `docs/security/secret-scan.json`: redacted scan details and limits.
- `docs/security/live-readonly-checks.json`: production HTTP/HTTPS/header/exposure observations before deployment.
- Local HTTP checks: `/api/admin` → 401; forged legacy publishing flag → 401; foreign-origin report → 403; `/.env`, `/.env.local`, `/.git/config`, `/server/adminSession.ts` → 403.
- Browser checks: new locked studio renders; report title/description limits and file accept list match the server's public limits. Supabase redirects the confirmed project to its sign-in page.
- Supplied but unrun: `supabase/tests/security.test.sql`, 12 pgTAP checks for RLS/grants, real anon write rejection, service RPC access and an atomic bucket test. Run on staging after migration before production.

## Remaining work, in order

1. Authenticate to the correct Supabase project; inspect/apply the migration and run the database tests on staging.
2. Generate a new studio password configuration in your own terminal; configure server-only production credentials and validate the existing report webhook.
3. Deploy the reviewed source, then verify headers, cookies, allowed/denied database operations, reporting, publishing and rate limiting against the deployed environment.
4. Configure provider log alerting and review old deployed artifacts/other repositories for credential exposure; revoke provider secrets if exposure is found.

Detailed instructions: `docs/security/SETUP.md`.

## Primary references consulted

- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/headers/request-headers
