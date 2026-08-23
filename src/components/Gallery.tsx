import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Heart } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useFavorites } from "../hooks/useFavorites";

export default function Gallery({
  view = "all",
  onOpenModal,
  isOledOptimized = false,
  onHoverWallpaper,
}: {
  view?: "all" | "desktop" | "phone";
  onOpenModal: (wp: Wallpaper) => void;
  isOledOptimized?: boolean;
  onHoverWallpaper?: (url: string | null) => void;
}) {
  const {
    desktopWallpapers,
    mobileWallpapers,
    loading,
    isUsingFallback,
    error,
    reload,
  } = useWallpapers();
  const { isFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(12);
  const observerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const all = [...desktopWallpapers, ...mobileWallpapers];
    const unique = Array.from(new Set(all.map((wp) => wp.category)));
    return unique.sort();
  }, [desktopWallpapers, mobileWallpapers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Filter wallpapers based on search and category
  const filterWallpapers = (wallpapers: Wallpaper[]) => {
    return wallpapers.filter((wp) => {
      const matchesSearch =
        wp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.category.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory === "Favorites") {
        matchesCategory = isFavorite(wp.id);
      } else if (selectedCategory) {
        matchesCategory = wp.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  };

  // Determine which wallpapers to display based on view
  const filteredDesktop = filterWallpapers(
    view === "phone" ? [] : desktopWallpapers,
  );
  const filteredMobile = filterWallpapers(
    view === "desktop" ? [] : mobileWallpapers,
  );

  const displayedDesktop = filteredDesktop.slice(0, visibleCount);
  const displayedMobile = filteredMobile.slice(0, visibleCount);

  const hasMore =
    visibleCount < filteredDesktop.length ||
    visibleCount < filteredMobile.length;

  return (
    <section
      id={view === "all" ? "gallery" : undefined}
      className={`border-t border-white/5 bg-void-black relative ${view !== "all" ? "min-h-[100dvh] pt-32 pb-24" : ""}`}
    >
      {/* Filters & Search */}
      <div className="sticky top-[73px] z-40 bg-void-black/80 backdrop-blur-md border-b border-white/5 px-6 md:px-10 py-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              selectedCategory === null
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("Favorites")}
            className={`whitespace-nowrap px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors flex items-center gap-1.5 ${
              selectedCategory === "Favorites"
                ? "bg-red-500/10 text-red-400 border-red-500/50"
                : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-red-400"
            }`}
          >
            <Heart
              size={12}
              fill={selectedCategory === "Favorites" ? "currentColor" : "none"}
              className={selectedCategory === "Favorites" ? "" : "opacity-70"}
            />
            Favorites
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                selectedCategory === cat
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="SEARCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 px-4 py-2 pl-10 text-xs font-mono uppercase tracking-widest text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm font-mono uppercase tracking-widest opacity-50">
              Loading Wallpapers...
            </span>
          </div>
        </div>
      )}

      {/* Skeleton Loading for Desktop */}
      {loading && (
        <>
          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-desktop-${i}`}
                  className="relative flex flex-col items-center justify-center h-[400px] md:h-[500px] overflow-hidden bg-void-black/30 animate-pulse"
                >
                  <div className="w-[200px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black/20 rounded-lg bg-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-white/5">
                    <div className="w-full h-full bg-black/20 animate-shimmer" />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Skeleton Loading for Mobile */}
      {loading && (
        <>
          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-mobile-${i}`}
                  className="relative flex flex-col items-center justify-center h-[500px] md:h-[600px] overflow-hidden bg-void-black/30 animate-pulse"
                >
                  <div className="w-[160px] aspect-[9/19.5] border-[6px] border-black/20 rounded-[2rem] bg-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/5 flex items-center justify-center">
                    <div className="w-full h-full bg-black/20 animate-shimmer rounded-[1.5rem]" />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Desktop Section */}
      {!loading && (view === "all" || view === "desktop") && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-24 px-10 flex flex-col items-center justify-center border-b border-white/5 bg-void-black text-center"
          >
            <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-4">
              SOME 🖥️ DESKTOP WALLPAPERS_
            </h2>
            <span className="text-sm font-mono uppercase tracking-widest opacity-40">
              High Resolution Mac / PC / Studio Displays
            </span>
            {isUsingFallback && (
              <div className="mt-2 flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-30 text-yellow-500/60">
                  Using fallback data (Supabase not connected)
                </span>
                {error && (
                  <div className="text-xs font-mono text-red-400/90 max-w-lg">
                    Error: {error}
                  </div>
                )}
                <div className="mt-2">
                  <button
                    onClick={() => reload()}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-white/10"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          {displayedDesktop.length > 0 ? (
            <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
              {displayedDesktop.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => onOpenModal(wp)}
                  onMouseEnter={() => onHoverWallpaper?.(wp.previewUrl)}
                  onMouseLeave={() => onHoverWallpaper?.(null)}
                  className="relative flex flex-col items-center justify-center h-[400px] md:h-[500px] overflow-hidden group cursor-pointer hover-trigger bg-void-black"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150 pointer-events-none"
                    style={{ backgroundImage: `url(${wp.tinyUrl || wp.previewUrl})` }}
                  />

                  <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
                    <div className="w-[200px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black rounded-lg relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                      <OptimizedImage
                        src={wp.previewUrl}
                        placeholder={wp.tinyUrl}
                        fallbackSrc={wp.fallbackUrl || wp.previewUrl}
                        alt={wp.title}
                        className={isOledOptimized ? "oled-image" : ""}
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div className="w-12 h-6 md:h-8 bg-gradient-to-b from-gray-800 to-black rounded-b-sm shadow-xl relative z-0 -mt-1" />
                    <div className="w-32 h-1 bg-gray-700 mx-auto rounded-t-full shadow-2xl" />
                  </div>

                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20 backdrop-blur-sm">
                    <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest">
                      {wp.category}
                    </span>
                    <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 mt-1 text-center max-w-[90%] leading-tight text-stroke-none">
                      {wp.title}
                    </h3>
                  </div>

                  {isFavorite(wp.id) && (
                    <div className="absolute top-6 right-6 z-30 drop-shadow-md">
                      <Heart
                        size={16}
                        fill="white"
                        className="text-white opacity-80"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm font-mono uppercase tracking-widest opacity-40">
                No desktop wallpapers available
              </p>
            </div>
          )}
        </>
      )}

      {/* Phone Section */}
      {!loading && (view === "all" || view === "phone") && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`py-24 px-10 flex flex-col items-center justify-center border-y border-white/5 bg-void-black text-center ${view === "all" ? "mt-px" : ""}`}
          >
            <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-4">
              SOME 🔥 PHONE WALLPAPERS_
            </h2>
            <span className="text-sm font-mono uppercase tracking-widest opacity-40">
              OLED Optimized For iOS / Android
            </span>
          </motion.div>
          {displayedMobile.length > 0 ? (
            <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
              {displayedMobile.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => onOpenModal(wp)}
                  onMouseEnter={() => onHoverWallpaper?.(wp.previewUrl)}
                  onMouseLeave={() => onHoverWallpaper?.(null)}
                  className="relative flex flex-col items-center justify-center h-[500px] md:h-[600px] overflow-hidden group cursor-pointer hover-trigger bg-void-black"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150 pointer-events-none"
                    style={{ backgroundImage: `url(${wp.tinyUrl || wp.previewUrl})` }}
                  />

                  <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
                    <div className="w-[160px] aspect-[9/19.5] border-[6px] border-black rounded-[2rem] relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex items-center justify-center">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-b-xl z-20" />
                      <OptimizedImage
                        src={wp.previewUrl}
                        placeholder={wp.tinyUrl}
                        fallbackSrc={wp.fallbackUrl || wp.previewUrl}
                        alt={wp.title}
                        className={isOledOptimized ? "oled-image" : ""}
                        containerClassName="w-full h-full rounded-[1.5rem]"
                      />
                    </div>
                  </div>

                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20 backdrop-blur-sm">
                    <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest">
                      {wp.category}
                    </span>
                    <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 mt-1 text-center max-w-[90%] leading-tight text-stroke-none">
                      {wp.title}
                    </h3>
                  </div>

                  {isFavorite(wp.id) && (
                    <div className="absolute top-6 right-6 z-30 drop-shadow-md">
                      <Heart
                        size={16}
                        fill="white"
                        className="text-white opacity-80"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm font-mono uppercase tracking-widest opacity-40">
                No mobile wallpapers available
              </p>
            </div>
          )}
        </>
      )}

      {/* Loading Sentinel for Infinite Scroll */}
      <div
        ref={observerRef}
        className="h-20 w-full flex items-center justify-center"
      >
        {hasMore && (
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </section>
  );
}
