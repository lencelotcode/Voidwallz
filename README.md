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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
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
