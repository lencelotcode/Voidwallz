# API structure and contracts

The existing same-origin routes remain `/api/admin` and `/api/report`.
`api/*.ts` files only declare the Vercel Edge runtime and export a handler from
`server/modules`. Feature handlers use `createEndpoint` for allowed methods,
origin verification, a privacy-preserving client key, request IDs and consistent
error responses. This is the pattern for future API modules; do not bypass it.

## Common behavior

Requests need `X-Voidwallz-Request: 1`, an allowed origin and HTTPS in production.
Same-origin session GET probes use browser fetch metadata where Origin is omitted.
Cookies use same-origin credentials. Admin mutations also require the signed
session and `X-CSRF-Token`. Limits are enforced on the server before side effects.

Errors return JSON `{ "error": "Visitor-safe message", "requestId": "..." }`
(except method rejection, which also provides an Allow header). Common statuses:
400 invalid fields, 401 authentication, 403 origin/CSRF, 413 upload size, 415 body
format, 429 throttling, 502 provider failure, 503 missing protection/configuration.
Responses are no-store and nosniff. Do not log passwords, cookie values, webhook
URLs or report bodies. Tests mock providers and never send live messages/uploads.

## Endpoints

| Method / path | Body | Result |
| --- | --- | --- |
| `GET /api/admin` | None | Signed-session probe: `{ csrf, expiresAt }`; 401 when signed out. |
| `POST /api/admin?action=login` | JSON `{ password }` | Password verification, secure session cookie, `{ csrf }`. Independent client/account limits. |
| `POST /api/admin?action=logout` | JSON `{}` plus CSRF | Clears session cookie; `{ success: true }`. |
| `POST /api/admin?action=publish` | Multipart metadata and `images` files plus CSRF | Server-created storage paths and pack metadata; `{ success: true, id }`. |
| `DELETE /api/admin` | JSON `{ id }` plus CSRF | Deletes pack metadata by validated ID. Original storage files are retained. |
| `POST /api/report` | Multipart report fields and optional screenshot | `{ success: true, requestId }` only after provider delivery succeeds. |

Publishing fields: `title` 3–100 characters, `tagline` up to 240, an approved
`category`, `device` (`desktop`/`mobile`), 1–5 PNG/JPEG/WebP files, max 3 MB combined.
The controller delegates validation/storage work to `publishPack`. Failed partial
publishing attempts clean up only their own generated paths; cleanup failure is
logged and the client still receives a failure.

Report fields: `title` 3–160, `description` 10–3500, optional `email` up to 254,
`device` (`desktop`/`mobile`/`other`), `browser`
(`chrome`/`safari`/`firefox`/`edge`/`other`), `consent=on`, optional `userAgent`,
`viewport` (`widthxheight`), `currentRoute`, and a PNG/JPEG/WebP `screenshot` up to
2 MB. URL query/hash data is removed before delivery. `reportDelivery` owns the
Discord integration, timeout and mention suppression.

## Frontend usage

Use `src/shared/services/apiClient.ts` through a feature service. It adds required
headers, uses same-origin credentials, imposes a 15-second deadline, accepts an
AbortSignal, verifies JSON and maps expected failures into `AppError`. Response
shape guards are required for authentication and success states. Keep auth cookies
HttpOnly; only the short-lived CSRF value is held in component memory.

## Provider setup

No request path supplies its own elevated database URL. Production reads server
settings from `server/config/env.ts`; rate limits use the shared database token
bucket and fail closed when unavailable. New modules must follow this rule. See
[security setup](security/SETUP.md) for migration, secrets and provider-side tests.
