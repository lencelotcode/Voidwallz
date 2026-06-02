import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Monitor,
  Smartphone,
  Download,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useFavorites } from "../hooks/useFavorites";
import { DEVICES, cropImageToDevice, DeviceSpec } from "../lib/crop";

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
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec | null>(null);
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Filter devices based on current wallpaper type
  const relevantDevices = useMemo(() => {
    if (!selectedWp) return [];
    return DEVICES.filter((d) =>
      selectedWp.device === "desktop" ? d.width > d.height : d.height > d.width,
    );
  }, [selectedWp]);

  const currentIndex = useMemo(() => {
    if (!selectedWp) return -1;
    const all =
      selectedWp.device === "desktop" ? desktopWallpapers : mobileWallpapers;
    return all.findIndex((wp) => wp.id === selectedWp.id);
  }, [selectedWp, desktopWallpapers, mobileWallpapers]);

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
      setSelectedDevice(null);
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

    if (!selectedWp?.originalUrl) {
      setDownloadStatus("error");
      return;
    }

    try {
      let blob: Blob;
      let filename: string;

      if (selectedDevice) {
        blob = await cropImageToDevice(selectedWp.originalUrl, selectedDevice);
        filename = `${selectedWp.title.replace(/\s+/g, "_")}_${selectedDevice.name.replace(/\s+/g, "_")}.png`;
      } else {
        const response = await fetch(selectedWp.originalUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        blob = await response.blob();
        const urlPath = new URL(selectedWp.originalUrl).pathname;
        const extension = urlPath.split(".").pop() || "png";
        filename = `${selectedWp.title.replace(/\s+/g, "_")}.${extension}`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

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
          className="fixed inset-0 flex items-center justify-center p-4 md:p-12"
          style={{ zIndex: 99999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-void-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Close Button */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 cursor-pointer group z-[100000]"
            onClick={onClose}
          >
            <div className="w-11 h-11 rounded-full luxury-glass flex items-center justify-center hover:bg-black/60 transition-all duration-300">
              <span className="text-void-light opacity-80 group-hover:opacity-100 text-lg">
                ✕
              </span>
            </div>
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-6xl max-h-[90vh] bg-void-black border border-white/10 flex flex-col md:flex-row shadow-2xl relative z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section - Immersive Preview */}
            <div className="w-full md:w-2/3 h-[50vh] md:h-auto relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group bg-black">
              {/* Immersive blurred backdrop to fill gaps elegantly */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                key={`bg-${selectedWp.id}`}
                className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${selectedWp.tinyUrl})` }}
              />

              {/* Main Image in a "Device Frame" */}
              <div className="relative z-10 w-full h-full p-6 md:p-12 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={`frame-${selectedWp.id}`}
                  className={`
                    relative shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden
                    ${
                      selectedWp.device === "desktop"
                        ? "w-full max-w-[90%] aspect-[16/10] rounded-xl border-[6px] md:border-[10px] border-black"
                        : "h-full max-h-[85vh] aspect-[9/19.5] rounded-[2.5rem] md:rounded-[3rem] border-[8px] md:border-[12px] border-black"
                    }
                    bg-black ring-1 ring-white/10
                  `}
                >
                  {/* Dynamic device-specific details */}
                  {selectedWp.device === "mobile" && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-5 bg-black rounded-b-2xl z-20" />
                  )}

                  <OptimizedImage
                    src={selectedWp.previewUrl}
                    placeholder={selectedWp.tinyUrl}
                    alt={selectedWp.title}
                    className={`transition-transform duration-700 group-hover:scale-105 ${isOledOptimized ? "oled-image" : ""}`}
                    containerClassName="w-full h-full"
                  />

                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </div>

              {/* Desktop Nav Controls - Styled as Floating Glass */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-3 luxury-glass rounded-full pointer-events-auto disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95 transition-all text-white/80 hover:text-white"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 luxury-glass rounded-full pointer-events-auto hover:scale-110 active:scale-95 transition-all text-white/80 hover:text-white"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
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

                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] opacity-30 font-mono uppercase tracking-[0.2em] block">
                      Optimize for Device
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedDevice(null)}
                        className={`flex items-center gap-2 px-3 py-2 border text-[10px] font-mono uppercase tracking-widest transition-all ${
                          selectedDevice === null
                            ? "bg-white text-black border-white"
                            : "border-white/10 text-white/40 hover:border-white/30"
                        }`}
                      >
                        <Download size={12} />
                        Original
                      </button>
                      {relevantDevices.map((device) => (
                        <button
                          key={device.name}
                          onClick={() => setSelectedDevice(device)}
                          className={`flex items-center gap-2 px-3 py-2 border text-[10px] font-mono uppercase tracking-widest transition-all ${
                            selectedDevice?.name === device.name
                              ? "bg-white text-black border-white"
                              : "border-white/10 text-white/40 hover:border-white/30"
                          }`}
                        >
                          {selectedWp.device === "desktop" ? (
                            <Monitor size={12} />
                          ) : (
                            <Smartphone size={12} />
                          )}
                          {device.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-6">
                    <span className="text-[10px] opacity-30 font-mono uppercase tracking-[0.2em] block">
                      Properties
                    </span>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <span className="text-[9px] opacity-30 block">
                          Category
                        </span>
                        <span className="text-[11px] font-mono">
                          {selectedWp.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] opacity-30 block">
                          Format
                        </span>
                        <span className="text-[11px] font-mono">
                          {selectedWp.format}
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
                    : selectedDevice
                      ? `Get for ${selectedDevice.name}`
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
