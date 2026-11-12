import type { MouseEvent } from 'react';
import { PUBLIC_SITE_PATHS } from '../../shared/seo/siteUrls';
import { WALLPAPER_ROUTE_PATTERN } from './wallpaperNavigation';

/** Only application pages belong in the client router; files and external links stay native. */
export function siteLink(event: MouseEvent<HTMLElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;
  const anchor =
    event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (
    !anchor ||
    anchor.hasAttribute('download') ||
    (anchor.target && anchor.target !== '_self') ||
    anchor.relList.contains('external')
  )
    return null;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol))
    return null;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (
    !(PUBLIC_SITE_PATHS as readonly string[]).includes(path) &&
    path !== '/admin' &&
    !WALLPAPER_ROUTE_PATTERN.test(path)
  )
    return null;
  if (!WALLPAPER_ROUTE_PATTERN.test(path)) url.pathname = path;
  return url;
}

export function navigateSiteLink(event: MouseEvent<HTMLElement>, still = false) {
  const url = siteLink(event);
  if (!url) return;
  event.preventDefault();
  const destination = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (destination !== current) {
    window.history.pushState(null, '', destination);
    window.dispatchEvent(new Event('popstate'));
  } else if (!url.hash) {
    window.scrollTo({
      top: 0,
      behavior:
        still || window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
    });
  } else {
    // Reusing a gallery link should still bring the visitor back to that section.
    let id: string;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch {
      return;
    }
    document.getElementById(id)?.scrollIntoView({
      behavior:
        still || window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
    });
  }
}
