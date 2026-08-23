import { useState, useEffect, useCallback } from "react";

// Deterministic seed generator from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate stable deterministic baseline downloads (e.g. 5,420 - 38,900)
export function getBaseDownloads(id: string, device: "desktop" | "mobile" = "desktop"): number {
  const hash = hashString(id);
  const multiplier = device === "mobile" ? 18000 : 9500;
  return (hash % multiplier) + 4200;
}

// Generate stable deterministic baseline likes (e.g. 680 - 6,400)
export function getBaseLikes(id: string): number {
  const hash = hashString(id);
  return (hash % 3800) + 480;
}

const DOWNLOADS_STORAGE_KEY = "voidwallz_real_downloads";
const FAVORITES_STORAGE_KEY = "voidwallz_favorites";

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

  // Record a real download
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

  // Toggle favorite / like
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

  // Get live downloads = stable baseline + real recorded downloads
  const getDownloads = useCallback(
    (id: string, device: "desktop" | "mobile" = "desktop") => {
      const base = getBaseDownloads(id, device);
      const extra = downloadMap[id] || 0;
      return base + extra;
    },
    [downloadMap]
  );

  // Get live likes = stable baseline + user like status
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
