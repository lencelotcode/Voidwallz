import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Wallpaper } from "../types";

export default function WallpaperModal({
  selectedWp,
  onClose,
}: {
  selectedWp: Wallpaper | null;
  onClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (selectedWp) {
      document.body.style.overflow = "hidden";
      setIsDownloading(false);
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [selectedWp, onClose]);

  const handleDownload = () => {
    setIsDownloading(true);

    if (!selectedWp?.originalUrl) {
      console.error("No original URL available for download");
      setIsDownloading(false);
      return;
    }

    try {
      // Trigger download of original file
      const link = document.createElement("a");
      link.href = selectedWp.originalUrl;

      // Extract file extension from format (e.g., "8K AVIF" -> "avif")
      const formatParts = selectedWp.format.split(" ");
      const extension = formatParts[formatParts.length - 1].toLowerCase();

      link.download = `${selectedWp.title.replace(/\s+/g, "_")}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success feedback
      console.log(`Downloading: ${selectedWp.title} (${selectedWp.format})`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download wallpaper. Please try again.");
      setIsDownloading(false);
      return;
    }

    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1500);
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
            className="absolute inset-0 bg-void-black/95 backdrop-blur-xl hover-trigger"
            onClick={onClose}
          />

          {/* Close Button - Luxury Cinematic Design */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 cursor-pointer hover-trigger group z-[100000] modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <div className="w-11 h-11 rounded-full luxury-glass flex items-center justify-center hover:bg-black/60 transition-all duration-300 hover:scale-105">
              <span className="text-void-light opacity-80 group-hover:opacity-100 text-lg font-light tracking-wider">
                ✕
              </span>
            </div>
            {/* Close label appears on hover for desktop only */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden md:group-hover:block">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-all ml-2 whitespace-nowrap">
                Close
              </span>
            </div>
          </button>

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-void-black border border-white/10 flex flex-col md:flex-row shadow-2xl relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full md:w-3/5 min-h-[50vh] flex items-center justify-center bg-void-black/50 relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group p-6 md:p-8">
              <img
                src={selectedWp.previewUrl}
                loading="lazy"
                alt={selectedWp.title}
                className="w-full h-full object-contain max-h-full drop-shadow-2xl"
              />
            </div>

            <div className="w-full md:w-2/5 p-6 md:p-10 flex flex-col justify-between bg-void-gray/30 backdrop-blur-md">
              <div>
                <span className="text-[10px] opacity-40 font-mono mb-4 block uppercase tracking-widest">
                  Metadata
                </span>
                <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight mb-2 leading-none">
                  {selectedWp.title}
                </h2>
                <p className="font-mono text-xs opacity-60 uppercase tracking-widest">
                  {selectedWp.serial}
                </p>

                <div className="my-10 space-y-4 font-mono text-[10px] uppercase tracking-widest opacity-60">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Category</span>
                    <span className="text-white opacity-100">
                      {selectedWp.category}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Format</span>
                    <span className="text-white opacity-100">
                      {selectedWp.format}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Device</span>
                    <span className="text-white opacity-100 capitalize">
                      {selectedWp.device}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white/80 transition-colors hover-trigger flex justify-center items-center gap-2 mt-8 md:mt-0 relative group"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  Download High-Quality Original
                </span>
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Authorizing...
                  </>
                ) : (
                  `Download High-Quality (${selectedWp.format})`
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
