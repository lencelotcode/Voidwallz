import { motion } from "motion/react";
import { useState } from "react";
import { useWallpapers } from "../hooks/useWallpapers";
import { Wallpaper } from "../types";
import { sound } from "../lib/soundEffects";
import OptimizedImage from "./OptimizedImage";
import WallpaperModal from "./WallpaperModal";

export default function LatestUploads({
  onOpenModal,
  isOledOptimized = false,
  onHoverWallpaper,
}: {
  onOpenModal: (wp: Wallpaper) => void;
  isOledOptimized?: boolean;
  onHoverWallpaper?: (url: string | null) => void;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();

  // Combine, sort by date, and take top 1
  const allWallpapers = [...desktopWallpapers, ...mobileWallpapers];
  const sorted = allWallpapers.sort(
    (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
  );
  const latestWallpapers = sorted.slice(0, 1);

  if (loading || latestWallpapers.length === 0) return null;

  return (
    <section className="border-t border-white/5 bg-void-black relative">
      <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-10 flex flex-col items-center justify-center border-b border-white/5 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-2 sm:mb-4">
          LATEST ADDITION_
        </h2>
        <span className="text-xs sm:text-sm font-mono uppercase tracking-widest opacity-40">
          Fresh From The Neural Generator
        </span>
      </div>

      <div className="w-full bg-white/5 border-y border-white/5">
        {latestWallpapers.map((wp, i) => (
          <motion.div
            key={`latest-${wp.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
            aria-label={`View latest wallpaper: ${wp.title}`}
            className={`relative flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover-trigger bg-void-black glass-sheen p-4 ${
              wp.device === "desktop"
                ? "h-[340px] sm:h-[420px] md:h-[500px]"
                : "h-[380px] sm:h-[480px] md:h-[600px]"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${wp.tinyUrl || wp.previewUrl})` }}
            />

            {/* Spec Badge Top Left */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
              <span className="spec-badge text-[8px] sm:text-[9px] font-mono px-2.5 sm:px-3 py-1 rounded-full text-white/80 tracking-widest uppercase">
                {wp.device === "desktop" ? "8K RAW MASTER" : "OLED MASTER"}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
              {wp.device === "desktop" ? (
                <>
                  <div className="w-[190px] sm:w-[220px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black rounded-lg relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 luxury-border-glow">
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
                </>
              ) : (
                <div className="w-[130px] sm:w-[150px] md:w-[160px] aspect-[9/19.5] border-[4px] md:border-[6px] border-black rounded-[1.8rem] md:rounded-[2rem] relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex items-center justify-center luxury-border-glow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-3 sm:h-4 bg-black rounded-b-lg sm:rounded-b-xl z-20" />
                  <OptimizedImage
                    src={wp.previewUrl}
                    placeholder={wp.tinyUrl}
                    fallbackSrc={wp.fallbackUrl || wp.previewUrl}
                    alt={wp.title}
                    className={isOledOptimized ? "oled-image" : ""}
                    containerClassName="w-full h-full rounded-[1.3rem] md:rounded-[1.5rem]"
                  />
                </div>
              )}
            </div>

            {/* Desktop Center Hover Overlay */}
            <div className="absolute inset-0 z-20 hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/30 backdrop-blur-sm">
              <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest border border-white/10 mb-1">
                {wp.category}
              </span>
              <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 mt-1 text-center max-w-[90%] leading-tight">
                {wp.title}
              </h3>
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
            <span className="text-[9px] sm:text-[10px] font-mono text-white/70">
              PREVIEW &rarr;
            </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
