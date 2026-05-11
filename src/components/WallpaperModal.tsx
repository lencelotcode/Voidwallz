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
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (selectedWp) {
      document.body.style.overflow = "hidden";
      setDownloadStatus("idle");
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [selectedWp, onClose]);

  const handleDownload = async () => {
    if (downloadStatus === "downloading") return;
    setDownloadStatus("downloading");

    if (!selectedWp?.originalUrl) {
      console.error("No original URL available for download");
      setDownloadStatus("error");
      return;
    }

    try {
      // Use fetch to download the blob, which avoids browser security blocks on direct cross-origin links
      const response = await fetch(selectedWp.originalUrl);

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;

      // Extract file extension from originalUrl
      const urlPath = new URL(selectedWp.originalUrl).pathname;
      const extension = urlPath.split(".").pop() || "png";

      link.download = `${selectedWp.title.replace(/\s+/g, "_")}.${extension}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success feedback
      setDownloadStatus("success");
      console.log(`Downloading: ${selectedWp.title} (${selectedWp.format})`);

      // Revert back to idle after 3 seconds
      setTimeout(() => {
        setDownloadStatus("idle");
      }, 3000);
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
                className={`w-full py-4 font-bold uppercase tracking-widest text-[10px] transition-all hover-trigger flex justify-center items-center gap-2 mt-8 md:mt-0 relative group ${
                  downloadStatus === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : downloadStatus === "error"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-white text-black hover:bg-white/80"
                }`}
                onClick={handleDownload}
                disabled={downloadStatus === "downloading"}
              >
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {downloadStatus === "success"
                    ? "Download Complete"
                    : downloadStatus === "error"
                      ? "Download Failed"
                      : "Download High-Quality Original"}
                </span>
                {downloadStatus === "downloading" ? (
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
                ) : downloadStatus === "success" ? (
                  <>
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Download Successful
                  </>
                ) : downloadStatus === "error" ? (
                  <>
                    <svg
                      className="w-3 h-3 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    Download Failed
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
