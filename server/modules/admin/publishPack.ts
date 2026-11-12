import { PACK_CATEGORIES } from '../../../src/shared/contracts/uploads';
import { HttpError, textField, logSecurity } from '../../http/security';
import { serverDatabase } from '../../infrastructure/database';
import { MAX_PACK_BYTES, validateImage } from '../../validation/images';
import type { RequestContext } from '../../http/createEndpoint';

export async function publishPack(form: FormData, context: RequestContext) {
  const title = textField(form.get('title'), 'pack title', 3, 100);
  const tagline = textField(form.get('tagline') || '', 'description', 0, 240);
  const category = textField(form.get('category'), 'category', 1, 50);
  const device = textField(form.get('device'), 'device', 1, 10);
  if (
    !(PACK_CATEGORIES as readonly string[]).includes(category) ||
    !['desktop', 'mobile'].includes(device)
  )
    throw new HttpError(400, 'Invalid category or device.');
  const files = form.getAll('images');
  if (files.length < 1 || files.length > 5 || files.some((f) => !(f instanceof File)))
    throw new HttpError(400, 'Choose one to five images.');
  if ((files as File[]).reduce((sum, f) => sum + f.size, 0) > MAX_PACK_BYTES)
    throw new HttpError(413, 'Keep the combined image size below 3 MB.');
  const images = await Promise.all((files as File[]).map((f) => validateImage(f, MAX_PACK_BYTES)));
  const id = `pack-${device}-${crypto.randomUUID()}`;
  const db = serverDatabase();
  const paths: string[] = [];
  const items = [];
  try {
    for (const [i, image] of images.entries()) {
      const path = `packs/${device}/${id}/${String(i + 1).padStart(2, '0')}.${image.ext}`;
      const { error } = await db.storage.from('wallpapers').upload(path, image.bytes, {
        contentType: image.mime,
        upsert: false,
        cacheControl: '3600',
      });
      if (error) throw new Error('Upload failed');
      paths.push(path);
      const url = db.storage.from('wallpapers').getPublicUrl(path).data.publicUrl;
      items.push({
        id: `${id}-${i + 1}`,
        title: `${title} Part ${i + 1}`,
        serial: `VP-${i + 1}`,
        category,
        format: `${image.width} × ${image.height} ${image.ext.toUpperCase()}`,
        downloads: 0,
        likes: 0,
        previewUrl: url,
        tinyUrl: url,
        originalUrl: url,
        device,
      });
    }
    const { error } = await db.from('void_packs').insert({
      id,
      title,
      tagline,
      category,
      device,
      serial: id,
      format: 'Original images',
      downloads: 0,
      featured_image: items[0].previewUrl,
      items,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error('Publishing failed');
  } catch {
    if (paths.length) {
      try {
        const result = await db.storage.from('wallpapers').remove(paths);
        if (result.error) logSecurity('admin_cleanup_failed', context);
      } catch {
        logSecurity('admin_cleanup_failed', context);
      }
    }
    throw new HttpError(502, 'Publishing failed. Please try again.');
  }
  return id;
}
