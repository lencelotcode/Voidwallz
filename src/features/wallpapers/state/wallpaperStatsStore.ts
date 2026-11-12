import { createStore } from '../../../shared/state/createStore';
import { readStoredJson, writeStoredJson } from '../../../shared/storage/browserStorage';
const DOWNLOADS_KEY = 'voidwallz_real_downloads_v2';
const FAVORITES_KEY = 'voidwallz_favorites_v2';
const validFavorites = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((id) => typeof id === 'string');
const validDownloads = (value: unknown): value is Record<string, number> =>
  Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (count) => typeof count === 'number' && Number.isSafeInteger(count) && count >= 0,
    ),
  );
const read = () => ({
  favorites: readStoredJson(FAVORITES_KEY, [] as string[], validFavorites),
  downloads: readStoredJson(DOWNLOADS_KEY, {} as Record<string, number>, validDownloads),
});
export const wallpaperStatsStore = createStore(read());
export function toggleFavorite(id: string) {
  const previous = wallpaperStatsStore.getSnapshot();
  const favorites = previous.favorites.includes(id)
    ? previous.favorites.filter((value) => value !== id)
    : [...previous.favorites, id];
  // Update live UI even when persistence is blocked; storage failure is recoverable.
  wallpaperStatsStore.set({ ...previous, favorites });
  writeStoredJson(FAVORITES_KEY, favorites);
}
export function recordDownload(id: string) {
  const previous = wallpaperStatsStore.getSnapshot();
  const downloads = { ...previous.downloads, [id]: (previous.downloads[id] ?? 0) + 1 };
  wallpaperStatsStore.set({ ...previous, downloads });
  writeStoredJson(DOWNLOADS_KEY, downloads);
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === DOWNLOADS_KEY || event.key === FAVORITES_KEY)
      wallpaperStatsStore.set(read());
  });
