<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a42234d2-594e-4e4a-afac-748fb7beabe7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy the public gallery settings from `.env.example` into `.env.local`. Server-only security settings are documented in `docs/security/SETUP.md`.
3. Run the app:
   `npm run dev`

## Search sitemap

`npm run build` refreshes `public/sitemap.xml` before building the website.
It lists public pages and individual wallpapers using the same URLs as the gallery.
The generator reads the existing public Supabase gallery configuration, with no
service role key or storage writes. If the gallery is temporarily unreachable,
it preserves the saved catalogue in `scripts/sitemap-catalog.json` instead of
replacing the full collection with bundled fallback images.

- Regenerate only the sitemap: `npm run sitemap`.
- Generate from the saved catalogue without network access: `SITEMAP_OFFLINE=1 npm run sitemap`.
- Run sitemap checks: `npm run test:sitemap`.
- Rebuild and deploy after adding or removing wallpapers so the sitemap stays current.

After deploying, open `https://voidwallz.live/sitemap.xml` and confirm it returns
XML, then submit that URL in Google Search Console → **Sitemaps**. The accompanying
`robots.txt` also points crawlers to the sitemap. Admin/API routes and pack URL
fragments are omitted. Actual storage modification dates are included when
available; builds do not fabricate new `lastmod` dates.

## Bing ownership verification

The downloaded Bing verification file is preserved at `public/BingSiteAuth.xml`.
After deploying, confirm `https://voidwallz.live/BingSiteAuth.xml` serves the XML
file, then click **Verify** in Bing Webmaster Tools. Keep the file in place after
verification. The same `https://voidwallz.live/sitemap.xml` can be submitted to Bing.

## Security configuration

Read [the security review](docs/security/SECURITY-REVIEW.md) and [deployment setup](docs/security/SETUP.md) before deploying write endpoints. Production reporting and publishing fail closed until the database rate limiter and server settings are configured.

- `npm run test:security`: isolated endpoint/security tests; no live writes or messages.
- `npm run security:scan`: redacted current/history credential scan.
- `npm run security:setup`: interactively generate a hashed studio password and session secrets without exposing the password.

## Open Graph and X previews

`npm run build` also generates initial HTML for every public route and catalogue
wallpaper, using shared metadata from `src/lib/pageMetadata.ts`. Preview services
can read the title, description, canonical URL and artwork without running React.
The homepage and general pages use the existing 1200 × 630 `public/og-image.png`;
wallpaper pages use their real public preview image and descriptive image alt text.
Open Graph image dimensions are omitted for artwork whose dimensions are unknown.

- `npm run social:pages`: regenerate HTML after a Vite build.
- `npm run test:social`: verify metadata, escaping, routes and the current build output.
- Rebuild/deploy after adding wallpapers; the sitemap refresh saves image URLs in the
  same catalogue snapshot. An offline build uses the last checked catalogue.
- Keep the static HTML rewrites in `vercel.json` ahead of the SPA fallback.
- After deploying, inspect the raw HTML of a wallpaper URL and test an unfurled link.
  Social services may cache earlier cards; their cache refresh may be needed.

These are HTML shells with social metadata, not server-rendered gallery content.
Pack overlays currently use URL fragments, so each pack shares the `/packs` card.

Vercel's automatic `VITE_VERCEL_*` deployment variables can remain enabled.
Vite's automatic environment prefix injection is disabled; the build explicitly
exposes only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Deployment metadata
and server secrets stay out of browser JavaScript. Unexpected application
`VITE_*` variables and privileged keys assigned to the public key still fail the
production build, with variable names (never values) in the error.
