import { useSyncExternalStore } from 'react';
import { getBaseDownloads, getBaseLikes } from '../services/wallpaperMetrics';
import { recordDownload, toggleFavorite, wallpaperStatsStore } from '../state/wallpaperStatsStore';
export { getBaseDownloads, getBaseLikes } from '../services/wallpaperMetrics';
export function useWallpaperStats() {
  const { favorites, downloads } = useSyncExternalStore(
    wallpaperStatsStore.subscribe,
    wallpaperStatsStore.getSnapshot,
    wallpaperStatsStore.getSnapshot,
  );
  return {
    favorites,
    recordDownload,
    toggleFavorite,
    isFavorite: (id: string) => favorites.includes(id),
    getDownloads: (id: string, device: 'desktop' | 'mobile' = 'desktop') =>
      getBaseDownloads(id, device) + (downloads[id] ?? 0),
    getLikes: (id: string) => getBaseLikes(id) + (favorites.includes(id) ? 1 : 0),
  };
}
