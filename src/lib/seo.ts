const SITE_NAME = "Voidwallz";
const DEFAULT_TITLE = "Voidwallz | Wallpaper Beyond Reality";
const DEFAULT_DESCRIPTION =
  "Curated 8K, 4K & OLED minimalist wallpapers and packs engineered to elevate your digital workspace.";
const DEFAULT_IMAGE = "https://voidwallz.live/og-image.png";

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Client-side per-route metadata. Crawlers that execute JS (Google) and
 * in-app link previews that hydrate after load will read these values;
 * index.html carries the static defaults for everything else.
 */
export function setPageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
}: PageMeta) {
  if (typeof document === "undefined") return;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:url", url ?? window.location.href);
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
  upsertMeta("name", "twitter:url", url ?? window.location.href);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
