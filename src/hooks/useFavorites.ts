import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // Load favorites from local storage on mount
    const storedFavorites = localStorage.getItem("voidwallz_favorites");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites from local storage", e);
      }
    }
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      let newFavorites;
      if (prev.includes(id)) {
        newFavorites = prev.filter((favId) => favId !== id);
      } else {
        newFavorites = [...prev, id];
      }
      localStorage.setItem("voidwallz_favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
