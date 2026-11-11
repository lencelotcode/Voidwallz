export const SITE_ORIGIN = "https://voidwallz.live";

// Only public, standalone pages belong in the search sitemap. Pack overlays
// use fragments, and the publishing studio is deliberately excluded.
export const PUBLIC_SITE_PATHS = [
  "/", "/desktop", "/mobile", "/packs", "/updates",
  "/privacy", "/terms", "/license", "/cookies", "/refunds", "/dmca", "/report",
] as const;

/** The same preferred URL for metadata and the sitemap, without filters/hashes. */
export function canonicalUrl(input: string) {
  let pathname = new URL(input, SITE_ORIGIN).pathname;
  if (/^\/(desktop|mobile)\/[^/]+\/?$/.test(pathname)) {
    pathname = `${pathname.replace(/\/+$/, "")}/`;
  } else if (pathname !== "/") {
    pathname = pathname.replace(/\/+$/, "");
  }
  return `${SITE_ORIGIN}${pathname}`;
}
