import { canonicalUrl, PUBLIC_SITE_PATHS } from "../src/lib/siteUrls";
import { wallpaperUrl } from "../src/lib/wallpaperNavigation";

export type Device = "desktop" | "mobile";
export interface CatalogItem { title: string; modifiedAt?: string; image?: string; }
export interface Catalog { desktop: CatalogItem[]; mobile: CatalogItem[]; }

export function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, char => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
  })[char]!);
}

function lastModified(value?: string) {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  // Do not manufacture a lastmod date from build time or use invalid/future data.
  return Number.isFinite(timestamp) && timestamp <= Date.now()
    ? new Date(timestamp).toISOString() : undefined;
}

export function renderSitemap(catalog: Catalog) {
  const urls = new Map<string, string | undefined>(PUBLIC_SITE_PATHS.map(path => [canonicalUrl(path), undefined]));
  for (const device of ["desktop", "mobile"] as const) {
    for (const item of catalog[device]) {
      if (!item.title || !item.title.trim()) continue;
      const loc = canonicalUrl(wallpaperUrl({ title: item.title, device }));
      const modified = lastModified(item.modifiedAt);
      const previous = urls.get(loc);
      if (!urls.has(loc) || (modified && (!previous || modified > previous))) urls.set(loc, modified);
    }
  }
  if (urls.size > 50_000) throw new Error("The sitemap needs splitting into a sitemap index (over 50,000 URLs).");
  const body = [...urls].map(([loc, modified]) =>
    `  <url>\n    <loc>${escapeXml(loc)}</loc>${modified ? `\n    <lastmod>${modified}</lastmod>` : ""}\n  </url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  if (new TextEncoder().encode(xml).length > 50 * 1024 * 1024) throw new Error("The sitemap exceeds 50 MB and needs splitting.");
  return { xml, count: urls.size };
}
