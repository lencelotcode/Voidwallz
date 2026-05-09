import { motion } from "motion/react";
import { useState } from "react";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import WallpaperModal from "./WallpaperModal";

export default function Gallery({
  view = "all",
}: {
  view?: "all" | "desktop" | "phone";
}) {
  const [selectedWp, setSelectedWp] = useState<Wallpaper | null>(null);
  const { desktopWallpapers, mobileWallpapers, loading, isUsingFallback, error, reload } = useWallpapers();

  // Determine which wallpapers to display based on view
  const displayedDesktop = view === "phone" ? [] : desktopWallpapers;
  const displayedMobile = view === "desktop" ? [] : mobileWallpapers;

  return (
    <section
      id={view === "all" ? "gallery" : undefined}
      className={`border-t border-white/5 bg-void-black relative ${view !== "all" ? "min-h-[100dvh] pt-32 pb-24" : ""}`}
    >
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

      {/* Desktop Section */}
      {!loading && (view === "all" || view === "desktop") && (
        <>
          <div className="py-24 px-10 flex flex-col items-center justify-center border-b border-white/5 bg-void-black text-center">
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
          </div>
          {displayedDesktop.length > 0 ? (
            <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
              {displayedDesktop.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => setSelectedWp(wp)}
                  className="relative flex flex-col items-center justify-center h-[400px] md:h-[500px] overflow-hidden group cursor-pointer hover-trigger bg-void-black"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150"
                    style={{ backgroundImage: `url(${wp.imgUrl})` }}
                  />

                  <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
                    <div className="w-[200px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black rounded-lg relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                      <img
                        src={wp.imgUrl}
                        className="w-full h-full object-cover"
                        alt={wp.title}
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
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] bg-black/50 backdrop-blur-md px-3 py-1 font-mono uppercase tracking-widest text-white/80 border border-white/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      {wp.downloads.toLocaleString()}
                    </div>
                  </div>
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
          <div
            className={`py-24 px-10 flex flex-col items-center justify-center border-y border-white/5 bg-void-black text-center ${view === "all" ? "mt-px" : ""}`}
          >
            <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-4">
              SOME 🔥 PHONE WALLPAPERS_
            </h2>
            <span className="text-sm font-mono uppercase tracking-widest opacity-40">
              OLED Optimized For iOS / Android
            </span>
          </div>
          {displayedMobile.length > 0 ? (
            <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-white/5">
              {displayedMobile.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => setSelectedWp(wp)}
                  className="relative flex flex-col items-center justify-center h-[500px] md:h-[600px] overflow-hidden group cursor-pointer hover-trigger bg-void-black"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150"
                    style={{ backgroundImage: `url(${wp.imgUrl})` }}
                  />

                  <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
                    <div className="w-[160px] aspect-[9/19.5] border-[6px] border-black rounded-[2rem] relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex items-center justify-center">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-b-xl z-20" />
                      <img
                        src={wp.imgUrl}
                        className="w-full h-full object-cover rounded-[1.5rem]"
                        alt={wp.title}
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
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] bg-black/50 backdrop-blur-md px-3 py-1 font-mono uppercase tracking-widest text-white/80 border border-white/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      {wp.downloads.toLocaleString()}
                    </div>
                  </div>
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

      <WallpaperModal
        selectedWp={selectedWp}
        onClose={() => setSelectedWp(null)}
      />
    </section>
  );
}
