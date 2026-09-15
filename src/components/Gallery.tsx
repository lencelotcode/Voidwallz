import { motion, AnimatePresence } from "motion/react";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Heart, Download, ArrowUpRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import Magnetic from "./Magnetic";
import { triggerRadarPulse } from "../lib/radarPulse";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useWallpaperStats } from "../hooks/useWallpaperStats";
import { sound } from "../lib/soundEffects";
import { downloadWallpaperAsPng } from "../lib/downloadWallpaper";

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
  const { toggleFavorite, isFavorite, recordDownload, getLikes } =
    useWallpaperStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(12);
  const observerRef = useRef<HTMLDivElement>(null);

  // Fast 1-click download from card
  const handleQuickDownload = async (e: React.MouseEvent, wp: Wallpaper) => {
    e.stopPropagation();
    sound.playShutter();
    triggerRadarPulse(e.clientX, e.clientY, "emerald");
    const downloadUrl = wp.originalUrl || wp.previewUrl;
    if (!downloadUrl) return;

    try {
      await downloadWallpaperAsPng(downloadUrl, wp.title, wp.previewUrl);
      recordDownload(wp.id);
      sound.playSuccess();
    } catch (err) {
      console.error("Quick download failed:", err);
    }
  };

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
      <div className="sticky top-[57px] sm:top-[65px] md:top-[73px] z-40 bg-void-black/85 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 transition-all duration-300">
        {/* Categories with Fluid Segmented Spring Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] backdrop-blur-md rounded-lg border border-white/10 overflow-x-auto w-full md:w-auto pb-1 md:pb-1 scrollbar-hide">
          <button
            onClick={() => {
              sound.playTap();
              setSelectedCategory(null);
            }}
            className={`relative whitespace-nowrap px-3 sm:px-3.5 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest transition-colors duration-200 cursor-pointer rounded-md ${
              selectedCategory === null
                ? "text-black font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            {selectedCategory === null && (
              <motion.div
                layoutId="activeCategoryPill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white rounded-md shadow-[0_0_15px_rgba(255,255,255,0.4)] z-0"
              />
            )}
            <span className="relative z-10">All</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setSelectedCategory("Favorites");
            }}
            className={`relative whitespace-nowrap px-3 sm:px-3.5 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest transition-colors duration-200 cursor-pointer rounded-md flex items-center gap-1.5 ${
              selectedCategory === "Favorites"
                ? "text-red-300 font-bold"
                : "text-white/60 hover:text-red-400"
            }`}
          >
            {selectedCategory === "Favorites" && (
              <motion.div
                layoutId="activeCategoryPill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-red-500/20 border border-red-500/40 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.3)] z-0"
              />
            )}
            <Heart
              size={12}
              fill={selectedCategory === "Favorites" ? "currentColor" : "none"}
              className={`relative z-10 ${selectedCategory === "Favorites" ? "" : "opacity-70"}`}
            />
            <span className="relative z-10">Favorites</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playTap();
                setSelectedCategory(cat);
              }}
              className={`relative whitespace-nowrap px-3 sm:px-3.5 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest transition-colors duration-200 cursor-pointer rounded-md ${
                selectedCategory === cat
                  ? "text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {selectedCategory === cat && (
                <motion.div
                  layoutId="activeCategoryPill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-md shadow-[0_0_15px_rgba(255,255,255,0.4)] z-0"
                />
              )}
              <span className="relative z-10">{cat}</span>
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
            className="w-full bg-white/5 border border-white/10 px-4 py-2 pl-10 text-xs font-mono uppercase tracking-widest text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors rounded-lg"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-28 sm:py-40 gap-6 sm:gap-8">
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-white/80 border-r-2 border-transparent animate-spin" style={{ animationDuration: '1s' }} />
            <div className="absolute inset-2 rounded-full border-b-2 border-white/40 border-l-2 border-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 rounded-full border-t-2 border-white/20 border-r-2 border-transparent animate-spin" style={{ animationDuration: '2s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-pulse blur-[1px]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.3em] text-white/80 animate-pulse">
              Initializing Protocol
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/30">
              Fetching Master Assets...
            </span>
          </div>
        </div>
      )}

      {/* Desktop Section */}
      {!loading && (view === "all" || view === "desktop") && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-10 flex flex-col items-center justify-center border-b border-white/5 bg-void-black text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-2 sm:mb-4">
              DESKTOP ARCHIVES_
            </h2>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest opacity-40">
              Ultra High Resolution 8K & 6K
            </span>

            {/* Error or Fallback Notice */}
            {isUsingFallback && (
              <div className="mt-6 sm:mt-8 p-4 border border-white/10 bg-white/5 rounded max-w-xl text-center">
                <span className="text-xs font-mono text-yellow-400/90 block mb-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
              {displayedDesktop.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => {
                    sound.playOpenModal();
                    onOpenModal(wp);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      sound.playOpenModal();
                      onOpenModal(wp);
                    }
                  }}
                  onMouseEnter={() => onHoverWallpaper?.(wp.previewUrl)}
                  onMouseLeave={() => onHoverWallpaper?.(null)}
                  data-cursor="VIEW"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${wp.title} wallpaper`}
                  className="relative flex flex-col items-center justify-center h-[340px] sm:h-[400px] md:h-[500px] overflow-hidden group cursor-pointer hover-trigger bg-void-black glass-sheen p-4"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-50 transition-opacity duration-700 blur-[50px] scale-150 pointer-events-none"
                    style={{ backgroundImage: `url(${wp.tinyUrl || wp.previewUrl})` }}
                  />

                  {/* Spec Badge Top Left */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="spec-badge text-[8px] sm:text-[9px] font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-white/80 tracking-widest">
                      {wp.format || "8K MASTER"}
                    </span>
                  </div>

                  {/* Floating Action Top Right */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 flex items-center justify-end">
                    {/* Download button slides & expands on desktop, always visible on mobile */}
                    <div className="overflow-hidden transition-all duration-300 ease-out max-w-[40px] opacity-100 mr-2 md:max-w-0 md:opacity-0 md:mr-0 md:group-hover:max-w-[40px] md:group-hover:opacity-100 md:group-hover:mr-2">
                      <Magnetic strength={0.3}>
                        <button
                          onClick={(e) => handleQuickDownload(e, wp)}
                          data-cursor="GET"
                          title="1-Click Download"
                          aria-label={`Quick download ${wp.title} master`}
                          className="w-8 h-8 rounded-full bg-black/60 text-white/80 border border-white/15 hover:border-white/40 hover:text-white hover:scale-110 active:scale-95 backdrop-blur-md transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg"
                        >
                          <Download size={13} />
                        </button>
                      </Magnetic>
                    </div>

                    {/* Favorite Button anchored on right */}
                    <Magnetic strength={0.3}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playLike();
                          triggerRadarPulse(e.clientX, e.clientY, "crimson");
                          toggleFavorite(wp.id);
                        }}
                        data-cursor={isFavorite(wp.id) ? "SAVED" : "SAVE"}
                        title={isFavorite(wp.id) ? "Saved to Favorites" : "Save to Favorites"}
                        aria-label={isFavorite(wp.id) ? `Remove ${wp.title} from favorites` : `Save ${wp.title} to favorites`}
                        className={`w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg ${
                          isFavorite(wp.id)
                            ? "bg-red-500/20 text-red-500 border-red-500/40 scale-105"
                            : "bg-black/60 text-white/70 border-white/15 hover:border-white/35 hover:text-white hover:scale-110 active:scale-95"
                        }`}
                      >
                        <Heart
                          size={13}
                          fill={isFavorite(wp.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </Magnetic>
                  </div>

                  <motion.div
                    layoutId={`wp-display-frame-${wp.id}`}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2"
                  >
                    <div className="w-[190px] sm:w-[210px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black rounded-lg relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 luxury-border-glow">
                      <OptimizedImage
                        src={wp.previewUrl}
                        placeholder={wp.tinyUrl}
                        fallbackSrc={wp.fallbackUrl || wp.previewUrl}
                        alt={wp.title}
                        className={isOledOptimized ? "oled-image" : ""}
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div className="w-10 sm:w-12 h-5 sm:h-6 md:h-8 bg-gradient-to-b from-gray-800 to-black rounded-b-sm shadow-xl relative z-0 -mt-1" />
                    <div className="w-24 sm:w-32 h-1 bg-gray-700 mx-auto rounded-t-full shadow-2xl" />
                  </motion.div>

                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 z-20 hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/30 backdrop-blur-sm">
                    <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest border border-white/10 mb-1">
                      {wp.category}
                    </span>
                    <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 text-center max-w-[90%] leading-tight">
                      {wp.title}
                    </h3>
                    <span className="mt-3 flex items-center gap-1 text-[10px] font-mono text-white/70 tracking-widest uppercase">
                      Expand View <ArrowUpRight size={12} />
                    </span>
                  </div>

                  {/* Mobile Always-Visible Bottom Title Strip */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-end justify-between z-20 md:hidden pointer-events-none">
                    <div className="max-w-[80%]">
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block truncate">
                        {wp.category}
                      </span>
                      <h4 className="text-xs font-sans font-bold text-white uppercase tracking-tight truncate">
                        {wp.title}
                      </h4>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/70 flex items-center gap-0.5">
                      VIEW <ArrowUpRight size={11} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center">
                <Search size={18} className="text-white/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-mono uppercase tracking-widest text-white/60">
                  {searchQuery || selectedCategory
                    ? "Nothing matches your filters"
                    : "No desktop wallpapers available"}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-white/30">
                  {searchQuery || selectedCategory
                    ? "The void is empty here — try another query or category"
                    : "New master assets are being forged"}
                </p>
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-1 px-4 py-2 bg-white/5 border border-white/15 rounded-full text-[10px] font-mono uppercase tracking-widest text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
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
            className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-10 flex flex-col items-center justify-center border-y border-white/5 bg-void-black text-center ${view === "all" ? "mt-px" : ""}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-2 sm:mb-4">
              PHONE ARCHIVES_
            </h2>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest opacity-40">
              OLED Optimized For iOS / Android
            </span>
          </motion.div>
          {displayedMobile.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-px bg-void-black md:bg-white/5 px-2 sm:px-3 md:px-0">
              {displayedMobile.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => {
                    sound.playOpenModal();
                    onOpenModal(wp);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      sound.playOpenModal();
                      onOpenModal(wp);
                    }
                  }}
                  onMouseEnter={() => onHoverWallpaper?.(wp.previewUrl)}
                  onMouseLeave={() => onHoverWallpaper?.(null)}
                  data-cursor="VIEW"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${wp.title} wallpaper`}
                  className="relative flex flex-col items-center justify-center h-[310px] sm:h-[370px] md:h-[600px] rounded-xl md:rounded-none overflow-hidden group cursor-pointer hover-trigger bg-void-black border border-white/10 md:border-none glass-sheen p-2 sm:p-4"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-50 transition-opacity duration-700 blur-[50px] scale-150 pointer-events-none"
                    style={{ backgroundImage: `url(${wp.tinyUrl || wp.previewUrl})` }}
                  />

                  {/* Spec Badge Top Left */}
                  <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 z-20 opacity-85 md:opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="spec-badge text-[9px] sm:text-[10px] font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-white/80 tracking-widest">
                      OLED 4K
                    </span>
                  </div>

                  {/* Floating Action Top Right: Favorite button (plus desktop hover download) */}
                  <div className="absolute top-2.5 right-2.5 sm:top-5 sm:right-5 z-30 flex items-center justify-end">
                    {/* Desktop Hover Download Button */}
                    <div className="hidden md:flex overflow-hidden transition-all duration-300 ease-out max-w-0 opacity-0 mr-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:mr-2">
                      <Magnetic strength={0.3}>
                        <button
                          onClick={(e) => handleQuickDownload(e, wp)}
                          data-cursor="GET"
                          title="1-Click Download"
                          aria-label={`Quick download ${wp.title} master`}
                          className="w-8 h-8 rounded-full bg-black/60 text-white/80 border border-white/15 hover:border-white/40 hover:text-white hover:scale-110 active:scale-95 backdrop-blur-md transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg"
                        >
                          <Download size={12} />
                        </button>
                      </Magnetic>
                    </div>

                    {/* Favorite Button */}
                    <Magnetic strength={0.3}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playLike();
                          triggerRadarPulse(e.clientX, e.clientY, "crimson");
                          toggleFavorite(wp.id);
                        }}
                        data-cursor={isFavorite(wp.id) ? "SAVED" : "SAVE"}
                        title={isFavorite(wp.id) ? "Saved to Favorites" : "Save to Favorites"}
                        aria-label={isFavorite(wp.id) ? `Remove ${wp.title} from favorites` : `Save ${wp.title} to favorites`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg ${
                          isFavorite(wp.id)
                            ? "bg-red-500/20 text-red-500 border-red-500/40 scale-105"
                            : "bg-black/60 text-white/70 border-white/15 hover:border-white/35 hover:text-white hover:scale-110 active:scale-95"
                        }`}
                      >
                        <Heart
                          size={12}
                          fill={isFavorite(wp.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </Magnetic>
                  </div>

                  <motion.div
                    layoutId={`wp-display-frame-${wp.id}`}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2"
                  >
                    <div className="h-[180px] sm:h-[230px] md:h-[370px] w-auto aspect-[9/19.5] border-[3px] sm:border-[4.5px] md:border-[6px] border-black rounded-[1.3rem] sm:rounded-[1.7rem] md:rounded-[2rem] relative bg-black shadow-[0_15px_35px_rgba(0,0,0,0.6)] ring-1 ring-white/10 flex items-center justify-center luxury-border-glow">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 sm:w-10 md:w-14 h-2 sm:h-2.5 md:h-4 bg-black rounded-b-md sm:rounded-b-xl z-20" />
                      <OptimizedImage
                        src={wp.previewUrl}
                        placeholder={wp.tinyUrl}
                        fallbackSrc={wp.fallbackUrl || wp.previewUrl}
                        alt={wp.title}
                        className={isOledOptimized ? "oled-image" : ""}
                        containerClassName="w-full h-full rounded-[1.1rem] sm:rounded-[1.4rem] md:rounded-[1.6rem]"
                      />
                    </div>
                  </motion.div>

                  {/* Desktop Hover Center Overlay */}
                  <div className="absolute inset-0 z-20 hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/30 backdrop-blur-sm">
                    <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest border border-white/10 mb-1">
                      {wp.category}
                    </span>
                    <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 text-center max-w-[90%] leading-tight">
                      {wp.title}
                    </h3>
                    <span className="mt-3 flex items-center gap-1 text-[10px] font-mono text-white/70 tracking-widest uppercase">
                      Expand View <ArrowUpRight size={12} />
                    </span>
                  </div>

                  {/* Mobile Always-Visible Bottom Title Strip with Quick Download */}
                  <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between z-20 md:hidden">
                    <div className="max-w-[75%]">
                      <span className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase tracking-widest block truncate">
                        {wp.category}
                      </span>
                      <h4 className="text-[10px] sm:text-xs font-sans font-bold text-white uppercase tracking-tight truncate">
                        {wp.title}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => handleQuickDownload(e, wp)}
                      data-cursor="GET"
                      title="1-Click Download"
                      aria-label={`Quick download ${wp.title} master`}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    >
                      <Download size={11} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center">
                <Search size={18} className="text-white/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-mono uppercase tracking-widest text-white/60">
                  {searchQuery || selectedCategory
                    ? "Nothing matches your filters"
                    : "No phone wallpapers available"}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-white/30">
                  {searchQuery || selectedCategory
                    ? "The void is empty here — try another query or category"
                    : "New master assets are being forged"}
                </p>
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-1 px-4 py-2 bg-white/5 border border-white/15 rounded-full text-[10px] font-mono uppercase tracking-widest text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
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

