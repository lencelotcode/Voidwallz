# Voidwallz

Wallpaper discovery, screen previews and downloads for desktop and phone.
React + TypeScript + Vite, with GSAP/Motion and Vercel Edge APIs.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to ignored `.env.local` and configure the public gallery URL
   and publishable/anon key. Missing/placeholder values show bundled artwork.
3. Run `npm run dev` and open `http://127.0.0.1:3000`.

The local server binds to loopback. The API bridge uses the same feature handlers
as production. Private server values are separate from public frontend values;
read [security setup](docs/security/SETUP.md) before enabling reports/publishing.
Never use a `VITE_` variable for a service-role key, password or webhook.

## Codebase map

| Folder | Purpose |
| --- | --- |
| `src/app` | Layout, providers, routing and error boundaries. |
| `src/features` | Home, wallpapers, packs, downloads, support, admin, legal and journal. |
| `src/shared` | UI primitives, hooks, stores, storage/HTTP adapters, types, SEO and request contracts. |
| `src/config`, `config/vite`, `server/config` | Public runtime, build and private server configuration. |
| `src/styles`, `src/vendor` | Styles and retained third-party helpers. |
| `api`, `server` | Thin deployment entrypoints and modular server implementation. |
| `scripts`, `tests`, `supabase` | Build tools, automated checks and database migrations/tests. |

Read [architecture and contribution guidance](docs/ARCHITECTURE.md),
[API contracts](docs/API.md), and the [security review](docs/security/SECURITY-REVIEW.md).
Components contain presentation; services own network/domain work; shared typed
stores provide cache, retry and consistent cross-component state.

## Checks

- `npm run format` / `npm run format:check`: consistent first-party TypeScript/JSX formatting.
- `npm run lint`: TypeScript, including React type definitions.
- `npm run build`: refresh sitemap, build assets and generate initial social HTML.
- `npm test`: 46 security, state, architecture, sitemap and social metadata checks.
  Build first because the social suite inspects generated HTML.
- `SITEMAP_OFFLINE=1 npm run check`: types, build and all tests using the saved catalogue.
- `npm run security:scan`: redacted current/history credential scan.
- `npm run security:setup`: interactive studio password hash/session secret setup.

The app's public URLs, wallpaper IDs/slugs, saved preferences and API contracts
remain stable. No production migration or deployment is performed by local tests.

## Sitemap and Open Graph

The build lists public pages and wallpaper permalinks in `public/sitemap.xml`.
It reads the public Supabase gallery with pagination, preserving the snapshot in
`scripts/sitemap-catalog.json` if the source is unavailable. It never needs a
service-role key or writes to storage. `SITEMAP_OFFLINE=1 npm run sitemap` uses the
snapshot directly. Rebuild/deploy after adding or removing wallpapers.

Submit `https://voidwallz.live/sitemap.xml` to Google Search Console or Bing. After
deployment, verify it returns XML, not the application HTML fallback. `robots.txt`
references it. Admin/API routes and fragment-only pack overlays are omitted.
Actual provider modification dates are included when available; builds do not
invent fresh last-modified dates.

Open Graph and X card metadata is shared in `src/shared/seo/pageMetadata.ts`.
The build emits initial HTML for all 104 saved public routes, including 92
wallpapers, so preview services do not need JavaScript. Wallpaper cards use actual
public artwork; general pages use the existing 1200 × 630 `public/og-image.png`.
Unknown artwork dimensions are omitted. Keep static HTML rewrites ahead of the SPA
fallback in `vercel.json`. The HTML shells do not server-render gallery content.

`npm run social:pages` regenerates HTML after Vite. Social services may cache old
cards; test a live shared URL after deploying. Pack fragments share `/packs`.

## Bing ownership verification

`public/BingSiteAuth.xml` preserves the owner's verification file. Confirm the
live root URL serves XML, then verify in Bing Webmaster Tools. Keep it deployed.

## Environment safety

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are explicitly exposed to the
browser. Vercel's automatic `VITE_VERCEL_*` build metadata can remain enabled and is
excluded from client code. A leftover `VITE_ADMIN_PASSKEY` is ignored with a warning
and never authorizes access; remove it during hosting cleanup. Unknown application
`VITE_*` settings and privileged public keys still fail production builds without
printing values. Reporting and studio actions fail closed until their server
settings and database request protection are configured.
