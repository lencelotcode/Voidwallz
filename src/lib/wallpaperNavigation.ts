import type { Wallpaper } from "../types";

export const WALLPAPER_ROUTE_PATTERN = /^\/(desktop|mobile)\/([^/]+)\/?$/;

interface WallpaperHistoryState {
  wallpaperReturnUrl: string;
}

export function wallpaperUrl(wallpaper: Pick<Wallpaper, "device" | "title">) {
  return `/${wallpaper.device}/${encodeURIComponent(wallpaper.title.toLowerCase().replace(/\s+/g, "-"))}/`;
}

export function openWallpaper(wallpaper: Wallpaper) {
  const state: WallpaperHistoryState = {
    wallpaperReturnUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  };
  window.history.pushState(state, "", wallpaperUrl(wallpaper));
  window.dispatchEvent(new Event("wallpaper-navigate"));
}

/** Resolve the page behind an overlay, including Back, Forward, and shared links. */
export function collectionLocation() {
  const match = window.location.pathname.match(WALLPAPER_ROUTE_PATTERN);
  const returnUrl = window.history.state?.wallpaperReturnUrl;
  if (match) {
    const url = new URL(typeof returnUrl === "string" && returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : `/${match[1]}`, window.location.origin);
    return { pathname: url.pathname, hash: url.hash };
  }
  return { pathname: window.location.pathname, hash: window.location.hash };
}

/** Browsing inside a preview keeps one history entry and its collection position. */
export function changeWallpaper(wallpaper: Wallpaper) {
  window.history.replaceState(window.history.state, "", wallpaperUrl(wallpaper));
  window.dispatchEvent(new Event("wallpaper-navigate"));
}

export function closeWallpaper() {
  const state = window.history.state as Partial<WallpaperHistoryState> | null;
  if (state?.wallpaperReturnUrl?.startsWith("/") && !state.wallpaperReturnUrl.startsWith("//")) {
    window.history.back();
    return;
  }
  const match = window.location.pathname.match(WALLPAPER_ROUTE_PATTERN);
  window.history.replaceState(null, "", match ? `/${match[1]}` : "/");
  window.dispatchEvent(new Event("popstate"));
}
