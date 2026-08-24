import { useState, useEffect, useCallback } from "react";

// Real deterministic baseline stats (starts at 0, counts purely real user interactions)
export function getBaseDownloads(_id: string, _device: "desktop" | "mobile" = "desktop"): number {
  return 0;
}

export function getBaseLikes(_id: string): number {
  return 0;
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

  // Get live downloads = real recorded downloads count (starts at 0)
  const getDownloads = useCallback(
    (id: string, _device: "desktop" | "mobile" = "desktop") => {
      return downloadMap[id] || 0;
    },
    [downloadMap]
  );

  // Get live likes = 1 if liked by user, 0 otherwise
  const getLikes = useCallback(
    (id: string) => {
      return favorites.includes(id) ? 1 : 0;
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
