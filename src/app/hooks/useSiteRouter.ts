import { useEffect, useRef } from 'react';
import { useBrowserLocation } from '../routing/locationStore';
import { WALLPAPER_ROUTE_PATTERN } from '../routing/wallpaperNavigation';
import { isLegalPath } from '../../features/legal/config/legalRoutes';
import { STATIC_META } from '../../shared/seo/pageMetadata';
import { setPageMeta } from '../../shared/seo/documentMeta';
export function useSiteRouter() {
  const location = useBrowserLocation();
  const path = location.collectionPath;
  const hash = location.collectionHash;
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    const previous = previousPath.current;
    const next = location.pathname;
    previousPath.current = next;
    if (
      !WALLPAPER_ROUTE_PATTERN.test(previous) &&
      !WALLPAPER_ROUTE_PATTERN.test(next) &&
      next !== previous &&
      !(isLegalPath(previous) && isLegalPath(next)) &&
      !location.hash
    )
      window.scrollTo({ top: 0, behavior: 'instant' });
    if (['/login', '/signup', '/trial'].includes(next)) {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [location]);
  useEffect(() => {
    if (!hash || ['#desktop', '#phone', '#mobile'].includes(hash)) return;
    let targetId: string;
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const scroll = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      // During the exit animation the previous collection can have the same ID.
      const expectedView = path === '/desktop' ? 'desktop' : path === '/mobile' ? 'phone' : 'all';
      if (targetId === 'gallery' && target.getAttribute('data-collection-view') !== expectedView)
        return false;
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
      return true;
    };
    const observer = new MutationObserver(() => {
      if (scroll()) observer.disconnect();
    });
    const frame = requestAnimationFrame(() => {
      if (!scroll())
        observer.observe(document.getElementById('main-content') || document.body, {
          childList: true,
          subtree: true,
        });
    });
    const timer = window.setTimeout(() => observer.disconnect(), 3000);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [path, hash]);

  // Per-route document title + link-preview metadata (wallpaper detail
  // routes manage their own meta in WallpaperRouteManager)
  useEffect(() => {
    if (WALLPAPER_ROUTE_PATTERN.test(window.location.pathname)) return;
    const meta = STATIC_META[path] ?? {
      title: 'Page Not Found | Voidwallz',
      description: "This coordinate doesn't map to anything in the archive.",
    };
    setPageMeta(meta);
  }, [path]);

  return { path, hash };
}
