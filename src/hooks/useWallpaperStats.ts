import { useState, useEffect, useCallback } from "react";

// Fast deterministic 32-bit string hash for stable metrics across renders & sessions
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic baseline downloads (realistic high-fidelity metrics seeded by id)
export function getBaseDownloads(id: string, device: "desktop" | "mobile" = "desktop"): number {
  if (!id) return 2450;
  const seed = hashString(id);
  if (device === "desktop") {
    // Desktop range: 2,140 to 8,650
    return 2140 + (seed % 6511);
  } else {
    // Mobile range: 2,480 to 9,720
    return 2480 + (seed % 7241);
  }
}

// Deterministic baseline likes (realistic appreciations seeded by id, ~6% to 11% of downloads)
export function getBaseLikes(id: string): number {
  if (!id) return 240;
  const seed = hashString(id);
  // Realistic like range: 180 to 740
  return 180 + (seed % 561);
}

const DOWNLOADS_STORAGE_KEY = "voidwallz_real_downloads_v2";
const FAVORITES_STORAGE_KEY = "voidwallz_favorites_v2";

export function useWallpaperStats() {
  const [downloadMap, setDownloadMap] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadStats = useCallback(() => {
    try {
      const storedDownloads = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
      if (storedDownloads) {
        setDownloadMap(JSON.parse(storedDownloads));
      }
      const storedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (e) {
      console.error("Failed to parse wallpaper stats from storage", e);
    }
  }, []);

  useEffect(() => {
    loadStats();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === DOWNLOADS_STORAGE_KEY || e.key === FAVORITES_STORAGE_KEY) {
        loadStats();
      }
    };

    const handleCustomUpdate = () => {
      loadStats();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("wallpaper-stats-updated", handleCustomUpdate);
    window.addEventListener("favorites-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("wallpaper-stats-updated", handleCustomUpdate);
      window.removeEventListener("favorites-updated", handleCustomUpdate);
    };
  }, [loadStats]);

  // Record a real download (+1)
  const recordDownload = useCallback((id: string) => {
    setDownloadMap((prev) => {
      const current = prev[id] || 0;
      const next = { ...prev, [id]: current + 1 };
      try {
        localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("wallpaper-stats-updated"));
      } catch (err) {
        console.error("Failed to save download to localStorage", err);
      }
      return next;
    });
  }, []);

  // Toggle favorite / like (+1 / 0)
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((favId) => favId !== id);
      } else {
        next = [...prev, id];
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("favorites-updated"));
        window.dispatchEvent(new Event("wallpaper-stats-updated"));
      } catch (err) {
        console.error("Failed to save favorite to localStorage", err);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  // Get live downloads = deterministic baseline + real recorded downloads count
  const getDownloads = useCallback(
    (id: string, device: "desktop" | "mobile" = "desktop") => {
      const base = getBaseDownloads(id, device);
      const userDownloads = downloadMap[id] || 0;
      return base + userDownloads;
    },
    [downloadMap]
  );

  // Get live likes = deterministic baseline + (1 if user favorited, 0 otherwise)
  const getLikes = useCallback(
    (id: string) => {
      const base = getBaseLikes(id);
      const userLiked = favorites.includes(id) ? 1 : 0;
      return base + userLiked;
    },
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    recordDownload,
    getDownloads,
    getLikes,
  };
}
