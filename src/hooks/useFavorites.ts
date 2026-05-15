import { useState, useEffect, useCallback } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(() => {
    const storedFavorites = localStorage.getItem("voidwallz_favorites");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites from local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    // Sync across tabs/instances
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "voidwallz_favorites") {
        loadFavorites();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-tab sync
    window.addEventListener("favorites-updated", loadFavorites);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", loadFavorites);
    };
  }, [loadFavorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      let newFavorites;
      if (prev.includes(id)) {
        newFavorites = prev.filter((favId) => favId !== id);
      } else {
        newFavorites = [...prev, id];
      }
      localStorage.setItem("voidwallz_favorites", JSON.stringify(newFavorites));
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new Event("favorites-updated"));
      return newFavorites;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
