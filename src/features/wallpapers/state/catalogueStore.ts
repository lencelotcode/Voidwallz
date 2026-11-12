import { createAsyncResource } from '../../../shared/state/createAsyncResource';
import { bundledCatalogue, emptyCatalogue, fetchWallpapers } from '../services/wallpaperRepository';
export const catalogueStore = createAsyncResource(fetchWallpapers, {
  initialData: emptyCatalogue,
  errorMessage: 'The wallpaper collection could not be loaded. Please try again.',
  fallback: (previous) =>
    previous.desktop.length || previous.mobile.length ? previous : bundledCatalogue(),
});
