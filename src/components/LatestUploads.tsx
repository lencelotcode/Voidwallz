import { motion } from "motion/react";
import { useState } from "react";
import { useWallpapers } from "../hooks/useWallpapers";
import { Wallpaper } from "../types";
import WallpaperModal from "./WallpaperModal";

export default function LatestUploads() {
  const [selectedWp, setSelectedWp] = useState<Wallpaper | null>(null);
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();

  // Combine, sort by date, and take top 1
  const allWallpapers = [...desktopWallpapers, ...mobileWallpapers];
  const latestWallpapers = allWallpapers
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 1);

  if (loading || latestWallpapers.length === 0) return null;

  return (
    <section className="py-24 border-t border-white/5 bg-void-black relative">
      <div className="px-10 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[10px] opacity-30 uppercase tracking-[0.3em] mb-4 block font-mono">
            New Arrival
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-light tracking-tighter leading-tight">
            Latest Upload
          </h2>
        </div>
        <a
          href="#gallery"
          className="text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors hover-trigger"
        >
          View Full Gallery &rarr;
        </a>
      </div>

      <div className="w-full bg-white/5 border-y border-white/5">
        {latestWallpapers.map((wp, i) => (
          <motion.div
            key={`latest-${wp.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            onClick={() => setSelectedWp(wp)}
            className={`relative flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover-trigger bg-void-black ${
              wp.device === "desktop"
                ? "h-[400px] md:h-[500px]"
                : "h-[500px] md:h-[600px]"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] scale-150"
              style={{ backgroundImage: `url(${wp.previewUrl})` }}
            />

            <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-[1.05] group-hover:-translate-y-2">
              {wp.device === "desktop" ? (
                <>
                  <div className="w-[200px] md:w-[260px] aspect-[16/10] border-[4px] md:border-[6px] border-black rounded-lg relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                    <img
                      src={wp.previewUrl}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      alt={wp.title}
                    />
                  </div>
                  <div className="w-12 h-6 md:h-8 bg-gradient-to-b from-gray-800 to-black rounded-b-sm shadow-xl relative z-0 -mt-1" />
                  <div className="w-32 h-1 bg-gray-700 mx-auto rounded-t-full shadow-2xl" />
                </>
              ) : (
                <div className="w-[160px] aspect-[9/19.5] border-[6px] border-black rounded-[2rem] relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex items-center justify-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-b-xl z-20" />
                  <img
                    src={wp.previewUrl}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[1.5rem]"
                    alt={wp.title}
                  />
                </div>
              )}
            </div>

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20 backdrop-blur-sm">
              <span className="bg-black text-white text-[10px] px-3 py-1 font-mono uppercase tracking-widest">
                {wp.category}
              </span>
              <h3 className="bg-white text-black text-xl md:text-2xl font-sans font-bold uppercase tracking-wider px-4 py-1 mt-1 text-center max-w-[90%] leading-tight text-stroke-none">
                {wp.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <WallpaperModal
        selectedWp={selectedWp}
        onClose={() => setSelectedWp(null)}
      />
    </section>
  );
}
