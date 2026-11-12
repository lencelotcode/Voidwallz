import JSZip from 'jszip';
import type { WallpaperPack } from '../../../shared/types/catalogue';
import { fetchImageAsPngArrayBuffer } from '../../downloads/services/downloadWallpaper';
import { beginDownload, updateDownload, finishDownload } from '../../downloads/state/downloadStore';
/** ZIP preparation is domain work, independent of the preview's UI state. */
export async function downloadPack(pack: WallpaperPack, onProgress: (count: number) => void) {
  const activity = beginDownload(
    pack.title,
    pack.featuredImage || pack.items[0]?.previewUrl,
    'pack',
    pack.items.length,
  );
  try {
    if (!pack.items.length) throw new Error('Empty pack');
    const zip = new JSZip();
    zip.file(
      'README.txt',
      `${pack.title}\n${pack.items.length} wallpapers from Voidwallz.\nPersonal use: https://voidwallz.live/license\n`,
    );
    for (const [index, item] of pack.items.entries()) {
      const data = await fetchImageAsPngArrayBuffer(
        item.originalUrl || item.previewUrl,
        item.previewUrl,
      );
      zip.file(
        `${String(index + 1).padStart(2, '0')}-${item.title.replace(/[^a-z0-9-]/gi, '-')}.png`,
        data,
      );
      onProgress(index + 1);
      updateDownload(activity, { prepared: index + 1 });
    }
    updateDownload(activity, { phase: 'packing' });
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `Voidwallz-${pack.title.replace(/[^a-z0-9-]/gi, '-')}.zip`;
      link.click();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    finishDownload(activity, true);
  } catch (error) {
    finishDownload(activity, false);
    throw error;
  }
}
