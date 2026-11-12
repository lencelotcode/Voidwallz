import { resolvePageMeta, socialTags, type PageMeta } from "./pageMetadata";
export { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE } from "./pageMetadata";
export type { PageMeta } from "./pageMetadata";

/** Keep hydrated navigation consistent with the HTML generated for share crawlers. */
export function setPageMeta(meta: PageMeta) {
  if (typeof document === "undefined") return;
  const input = { ...meta, url: meta.url ?? window.location.href };
  const resolved = resolvePageMeta(input);
  document.title = resolved.title;
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = resolved.url;
  // A route change must clear dimensions/type belonging to the previous image.
  for (const key of ["og:image:width", "og:image:height", "og:image:type"]) {
    document.head.querySelector(`meta[property="${key}"]`)?.remove();
  }
  for (const { attr, key, content } of socialTags(input)) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.content = content;
  }
}
