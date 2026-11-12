import { supabase } from '../../../shared/services/supabaseClient';
import type { Wallpaper } from '../../../shared/types/catalogue';
import { bundledDesktop, bundledMobile } from '../data/featuredWallpapers';
import { getBaseDownloads, getBaseLikes } from './wallpaperMetrics';

export const WALLPAPER_BUCKET = 'wallpapers';
export interface Catalogue {
  desktop: Wallpaper[];
  mobile: Wallpaper[];
  isUsingFallback: boolean;
  notice: string | null;
}
export const emptyCatalogue: Catalogue = {
  desktop: [],
  mobile: [],
  isUsingFallback: false,
  notice: null,
};
export function bundledCatalogue(): Catalogue {
  return {
    desktop: bundledDesktop,
    mobile: bundledMobile,
    isUsingFallback: true,
    notice: 'The full collection is unavailable.',
  };
}
export interface StorageImage {
  name: string;
  created_at?: string;
  updated_at?: string;
  metadata?: { size?: number; mimetype?: string };
}
export const isStorageImage = (file: StorageImage) =>
  (file.metadata?.size ?? 0) > 0 &&
  !file.name.startsWith('.') &&
  /\.(png|jpe?g|webp|avif|gif)$/i.test(file.name);
export function fileFormat(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return (
    { jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP', avif: 'AVIF', gif: 'GIF' }[ext] ??
    ext.toUpperCase()
  );
}
/** Keep filenames and titles exact: existing permalinks intentionally preserve leading spaces. */
export function mapWallpaper(
  file: StorageImage,
  device: Wallpaper['device'],
  previewUrl: string,
  originalUrl: string,
): Wallpaper {
  const title = file.name.replace(/\.[^/.]+$/, '') || file.name;
  const id = `${device}-${title}`;
  const hash = file.name
    .split('')
    .reduce((value, char) => ((value << 5) - value + char.charCodeAt(0)) | 0, 0);
  return {
    id,
    title,
    serial: `ID: V-${Math.abs(hash % 900) + 100}`,
    category: 'Wallpaper',
    format: `${fileFormat(file.name)}${device === 'mobile' ? ' MOBILE' : ''}`,
    downloads: getBaseDownloads(id, device),
    likes: getBaseLikes(id),
    previewUrl,
    tinyUrl: previewUrl,
    originalUrl,
    fallbackUrl: previewUrl,
    device,
    createdAt: file.created_at,
  };
}
export async function listStorageImages(
  folder: string,
  signal?: AbortSignal,
): Promise<StorageImage[]> {
  if (!supabase) return [];
  const files: StorageImage[] = [];
  for (let offset = 0; ; offset += 1000) {
    signal?.throwIfAborted();
    const { data, error } = await supabase.storage
      .from(WALLPAPER_BUCKET)
      .list(folder, { limit: 1000, offset, sortBy: { column: 'created_at', order: 'desc' } });
    signal?.throwIfAborted();
    if (error) throw new Error('Catalogue request failed');
    files.push(...(data ?? []));
    if (!data || data.length < 1000) return files;
    if (offset >= 50_000) throw new Error('Catalogue pagination limit reached');
  }
}
export async function fetchWallpapers(signal: AbortSignal): Promise<Catalogue> {
  if (!supabase) return bundledCatalogue();
  async function fetchDevice(device: Wallpaper['device']) {
    const [previews, originals] = await Promise.all([
      listStorageImages(`${device}/previews`, signal),
      listStorageImages(`${device}/originals`, signal).catch(() => [] as StorageImage[]),
    ]);
    const names = new Set(originals.filter(isStorageImage).map((file) => file.name));
    const bucket = supabase!.storage.from(WALLPAPER_BUCKET);
    return previews.filter(isStorageImage).map((file) => {
      const preview = bucket.getPublicUrl(`${device}/previews/${file.name}`).data.publicUrl;
      const original = names.has(file.name)
        ? bucket.getPublicUrl(`${device}/originals/${file.name}`).data.publicUrl
        : preview;
      return mapWallpaper(file, device, preview, original);
    });
  }
  const [desktop, mobile] = await Promise.all([fetchDevice('desktop'), fetchDevice('mobile')]);
  return { desktop, mobile, isUsingFallback: false, notice: null };
}
