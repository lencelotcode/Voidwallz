import { createAsyncResource } from '../../../shared/state/createAsyncResource';
import { readStoredJson, writeStoredJson } from '../../../shared/storage/browserStorage';
import type { WallpaperPack } from '../../../shared/types/catalogue';
import { fetchPacks, isPack } from '../services/packRepository';
const CACHE_KEY = 'voidwallz_cached_packs_v4';
const validCache = (value: unknown): value is WallpaperPack[] =>
  Array.isArray(value) && value.every(isPack);
export const packsStore = createAsyncResource(fetchPacks, {
  initialData: readStoredJson(CACHE_KEY, [] as WallpaperPack[], validCache),
  errorMessage: 'The pack collection could not be loaded. Please try again.',
});
packsStore.subscribe(() => {
  const state = packsStore.getSnapshot();
  if (state.status === 'success') writeStoredJson(CACHE_KEY, state.data);
});
