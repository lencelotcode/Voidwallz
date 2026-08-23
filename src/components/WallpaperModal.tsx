import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Info,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useFavorites } from "../hooks/useFavorites";

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
  const { toggleFavorite, isFavorite } = useFavorites();

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
    if (downloadStatus === "downloading") return;
    setDownloadStatus("downloading");

    const primaryUrl = selectedWp?.originalUrl || selectedWp?.previewUrl;
    const fallbackUrl = selectedWp?.previewUrl || selectedWp?.fallbackUrl;

    if (!primaryUrl) {
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
      return;
    }

    try {
      // Direct download of master asset
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
          className="fixed inset-0 flex items-center justify-center p-4 md:p-10"
          style={{ zIndex: 99999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-void-black/95 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Close Button */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 cursor-pointer group z-[100000]"
            onClick={onClose}
            data-cursor="CLOSE"
          >
            <div className="w-11 h-11 rounded-full luxury-glass flex items-center justify-center hover:bg-black/60 transition-all duration-300">
              <span className="text-void-light opacity-80 group-hover:opacity-100 text-lg">
                ✕
              </span>
            </div>
          </button>

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl max-h-[92vh] bg-void-black border border-white/10 flex flex-col md:flex-row shadow-[0_30px_100px_rgba(0,0,0,0.9)] relative z-10 overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section - Immersive Studio Preview */}
            <div className="w-full md:w-2/3 h-[50vh] md:h-auto relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group bg-[#070707]">
              {/* Immersive blurred backdrop with atmospheric glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                key={`bg-${selectedWp.id}`}
                className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${selectedWp.tinyUrl || selectedWp.previewUrl})` }}
              />

              {/* View Mode Switcher Pill (Studio vs Canvas) */}
              <div className="absolute top-6 left-6 md:top-8 md:left-8 z-40 flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                <button
                  onClick={() => setPreviewMode("frame")}
                  className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all ${
                    previewMode === "frame"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Display
                </button>
                <button
                  onClick={() => setPreviewMode("canvas")}
                  className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all ${
                    previewMode === "canvas"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Full Art
                </button>
              </div>

              {/* Resolution Spec Pill Top Right of Preview */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8 z-40">
                <span className="spec-badge text-[9px] font-mono px-3.5 py-1.5 rounded-full text-white/90 tracking-widest">
                  {selectedWp.format || "8K MASTER"}
                </span>
              </div>

              {/* Main Image in Studio Frame / Canvas */}
              <div className="relative z-10 w-full h-full p-6 pt-16 md:p-12 md:pt-20 flex flex-col items-center justify-center">
                {previewMode === "frame" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    key={`frame-${selectedWp.id}`}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    {selectedWp.device === "desktop" ? (
                      /* Apple Studio Display Pro Mockup */
                      <div className="relative flex flex-col items-center w-full max-w-[85%] transition-transform duration-500 group-hover:scale-[1.02]">
                        {/* Display Screen Chassis */}
                        <div className="w-full aspect-[16/10] rounded-xl border-[4px] md:border-[5px] border-[#161616] bg-black shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/15">
                          {/* Camera Mic Dot */}
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#222] rounded-full ring-1 ring-white/10 z-30 pointer-events-none flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-blue-500/60 rounded-full" />
                          </div>

                          <OptimizedImage
                            src={selectedWp.previewUrl}
                            placeholder={selectedWp.tinyUrl}
                            fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                            alt={selectedWp.title}
                            priority={true}
                            className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                            containerClassName="w-full h-full"
                          />

                          {/* Natural Studio Glass Glare */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
                        </div>

                        {/* Aluminum Stand Neck */}
                        <div className="w-16 h-7 md:h-9 bg-gradient-to-b from-[#222] to-[#121212] rounded-b-sm shadow-xl relative z-0 -mt-1 ring-1 ring-white/10" />
                        {/* Aluminum Stand Base Plate */}
                        <div className="w-40 md:w-48 h-1.5 md:h-2 bg-gradient-to-r from-[#202020] via-[#383838] to-[#202020] rounded-full shadow-2xl ring-1 ring-white/15" />
                      </div>
                    ) : (
                      /* iPhone Titanium Pro Chassis Mockup */
                      <div className="relative w-[210px] md:w-[240px] aspect-[9/19.5] rounded-[2.8rem] border-[5px] md:border-[7px] border-[#181818] bg-black shadow-[0_30px_70px_rgba(0,0,0,0.8)] ring-1 ring-white/20 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]">
                        {/* Dynamic Island */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2 ring-1 ring-white/10">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d0d] ring-1 ring-blue-900/30" />
                        </div>

                        <OptimizedImage
                          src={selectedWp.previewUrl}
                          placeholder={selectedWp.tinyUrl}
                          fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                          alt={selectedWp.title}
                          priority={true}
                          className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                          containerClassName="w-full h-full rounded-[2.3rem]"
                        />

                        {/* Glass Glare */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20 rounded-[2.3rem]" />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Full-Bleed Clean Canvas Mode */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    key={`canvas-${selectedWp.id}`}
                    className="w-full h-full max-h-[75vh] relative flex items-center justify-center"
                  >
                    <div className="relative w-full h-full max-w-[95%] max-h-[95%] rounded-lg overflow-hidden ring-1 ring-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex items-center justify-center">
                      <OptimizedImage
                        src={selectedWp.previewUrl}
                        placeholder={selectedWp.tinyUrl}
                        fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                        alt={selectedWp.title}
                        priority={true}
                        className={`w-full h-full object-contain ${isOledOptimized ? "oled-image" : ""}`}
                        containerClassName="w-full h-full"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Desktop Nav Controls - Styled as Floating Glass */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  data-cursor="PREV"
                  className="p-3.5 luxury-glass rounded-full pointer-events-auto disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95 transition-all text-white/80 hover:text-white"
                >
                  <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === allRelevantWallpapers.length - 1}
                  data-cursor="NEXT"
                  className="p-3.5 luxury-glass rounded-full pointer-events-auto disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95 transition-all text-white/80 hover:text-white"
                >
                  <ChevronRight size={24} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/3 p-6 md:p-10 flex flex-col justify-between bg-void-gray/30 backdrop-blur-md overflow-y-auto">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-serif italic tracking-tight mb-1 leading-none">
                      {selectedWp.title}
                    </h2>
                    <p className="font-mono text-[10px] opacity-40 uppercase tracking-widest">
                      {selectedWp.serial}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedWp.id)}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite(selectedWp.id)
                        ? "bg-red-500/20 text-red-500"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={isFavorite(selectedWp.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="space-y-8 mt-10 border-t border-white/5 pt-8">
                  <div>
                    <span className="text-[10px] opacity-30 font-mono uppercase tracking-[0.2em] block mb-4 flex items-center gap-2">
                      <Info size={12} />
                      Metadata
                    </span>
                    <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <span className="text-[9px] opacity-30 uppercase tracking-widest block mb-1">
                          Category
                        </span>
                        <span className="text-[12px] font-mono text-white/90">
                          {selectedWp.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] opacity-30 uppercase tracking-widest block mb-1">
                          Format
                        </span>
                        <span className="text-[12px] font-mono text-white/90">
                          {selectedWp.format}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] opacity-30 uppercase tracking-widest block mb-1">
                          Downloads
                        </span>
                        <span className="text-[12px] font-mono text-white/90">
                          {selectedWp.downloads?.toLocaleString() || "10,245"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] opacity-30 uppercase tracking-widest block mb-1">
                          Release
                        </span>
                        <span className="text-[12px] font-mono text-white/90">
                          {new Date(selectedWp.createdAt || Date.now()).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-5 font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex justify-center items-center gap-2 mt-10 ${
                  downloadStatus === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : downloadStatus === "error"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-white text-black hover:bg-white/80"
                }`}
                onClick={handleDownload}
                disabled={downloadStatus === "downloading"}
              >
                {downloadStatus === "downloading"
                  ? "Processing..."
                  : downloadStatus === "success"
                    ? "Ready"
                    : "Download Original"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
