# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Designers, software engineers, digital creators, and desktop minimalists curating personal desktop and mobile screen setups. They demand bespoke, high-resolution (4K, 8K, OLED) wallpapers without intrusive advertising, accounts, watermarks, or deceptive download timers.

## Product Purpose

Voidwallz exists to provide an ad-free, high-fidelity gallery where users can effortlessly discover, preview, and download digital wallpapers. Success is measured by how quickly and reliably a user can find an artwork, test it in realistic device frames, and download the lossless master asset.

## Positioning

An editorial-grade, studio-crafted wallpaper collection free from the clutter, ads, paywalls, and telemetry prevalent in mainstream wallpaper sites. Voidwallz provides immediate, unencumbered access to genuine master-quality digital art under a clear personal-use license.

## Operating Context

- Browsed across high-DPI desktop screens (ultrawides, multi-monitors, Retina displays) and mobile smartphones.
- Interactive device staging frames simulating real monitors and mobile screens.
- Four user-selectable visual atmospheres: Paper (editorial standard), OLED pure (true black), CRT scan (retro scanlines), and Noir grain (monochrome cinema).
- Frictionless client-side experience paired with a hardened serverless admin publishing interface (`/admin`) and secure issue reporting (`/report`).

## Capabilities and Constraints

- **Single-Page Application**: React 19, TypeScript, Vite, Motion, and Tailwind CSS v4.
- **Public Access**: 100% open gallery with zero user sign-in or account requirements.
- **Master Downloads**: High-reliability download pipeline with cryptographic byte-level PNG signature verification and global download feedback.
- **Pack Bundles**: Themed packs downloadable as individual artwork or zipped collections client-side via JSZip.
- **SEO & Social Crawlers**: Pre-rendered static HTML cards with Open Graph & Twitter metadata for all catalog routes and automated sitemap generation.
- **License Constraint**: All downloaded assets are strictly licensed under the non-exclusive Voidwallz Personal Digital Display License (commercial resale and redistribution strictly prohibited).

## Brand Commitments

- **Name & Identity**: Voidwallz — "Wallpaper Beyond Reality".
- **Visual Voice**: Understated, technical, editorial, confident. Monospaced metadata labels paired with bold display headings.
- **Aesthetic Accents**: Deep void blacks (`#10110e`, `#050505`), crisp hairline borders, and neon electric lime accents (`#C6FF00`).
- **Ethical UX**: No deceptive CTAs, no countdown download gates, no tracking telemetry, and transparent personal cookie consent.

## Evidence on Hand

- Production web application deployed at `https://voidwallz.live`.
- Curated collection of 90+ live desktop and phone wallpapers hosted in Supabase Storage with offline catalogue fallbacks (`scripts/sitemap-catalog.json`).
- Verified search engine assets including `public/BingSiteAuth.xml`, `public/robots.txt`, and `public/sitemap.xml`.
- Complete legal and compliance suite: Terms of Service, Privacy Policy, Personal Digital Display License, Cookie & Storage Policy, Refund Policy, and statutory DMCA notice protocol.

## Product Principles

1. **Zero Obstacles**: Never gate wallpaper previews or downloads behind accounts, email captures, social shares, or countdown delays.
2. **Lossless Quality**: Never downgrade or compromise master wallpaper resolution; guarantee authentic PNG output.
3. **Artifact-First Presentation**: Interfaces and stage controls remain quiet and unobtrusive, allowing the artwork to command the viewport.
4. **Deliberate Craft & Performance**: Maintain responsive performance, robust accessibility (keyboard navigation, dialog focus traps), and respect for user reduced-motion preferences.

## Accessibility & Inclusion

- Respects system-level `prefers-reduced-motion` and provides an in-app manual motion toggle.
- Focus-managed dialog portals with `Escape` handling and accessible dialog roles for wallpaper and pack inspection.
- High-contrast text ratios across all four visual atmospheres, including OLED and high-contrast Paper modes.

