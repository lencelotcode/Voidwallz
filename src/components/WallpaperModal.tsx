import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Info,
  Monitor,
  Smartphone,
  X,
  Check,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useWallpaperStats } from "../hooks/useWallpaperStats";

export default function WallpaperModal({
  selectedWp,
  onClose,
  isOledOptimized = false,
}: {
  selectedWp: Wallpaper | null;
  onClose: () => void;
  isOledOptimized?: boolean;
}) {
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [previewMode, setPreviewMode] = useState<"frame" | "canvas">("frame");
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const { toggleFavorite, isFavorite, recordDownload, getDownloads, getLikes } =
    useWallpaperStats();

  const allRelevantWallpapers = useMemo(() => {
    if (!selectedWp) return [];
    return selectedWp.device === "desktop"
      ? desktopWallpapers
      : mobileWallpapers;
  }, [selectedWp, desktopWallpapers, mobileWallpapers]);

  const currentIndex = useMemo(() => {
    if (!selectedWp) return -1;
    return allRelevantWallpapers.findIndex((wp) => wp.id === selectedWp.id);
  }, [selectedWp, allRelevantWallpapers]);

  const handleNext = () => {
    const all =
      selectedWp?.device === "desktop" ? desktopWallpapers : mobileWallpapers;
    if (currentIndex < all.length - 1) {
      const nextWp = all[currentIndex + 1];
      const slug = nextWp.title.toLowerCase().replace(/\s+/g, "-");
      window.history.pushState(null, "", `/${nextWp.device}/${slug}/`);
      window.dispatchEvent(new Event("wallpaper-navigate"));
    }
  };

  const handlePrev = () => {
    const all =
      selectedWp?.device === "desktop" ? desktopWallpapers : mobileWallpapers;
    if (currentIndex > 0) {
      const prevWp = all[currentIndex - 1];
      const slug = prevWp.title.toLowerCase().replace(/\s+/g, "-");
      window.history.pushState(null, "", `/${prevWp.device}/${slug}/`);
      window.dispatchEvent(new Event("wallpaper-navigate"));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    if (selectedWp) {
      document.body.style.overflow = "hidden";
      setDownloadStatus("idle");
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWp, onClose, currentIndex, desktopWallpapers, mobileWallpapers]);

  const handleDownload = async () => {
    if (downloadStatus === "downloading" || !selectedWp) return;
    setDownloadStatus("downloading");

    const primaryUrl = selectedWp.originalUrl || selectedWp.previewUrl;

    if (!primaryUrl) {
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
      return;
    }

    try {
      let ext = "png";
      try {
        const path = new URL(primaryUrl).pathname;
        const detectedExt = path.split(".").pop()?.toLowerCase();
        if (detectedExt && ["jpg", "jpeg", "png", "webp", "avif"].includes(detectedExt)) {
          ext = detectedExt;
        }
      } catch {}

      const filename = `${selectedWp.title.replace(/\s+/g, "_")}.${ext}`;
      let downloaded = false;

      try {
        const res = await fetch(primaryUrl, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
          downloaded = true;
        }
      } catch (fetchErr) {
        console.warn("Direct blob fetch failed, trying fallback previewUrl", fetchErr);
        try {
          if (selectedWp.previewUrl && selectedWp.previewUrl !== primaryUrl) {
            const resFallback = await fetch(selectedWp.previewUrl, { mode: "cors" });
            if (resFallback.ok) {
              const blob = await resFallback.blob();
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
              downloaded = true;
            }
          }
        } catch (fallbackErr) {
          console.warn("Fallback fetch also failed, initiating direct link trigger", fallbackErr);
        }
      }
      if (!downloaded) {
        const a = document.createElement("a");
        a.href = primaryUrl;
        a.download = filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      recordDownload(selectedWp.id);
      setDownloadStatus("success");
      setTimeout(() => setDownloadStatus("idle"), 3000);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {selectedWp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 md:p-8"
          style={{ zIndex: 99999 }}
        >
          {/* Dark Luxury Blur Backdrop */}
          <div
            className="absolute inset-0 bg-void-black/95 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Modal Window Container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl max-h-[92vh] bg-[#090909] border border-white/15 flex flex-col md:flex-row shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative z-10 overflow-y-auto md:overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT: Visual Stage Section */}
            <div className="w-full md:w-3/5 min-h-[300px] sm:min-h-[380px] md:min-h-[520px] relative flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group bg-[#040404]">
              {/* Immersive blurred backdrop with atmospheric glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                key={`bg-${selectedWp.id}`}
                className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${selectedWp.tinyUrl || selectedWp.previewUrl})` }}
              />

              {/* TOP BAR: Clean Integrated View Switcher & Close Controls */}
              <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
                {/* Left: View Mode Switcher (Desktop Only) */}
                {selectedWp.device === "desktop" ? (
                  <div className="flex items-center gap-1 p-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-xl">
                    <button
                      onClick={() => setPreviewMode("frame")}
                      className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all ${
                        previewMode === "frame"
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Display
                    </button>
                    <button
                      onClick={() => setPreviewMode("canvas")}
                      className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all ${
                        previewMode === "canvas"
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Full Art
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-1.5 px-3 bg-black/80 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-white/80 uppercase tracking-widest">
                      PORTRAIT DISPLAY
                    </span>
                  </div>
                )}

                {/* Right: Spec Badge + Integrated Close Button */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="spec-badge text-[9px] font-mono px-3 py-1.5 rounded-full text-white/90 tracking-widest bg-black/80 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-1">
                    {selectedWp.device === "desktop" ? <Monitor size={10} /> : <Smartphone size={10} />}
                    {selectedWp.format || (selectedWp.device === "mobile" ? "4K MOBILE" : "8K MASTER")}
                  </span>

                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 active:scale-95 transition-all shadow-xl cursor-pointer"
                    title="Close Modal"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Stage Center Display */}
              <div className="relative z-10 w-full h-full p-4 pt-16 pb-6 sm:p-8 sm:pt-20 sm:pb-8 flex items-center justify-center">
                {previewMode === "frame" || selectedWp.device === "mobile" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    key={`frame-${selectedWp.id}`}
                    className="flex items-center justify-center w-full"
                  >
                    {selectedWp.device === "desktop" ? (
                      /* Apple Studio Display Pro Mockup - Balanced Aspect Ratio with generous arrow clearance */
                      <div className="relative flex flex-col items-center w-full max-w-[370px] sm:max-w-[420px] md:max-w-[435px]">
                        <div className="w-full aspect-[16/10] rounded-xl border-[3.5px] border-[#222] bg-black shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/15">
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full ring-1 ring-white/10 z-30 pointer-events-none" />
                          <OptimizedImage
                            src={selectedWp.previewUrl}
                            placeholder={selectedWp.tinyUrl}
                            fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                            alt={selectedWp.title}
                            priority={true}
                            className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                            containerClassName="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
                        </div>
                        {/* Slim Pedestal */}
                        <div className="w-14 h-3.5 bg-gradient-to-b from-[#222] to-[#141414] rounded-b-sm shadow-md ring-1 ring-white/10" />
                        <div className="w-24 sm:w-28 h-1 bg-[#282828] rounded-full shadow-lg ring-1 ring-white/10" />
                      </div>
                    ) : (
                      /* Titanium Pro iPhone Mockup (Ultra-Thin Bezel - Clean Display) */
                      <div className="relative w-[160px] sm:w-[190px] md:w-[210px] aspect-[9/19.5] rounded-[2.5rem] border-[3.5px] border-[#222] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/20 flex items-center justify-center overflow-hidden">
                        {/* Dynamic Island */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-30 ring-1 ring-white/10 flex items-center justify-end px-1.5 pointer-events-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#080808] ring-1 ring-blue-900/30" />
                        </div>

                        {/* Bottom Home Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/70 rounded-full z-20 pointer-events-none" />

                        {/* Wallpaper Image */}
                        <OptimizedImage
                          src={selectedWp.previewUrl}
                          placeholder={selectedWp.tinyUrl}
                          fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                          alt={selectedWp.title}
                          priority={true}
                          className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                          containerClassName="w-full h-full rounded-[2.2rem]"
                        />
                        {/* Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20 rounded-[2.2rem]" />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Clean Full Art Canvas Mode - True Widescreen 16:10 Aspect Ratio */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    key={`canvas-${selectedWp.id}`}
                    className="w-full h-full relative flex items-center justify-center p-3 sm:p-6"
                  >
                    <div className="relative w-full max-w-[380px] sm:max-w-[440px] md:max-w-[470px] aspect-[16/10] rounded-xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] ring-1 ring-white/20 bg-black flex items-center justify-center">
                      <OptimizedImage
                        src={selectedWp.previewUrl}
                        placeholder={selectedWp.tinyUrl}
                        fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                        alt={selectedWp.title}
                        priority={true}
                        className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] via-transparent to-transparent pointer-events-none z-20" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Left & Right Pagination Arrows */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous Wallpaper"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none z-30 cursor-pointer"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === allRelevantWallpapers.length - 1}
                aria-label="Next Wallpaper"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none z-30 cursor-pointer"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* RIGHT: Wallpaper Details & Action Panel */}
            <div className="w-full md:w-2/5 p-5 sm:p-6 md:p-8 flex flex-col justify-between bg-[#0b0b0b]">
              <div>
                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">
                      {selectedWp.serial || `V-${selectedWp.id}`} // {selectedWp.device === "desktop" ? "DESKTOP" : "PHONE"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-tight text-white">
                      {selectedWp.title}
                    </h2>
                  </div>

                  {/* Favorite / Like Button with Live Counter */}
                  <button
                    onClick={() => toggleFavorite(selectedWp.id)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border transition-all cursor-pointer ${
                      isFavorite(selectedWp.id)
                        ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/30"
                    }`}
                    title="Like Wallpaper"
                  >
                    <Heart
                      size={14}
                      fill={isFavorite(selectedWp.id) ? "currentColor" : "none"}
                    />
                    <span className="font-mono text-[10px] tracking-wider font-semibold">
                      {getLikes(selectedWp.id).toLocaleString()}
                    </span>
                  </button>
                </div>

                {/* Compact Specifications Grid */}
                <div className="border-t border-white/10 pt-4 mb-4">
                  <span className="text-[9px] opacity-40 font-mono uppercase tracking-[0.2em] block mb-2.5 flex items-center gap-1.5">
                    <Info size={11} />
                    Live Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase block">Category</span>
                      <span className="text-white/90 truncate block">{selectedWp.category}</span>
                    </div>
                    <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase block">Format</span>
                      <span className="text-white/90 truncate block">{selectedWp.format || "8K MASTER"}</span>
                    </div>
                    <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase block">Total Downloads</span>
                      <span className="text-white/90 truncate block font-bold">
                        {getDownloads(selectedWp.id, selectedWp.device).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase block">Appreciations</span>
                      <span className="text-white/90 truncate block font-bold text-red-300/90">
                        {getLikes(selectedWp.id).toLocaleString()} Likes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Download Original Button */}
              <div className="pt-3">
                <button
                  className={`w-full py-3.5 px-4 font-sans font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex justify-center items-center gap-2 shadow-xl cursor-pointer ${
                    downloadStatus === "success"
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : downloadStatus === "error"
                        ? "bg-red-500/20 text-red-400 border border-red-500/50"
                        : "bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  }`}
                  onClick={handleDownload}
                  disabled={downloadStatus === "downloading"}
                >
                  {downloadStatus === "downloading" ? (
                    "Downloading Master..."
                  ) : downloadStatus === "success" ? (
                    <>
                      <Check size={16} /> Download Complete!
                    </>
                  ) : (
                    <>
                      <Download size={15} /> Download Original
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
