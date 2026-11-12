/** Public request limits shared by form UX and authoritative server validation. */
export const PACK_CATEGORIES = [
  'Cyber / Synth',
  'Liquid / Fluid',
  'Dark / Geometry',
  'Space / OLED',
  'Noir / Chroma',
  'Minimal / Abstract',
  'Texture / Film',
] as const;
export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_PACK_FILES = 5;
export const MAX_PACK_BYTES = 3 * 1024 * 1024;
export const MAX_REPORT_BYTES = 2 * 1024 * 1024;
