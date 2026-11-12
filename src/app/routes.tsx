import React, { lazy } from 'react';
import { motion } from 'motion/react';
import type { WallpaperPack } from '../shared/types/catalogue';
import { PUBLIC_SITE_PATHS } from '../shared/seo/siteUrls';
import { openWallpaper, WALLPAPER_ROUTE_PATTERN } from './routing/wallpaperNavigation';
import { LegalDocuments } from '../features/legal/components/LegalDocuments';
import { isLegalPath } from '../features/legal/config/legalRoutes';
import Gallery from '../features/wallpapers/components/Gallery';
import Hero from '../features/home/components/Hero';
import LatestUploads from '../features/home/components/LatestUploads';
import ScreenStatement from '../features/home/components/ScreenStatement';
import { KineticRibbon } from '../shared/motion/MotionGraphic';
import NotFoundPage from './components/NotFoundPage';
const pageLoaders = {
  '/packs': () => import('../features/packs/components/PacksPage'),
  '/report': () => import('../features/support/components/ReportPage'),
  '/updates': () => import('../features/journal/components/UpdatesPage'),
};
const PacksPage = lazy(pageLoaders['/packs']);
const ReportPage = lazy(pageLoaders['/report']);
const UpdatesPage = lazy(pageLoaders['/updates']);
const AdminPage = lazy(() => import('../features/admin/components/AdminPage'));
export function preloadPage(
  event:
    React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement> | React.PointerEvent<HTMLElement>,
) {
  const anchor =
    event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!anchor || anchor.origin !== window.location.origin) return;
  const load = pageLoaders[anchor.pathname.replace(/\/+$/, '') as keyof typeof pageLoaders];
  if (load)
    void load().catch(() => {
      /* A rejected page import is reported by the route ErrorBoundary. */
    });
}
interface RouteProps {
  path: string;
  hash: string;
  isOledOptimized: boolean;
  introReady: boolean;
  onOpenPack: (pack: WallpaperPack) => void;
  onHoverWallpaper: (url: string | null) => void;
}
export function renderRouteContent({
  path,
  hash,
  isOledOptimized,
  introReady,
  onOpenPack,
  onHoverWallpaper,
}: RouteProps) {
  const galleryProps = { onOpenModal: openWallpaper, isOledOptimized, onHoverWallpaper };
  if (path === '/packs')
    return (
      <motion.div
        key="packs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <PacksPage isDedicatedPage onOpenPack={onOpenPack} onHoverWallpaper={onHoverWallpaper} />
      </motion.div>
    );
  if (path === '/updates')
    return (
      <motion.div
        key="updates"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <UpdatesPage />
      </motion.div>
    );
  if (isLegalPath(path)) return <LegalDocuments key="legal-documents" path={path} />;
  if (path === '/report') return <ReportPage key="report" />;
  if (path === '/admin') return <AdminPage key="admin" />;
  if (['/login', '/signup', '/trial'].includes(path)) return null;
  if (
    !(PUBLIC_SITE_PATHS as readonly string[]).includes(path) &&
    !WALLPAPER_ROUTE_PATTERN.test(path)
  )
    return <NotFoundPage key="not-found" />;
  const view =
    path === '/desktop' || hash === '#desktop'
      ? 'desktop'
      : path === '/mobile' || ['#phone', '#mobile'].includes(hash)
        ? 'phone'
        : null;
  if (view)
    return (
      <motion.div
        key={`gallery-${view}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Gallery {...galleryProps} view={view} />
      </motion.div>
    );
  return (
    <motion.div
      key="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <Hero onOpenModal={openWallpaper} isOledOptimized={isOledOptimized} introReady={introReady} />
      <KineticRibbon />
      <LatestUploads {...galleryProps} />
      <ScreenStatement />
      <Gallery {...galleryProps} />
    </motion.div>
  );
}
