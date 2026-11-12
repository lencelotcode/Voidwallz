import { supabase } from '../../../shared/services/supabaseClient';
import type { Wallpaper, WallpaperPack } from '../../../shared/types/catalogue';
import {
  isStorageImage,
  listStorageImages,
  fileFormat,
  WALLPAPER_BUCKET,
  type StorageImage,
} from '../../wallpapers/services/wallpaperRepository';
import { getBaseDownloads } from '../../wallpapers/services/wallpaperMetrics';

export function isPack(value: unknown): value is WallpaperPack {
  if (!value || typeof value !== 'object') return false;
  const pack = value as Partial<WallpaperPack>;
  return (
    typeof pack.id === 'string' &&
    typeof pack.title === 'string' &&
    ['desktop', 'mobile'].includes(pack.device ?? '') &&
    Array.isArray(pack.items) &&
    pack.items.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.previewUrl === 'string',
    )
  );
}
function packFromRow(row: Record<string, unknown>): WallpaperPack | null {
  const pack = {
    id: row.id,
    title: row.title,
    serial: row.serial ?? '',
    tagline: row.tagline ?? '',
    category: row.category ?? 'General',
    device: row.device,
    format: row.format ?? 'Original images',
    downloads: row.downloads ?? 0,
    createdAt: row.created_at ?? '',
    featuredImage:
      row.featured_image ?? (row.items as Wallpaper[] | undefined)?.[0]?.previewUrl ?? '',
    items: row.items ?? [],
  };
  return isPack(pack) ? (pack as WallpaperPack) : null;
}
function storagePack(
  files: StorageImage[],
  device: Wallpaper['device'],
  group: string,
  folder: string | null,
  position: number,
): WallpaperPack {
  const screen = device === 'desktop' ? 'Desktop Suite' : 'Phone Deck';
  const code = device === 'desktop' ? 'D' : 'M';
  const slug = group.toLowerCase().replace(/\s+/g, '-');
  const id = folder ? `pack-${device}-${folder}` : `pack-direct-${device}-${slug}`;
  const items = files.filter(isStorageImage).map((file, index): Wallpaper => {
    const path = `packs/${device}/${folder ? `${folder}/` : ''}${file.name}`;
    const url = supabase!.storage.from(WALLPAPER_BUCKET).getPublicUrl(path).data.publicUrl;
    const name = file.name
      .replace(/^\d+[-_]?/, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ');
    const itemId = folder
      ? `${folder}-${file.name}`
      : `direct-${device === 'desktop' ? 'd' : 'm'}-${file.name}`;
    return {
      id: itemId,
      title: name.charAt(0).toUpperCase() + name.slice(1),
      serial: `ID: VP-${code}${index + 1}`,
      category: screen,
      format: fileFormat(file.name),
      downloads: getBaseDownloads(itemId, device),
      previewUrl: url,
      tinyUrl: url,
      originalUrl: url,
      device,
      createdAt: file.created_at,
    };
  });
  return {
    id,
    title: group.replace(/[-_]/g, ' ').toUpperCase(),
    serial: `PACK: VP-${code}${position + 1}`,
    tagline: `Curated ${items.length}-piece ${device} wallpaper collection.`,
    category: screen,
    device,
    format: 'Original images',
    downloads: getBaseDownloads(id, device),
    createdAt: files[0]?.created_at ?? '',
    featuredImage: items[0]?.previewUrl ?? '',
    items,
  };
}
async function storagePacks(device: Wallpaper['device'], signal: AbortSignal) {
  const entries = await listStorageImages(`packs/${device}`, signal);
  const folders = entries.filter((entry) => !entry.name.startsWith('.') && !entry.metadata);
  const packs: WallpaperPack[] = [];
  for (const folder of folders) {
    const files = (await listStorageImages(`packs/${device}/${folder.name}`, signal)).filter(
      isStorageImage,
    );
    if (files.length)
      packs.push(storagePack(files, device, folder.name, folder.name, packs.length));
  }
  const groups = new Map<string, StorageImage[]>();
  for (const file of entries.filter(isStorageImage)) {
    const match = file.name.match(/^([a-zA-Z0-9\s_-]+?)(?:[-_ ]+(?:0?[1-9]|10)|\.[^/.]+$)/);
    const prefix = match ? match[1].replace(/[-_]/g, ' ').trim() : 'Master';
    groups.set(prefix, [...(groups.get(prefix) ?? []), file]);
  }
  for (const [group, files] of groups)
    packs.push(storagePack(files, device, group, null, packs.length));
  return packs;
}
export async function fetchPacks(signal: AbortSignal): Promise<WallpaperPack[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('void_packs')
    .select('*')
    .order('created_at', { ascending: false })
    .abortSignal(signal);
  signal.throwIfAborted();
  if (!error && data?.length) {
    const packs = data
      .map((row) => packFromRow(row))
      .filter((pack): pack is WallpaperPack => pack !== null);
    if (packs.length !== data.length) throw new Error('Invalid catalogue data');
    return packs;
  }
  // Older installations may have storage-only packs. Both screen formats use one loader.
  const results = await Promise.allSettled([
    storagePacks('desktop', signal),
    storagePacks('mobile', signal),
  ]);
  if (results.some((result) => result.status === 'rejected'))
    throw new Error('Pack archive is unavailable');
  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}
