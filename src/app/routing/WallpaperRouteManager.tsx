import { useEffect } from 'react';
import WallpaperPreview from '../../features/wallpapers/components/WallpaperPreview';
import { useWallpapers } from '../../features/wallpapers/hooks/useWallpapers';
import { setPageMeta } from '../../shared/seo/documentMeta';
import { STATIC_META, wallpaperMeta } from '../../shared/seo/pageMetadata';
import { useBrowserLocation } from './locationStore';
import { closeWallpaper, WALLPAPER_ROUTE_PATTERN } from './wallpaperNavigation';
export default function WallpaperRouteManager({ isOledOptimized }: { isOledOptimized: boolean }) {
  const location = useBrowserLocation();
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const match = location.pathname.match(WALLPAPER_ROUTE_PATTERN);
  let selectedWp = null;
  if (match) {
    try {
      const slug = decodeURIComponent(match[2]).toLowerCase().replace(/\s+/g, '-');
      const items = match[1] === 'desktop' ? desktopWallpapers : mobileWallpapers;
      selectedWp =
        items.find((item) => item.title.toLowerCase().replace(/\s+/g, '-') === slug) ?? null;
    } catch {
      /* A malformed encoded permalink cannot open a preview. */
    }
  }
  useEffect(() => {
    if (selectedWp) setPageMeta(wallpaperMeta(selectedWp, window.location.href));
    else if (STATIC_META[location.pathname]) setPageMeta(STATIC_META[location.pathname]);
  }, [selectedWp, location.pathname]);
  return (
    <WallpaperPreview
      selectedWp={selectedWp}
      onClose={closeWallpaper}
      isOledOptimized={isOledOptimized}
    />
  );
}
