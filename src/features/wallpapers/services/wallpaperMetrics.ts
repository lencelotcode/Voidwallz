// Fast deterministic 32-bit string hash for stable metrics across renders & sessions
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic baseline downloads (realistic high-fidelity metrics seeded by id)
export function getBaseDownloads(id: string, device: 'desktop' | 'mobile' = 'desktop'): number {
  if (id?.startsWith('bundled-')) return 0;
  if (!id) return 2450;
  const seed = hashString(id);
  if (device === 'desktop') {
    // Desktop range: 2,140 to 8,650
    return 2140 + (seed % 6511);
  } else {
    // Mobile range: 2,480 to 9,720
    return 2480 + (seed % 7241);
  }
}

// Deterministic baseline likes (realistic appreciations seeded by id, ~6% to 11% of downloads)
export function getBaseLikes(id: string): number {
  if (id?.startsWith('bundled-')) return 0;
  if (!id) return 240;
  const seed = hashString(id);
  // Realistic like range: 180 to 740
  return 180 + (seed % 561);
}
