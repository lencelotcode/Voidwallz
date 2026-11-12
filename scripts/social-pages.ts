import { resolvePageMeta, socialTags, STATIC_META, wallpaperMeta, type PageMeta } from "../src/lib/pageMetadata";
import { PUBLIC_SITE_PATHS } from "../src/lib/siteUrls";
import { wallpaperUrl } from "../src/lib/wallpaperNavigation";
import { escapeXml, type Catalog } from "./sitemap";

export function renderSocialHead(meta: PageMeta) {
  const resolved = resolvePageMeta(meta);
  return [
    `<title>${escapeXml(resolved.title)}</title>`,
    `<link rel="canonical" href="${escapeXml(resolved.url)}" />`,
    ...socialTags(meta).map(({ attr, key, content }) =>
      `<meta ${attr}="${key}" content="${escapeXml(content)}" />`),
  ].join("\n        ");
}

export function renderSocialPage(template: string, meta: PageMeta) {
  const block = /<!-- social-meta:start -->[\s\S]*?<!-- social-meta:end -->/g;
  if ([...template.matchAll(block)].length !== 1) throw new Error("Expected exactly one social metadata block in the built HTML.");
  return template.replace(block, () => `<!-- social-meta:start -->\n        ${renderSocialHead(meta)}\n        <!-- social-meta:end -->`);
}

/** Decode URL segments once for static hosting, and prevent catalogue path traversal. */
export function routeFile(path: string) {
  if (!path.startsWith("/") || path.includes("?") || path.includes("#")) throw new Error("Invalid static route.");
  const parts = path.split("/").filter(Boolean).map(part => decodeURIComponent(part));
  if (parts.some(part => part === "." || part === ".." || /[\\/\x00-\x1f\x7f]/.test(part))) throw new Error("Unsafe static route.");
  return [...parts, "index.html"].join("/");
}

export function socialPages(catalog: Catalog) {
  const pages = new Map<string, PageMeta>(PUBLIC_SITE_PATHS.map(path => [path, { ...STATIC_META[path], url: path }]));
  for (const device of ["desktop", "mobile"] as const) {
    for (const item of catalog[device]) {
      if (!item.title?.trim()) continue;
      const path = wallpaperUrl({ title: item.title, device });
      routeFile(path); // Fail the build rather than write outside dist.
      pages.set(path, wallpaperMeta({ ...item, device, previewUrl: item.image }, path));
    }
  }
  return pages;
}
