# Voidwallz architecture

Voidwallz is a React/Vite application with Edge API entrypoints on Vercel. This
refactor organizes the existing application; it does not migrate the production
database or change the deployment platform.

## Folder ownership

| Location | Responsibility |
| --- | --- |
| `src/app/` | Application shell, providers, route rendering, location state, page boundaries and layout. |
| `src/config/` | Typed public runtime settings. Never read server credentials here. |
| `src/features/home/` | Hero, recent uploads and the process statement. |
| `src/features/wallpapers/` | Catalogue repository, shared catalogue/favourites stores, gallery and previews. |
| `src/features/packs/` | Pack repository, cached shared state, ZIP preparation and previews. |
| `src/features/admin/` | Studio form UI and its authenticated API service. |
| `src/features/support/` | Report form and report submission service. |
| `src/features/legal/` | Legal workspace, document route definitions and policy content. |
| `src/features/journal/` | Updates page. |
| `src/features/preferences/` | Visitor privacy preference UI. |
| `src/features/downloads/` | Image conversion/download service, activity store and feedback UI. |
| `src/shared/` | Reusable components, dialog/motion hooks, transport, storage, state utilities, contracts and SEO. |
| `src/styles/` | Existing CSS layers in their original load order. |
| `src/vendor/` | Retained third-party helpers; keep upstream code separate. |
| `api/` | Thin Vercel entrypoints. Preserve paths and explicit Edge runtime exports. |
| `server/modules/` | API feature handlers and application services, grouped by domain. |
| `server/http/` | Common method/origin/error boundary, request validation and rate limiting. |
| `server/auth/` | Password verification, signed sessions and CSRF checks. |
| `server/config/` | Server-only environment access, read on demand. |
| `server/infrastructure/` | Elevated database/storage adapter. |
| `server/validation/` | Authoritative image signature, size and dimension validation. |
| `config/vite/` | Build-time public-variable allowlist and local API bridge. |
| `scripts/` | Build/SEO/security maintenance commands, kept out of runtime source. |
| `tests/` | Architecture, shared-state and transport regression tests. Existing security/SEO suites remain under `scripts/`. |
| `supabase/` | Reviewed migrations and provider-side SQL tests. |

## Dependencies and naming

Components use PascalCase filenames and exports; hooks use `useName`; services,
repositories and stores use camelCase. `Wallpaper` and `WallpaperPack` describe
the public catalogue. Shared upload constants are in
`src/shared/contracts/uploads.ts`, so form hints and server limits agree.

UI components depend on hooks/stores and services. Network and browser-storage
operations do not live in feature components. Services own provider calls and
mapping. Shared code does not import private server modules. Browser imports are
checked automatically, including unresolved paths after moves. Client code must
never import `server/`, `api/`, service-role credentials or server environment
readers. Server code can import **pure** public request contracts.

Avoid broad barrel exports: import a specific module so lazy chunks stay small
and a server-only export cannot accidentally enter the browser bundle.

## State ownership

The project uses React's `useSyncExternalStore` with small typed stores rather
than adding a runtime state-management dependency.

- `createStore` provides stable snapshots, subscriptions and synchronous updates.
- `createAsyncResource` provides one shared request, loading/error status, explicit
  retry, last-good data and a generation guard against stale responses. Reloading
  aborts the previous request; provider operations that cannot abort are ignored
  if they complete after a newer generation.
- `catalogueStore` is the shared wallpaper source for the hero, gallery and preview.
  Failed first loads retain bundled artwork; retries can restore the full archive.
  A successful empty provider response remains empty, rather than inventing content.
- `packsStore` publishes all metadata changes, including changed titles with the same
  IDs, and persists validated cache data. Request failure settles every subscriber.
- `wallpaperStatsStore` owns saved IDs and local download increments. Existing
  storage keys/IDs are retained. UI still responds if persistence is blocked.
- `preferencesStore` owns animation pause and the privacy choice. Sound settings use
  the safe storage adapter and the existing sound engine.
- Routing, dialog locks and download activity are separate stores because they have
  different lifetimes. The route store preserves the collection behind a preview.
- Local presentation state (search input, active preview image, open menu, form
  fields and atmosphere) stays close to its owning UI. Do not put every input in a
  global store. Studio CSRF data remains in component memory; auth is an HttpOnly
  server cookie, never a persisted browser flag.

Existing seeded display counters are preserved for compatibility; this refactor
does not turn those historical baseline values into server analytics.

## Error boundaries

`apiRequest` sets same-origin credentials and verification headers, validates JSON,
limits request time, supports cancellation, and produces `AppError` messages for
UI. A failed request cannot be treated as success. Page modules and the root shell
have render/lazy-import boundaries with a reload action. Forms show actionable
errors instead of empty catches. Storage adapters handle malformed JSON, blocked
storage and quota limits without breaking rendering. Image downloads have request
and image-load deadlines. Publishing cleanup failures are logged without secrets.

React boundaries do not catch arbitrary event-handler promises: each form/download
handler must still await its service and handle errors. Recoverable provider and
storage failures should not be escalated to a full-screen introduction.

## Environments

`src/config/clientEnv.ts` reads only the two approved public gallery settings.
Missing/placeholder local settings use bundled artwork. `server/config/env.ts`
reads private values only when server operations need them; this supports Edge
runtimes and isolated tests without capturing stale configuration at import time.
`config/vite/environmentGuard.ts` controls browser exposure. Automatic broad
`VITE_*` injection remains disabled. Vercel metadata and the retired admin passkey
are not bundled. Privileged keys assigned to the public key still fail the build.

Use ignored `.env.local` for development and Vercel environment settings for
production. `.env.example` contains names/placeholders, not working secrets.
See [security setup](security/SETUP.md) before enabling production writes.

## Adding a feature

1. Add a domain folder under `src/features/`, with components, services and hooks or
   state only when required. Avoid empty scaffolding folders.
2. Put provider transformations and business rules in services, not JSX. Share pure
   request constants in `src/shared/contracts/` when frontend/server both need them.
3. Keep feature-local UI state local. Use a shared resource/store for data consumed
   by several components; expose explicit retry and error states.
4. Register public pages in `src/app/routes.tsx`, `src/shared/seo/pageMetadata.ts`
   and `src/shared/seo/siteUrls.ts`, plus a Vercel HTML rewrite when appropriate.
5. For an API feature, add a thin `api/` entrypoint and a module handler built with
   `createEndpoint`. Apply authorization, CSRF and per-operation rate limits before
   side effects. Do not create unauthenticated elevated database endpoints.
6. Add behavior-focused tests for data races, failures and authorization. Run
   `SITEMAP_OFFLINE=1 npm run check` before publishing.

## Refactor verification and limits

The baseline source passed TypeScript and the existing security/sitemap tests
before changes. The refactor preserves the current working design edits, public
URLs, gallery slug rules, storage keys and Vercel API contracts. Removed dead
cursor/magnetic/radar modules had no application entrypoint or importer; unused
cache exports and duplicate desktop/mobile pack loaders were also removed.

Automated checks include 27 security cases, 8 architecture/state/transport cases,
4 sitemap cases and 7 initial-HTML/social cases (46 total). The build generates
104 HTML pages. Browser smoke checks cover navigation, previews, saving and forms.
No real report, pack upload, deletion, production database migration or deployment
is part of these local checks. Provider-side access rules still require the
separate migration/configuration work described in the security review.
