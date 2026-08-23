import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FolderArchive,
  Layers,
  Sparkles,
  Check,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { VoidPack } from "../types";

export default function PackModal({
  selectedPack,
  onClose,
  isOledOptimized = false,
}: {
  selectedPack: VoidPack | null;
  onClose: () => void;
  isOledOptimized?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<"frame" | "canvas">("frame");
  const [packDownloadStatus, setPackDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [singleDownloadStatus, setSingleDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && selectedPack) {
        setActiveIndex((prev) => (prev < selectedPack.items.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowLeft" && selectedPack) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : selectedPack.items.length - 1));
      }
    };

    if (selectedPack) {
      document.body.style.overflow = "hidden";
      setActiveIndex(0);
      setPackDownloadStatus("idle");
      setSingleDownloadStatus("idle");
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPack, onClose]);

  if (!selectedPack || typeof document === "undefined") return null;

  const currentWp = selectedPack.items[activeIndex] || selectedPack.items[0];

  const handleDownloadSingle = async () => {
    if (singleDownloadStatus === "downloading" || !currentWp) return;
    setSingleDownloadStatus("downloading");

    const url = currentWp.originalUrl || currentWp.previewUrl;
    const filename = `${selectedPack.title.replace(/\s+/g, "_")}_Part${activeIndex + 1}_${currentWp.title.replace(/\s+/g, "_")}.png`;

    try {
      const res = await fetch(url, { mode: "cors" });
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
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setSingleDownloadStatus("success");
      setTimeout(() => setSingleDownloadStatus("idle"), 3000);
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSingleDownloadStatus("success");
      setTimeout(() => setSingleDownloadStatus("idle"), 3000);
    }
  };

  const handleDownloadAll = async () => {
    if (packDownloadStatus === "downloading") return;
    setPackDownloadStatus("downloading");

    try {
      for (let i = 0; i < selectedPack.items.length; i++) {
        const item = selectedPack.items[i];
        const url = item.originalUrl || item.previewUrl;
        const filename = `${selectedPack.title.replace(/\s+/g, "_")}_Asset_0${i + 1}_${item.title.replace(/\s+/g, "_")}.png`;

        try {
          const res = await fetch(url, { mode: "cors" });
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
          } else {
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch {
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      setPackDownloadStatus("success");
      setTimeout(() => setPackDownloadStatus("idle"), 4000);
    } catch {
      setPackDownloadStatus("error");
      setTimeout(() => setPackDownloadStatus("idle"), 3000);
    }
  };

  return createPortal(
    <AnimatePresence>
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
            {/* Ambient Background Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              key={`glow-${currentWp.id}`}
              className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentWp.tinyUrl || currentWp.previewUrl})` }}
            />

            {/* TOP BAR: Clean Integrated View Switcher & Close Controls */}
            <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
              {/* Left: View Mode Pills */}
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

              {/* Right: Part Indicator & Close Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="spec-badge text-[9px] font-mono px-3 py-1.5 rounded-full text-white/90 tracking-widest flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
                  <Layers size={10} />
                  PART {activeIndex + 1} OF {selectedPack.items.length}
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
              {previewMode === "frame" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`frame-${currentWp.id}`}
                  className="flex items-center justify-center w-full"
                >
                  {selectedPack.device === "desktop" ? (
                    /* Studio Display Mockup (Clean Scaled Aspect Ratio) */
                    <div className="relative flex flex-col items-center w-full max-w-[460px] sm:max-w-[500px]">
                      <div className="w-full aspect-[16/10] rounded-xl border-[3.5px] border-[#222] bg-black shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/15">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full ring-1 ring-white/10 z-30 pointer-events-none" />
                        <OptimizedImage
                          src={currentWp.previewUrl}
                          placeholder={currentWp.tinyUrl}
                          fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                          alt={currentWp.title}
                          priority={true}
                          className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                          containerClassName="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
                      </div>
                      {/* Slim Pedestal */}
                      <div className="w-14 h-4 bg-gradient-to-b from-[#222] to-[#141414] rounded-b-sm shadow-md ring-1 ring-white/10" />
                      <div className="w-28 h-1 bg-[#282828] rounded-full shadow-lg ring-1 ring-white/10" />
                    </div>
                  ) : (
                    /* Titanium Pro iPhone Mockup (Ultra-Thin Bezel + iOS Lockscreen Clock) */
                    <div className="relative w-[170px] sm:w-[200px] md:w-[220px] aspect-[9/19.5] rounded-[2.5rem] border-[3.5px] border-[#222] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/20 flex items-center justify-center overflow-hidden">
                      {/* Dynamic Island */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-30 ring-1 ring-white/10 flex items-center justify-end px-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#080808] ring-1 ring-blue-900/30" />
                      </div>

                      {/* iOS Lockscreen Clock & Date */}
                      <div className="absolute top-8 inset-x-0 flex flex-col items-center pointer-events-none z-20 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] select-none">
                        <span className="text-[8px] font-sans font-medium tracking-wider text-white/80 uppercase">
                          Sunday, August 23
                        </span>
                        <span className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white mt-0.5">
                          12:45
                        </span>
                      </div>

                      {/* Bottom Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/70 rounded-full z-20 pointer-events-none" />

                      {/* Wallpaper Image */}
                      <OptimizedImage
                        src={currentWp.previewUrl}
                        placeholder={currentWp.tinyUrl}
                        fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                        alt={currentWp.title}
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
                /* Clean Full Art Mode */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`canvas-${currentWp.id}`}
                  className="w-full h-full max-h-[60vh] relative flex items-center justify-center"
                >
                  <div className="relative w-full h-full max-w-[90%] max-h-[90%] rounded-xl overflow-hidden flex items-center justify-center">
                    <OptimizedImage
                      src={currentWp.previewUrl}
                      placeholder={currentWp.tinyUrl}
                      fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                      alt={currentWp.title}
                      priority={true}
                      className={`w-full h-full object-contain ${isOledOptimized ? "oled-image" : ""}`}
                      containerClassName="w-full h-full"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Left & Right Pagination Arrows */}
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : selectedPack.items.length - 1,
                )
              }
              aria-label="Previous Wallpaper"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>

            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev < selectedPack.items.length - 1 ? prev + 1 : 0,
                )
              }
              aria-label="Next Wallpaper"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>

          {/* RIGHT: Pack Details & Action Panel */}
          <div className="w-full md:w-2/5 p-5 sm:p-6 md:p-8 flex flex-col justify-between bg-[#0b0b0b]">
            <div>
              {/* Header Badges */}
              <div className="flex items-center gap-2 mb-2">
                <span className="spec-badge text-[9px] font-mono px-2.5 py-0.5 rounded text-white/70 uppercase">
                  {selectedPack.serial}
                </span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1">
                  {selectedPack.device === "desktop" ? (
                    <>
                      <Monitor size={10} /> DESKTOP SUITE
                    </>
                  ) : (
                    <>
                      <Smartphone size={10} /> PHONE DECK
                    </>
                  )}
                </span>
              </div>

              {/* Bold Modern Sans Title */}
              <h2 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-tight text-white mb-1.5">
                {selectedPack.title}
              </h2>
              <p className="text-xs text-white/60 leading-relaxed font-sans line-clamp-2">
                {selectedPack.tagline}
              </p>

              {/* Capsule Thumbnails Deck */}
              <div className="mt-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] opacity-50 font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={11} />
                    Included Assets ({selectedPack.items.length})
                  </span>
                  <span className="text-[10px] font-mono text-white/60">
                    0{activeIndex + 1} / 0{selectedPack.items.length}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {selectedPack.items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative rounded-lg overflow-hidden border transition-all duration-200 group/thumb ${
                        selectedPack.device === "mobile" ? "aspect-[9/16]" : "aspect-[16/10]"
                      } ${
                        activeIndex === idx
                          ? "border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] ring-1 ring-white/50 scale-105"
                          : "border-white/10 opacity-50 hover:opacity-90 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={item.tinyUrl || item.previewUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono text-white/90 bg-black/80 px-1 rounded">
                        0{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Current Item Name Pill */}
                <div className="text-[11px] font-mono text-white/80 mt-2 py-1.5 px-2 bg-white/5 rounded border border-white/5 flex justify-between items-center">
                  <span className="truncate max-w-[200px]">
                    Viewing: <strong className="text-white">{currentWp.title}</strong>
                  </span>
                  <span className="text-white/40 text-[10px]">{currentWp.format}</span>
                </div>
              </div>

              {/* Compact Specifications Grid */}
              <div className="border-t border-white/10 pt-4 mb-4">
                <span className="text-[9px] opacity-40 font-mono uppercase tracking-[0.2em] block mb-2.5">
                  Specifications
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Category</span>
                    <span className="text-white/90 truncate block">{selectedPack.category}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Format</span>
                    <span className="text-white/90 truncate block">{selectedPack.format}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Downloads</span>
                    <span className="text-white/90 truncate block">{selectedPack.downloads.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Assets</span>
                    <span className="text-white/90 truncate block">{selectedPack.items.length} Master Files</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Download Buttons */}
            <div className="space-y-2 pt-2">
              {/* Download Current Part */}
              <button
                onClick={handleDownloadSingle}
                disabled={singleDownloadStatus === "downloading"}
                className={`w-full py-2.5 px-4 font-mono text-[10px] uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  singleDownloadStatus === "success"
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "border-white/20 hover:border-white/50 text-white/90 hover:text-white bg-white/5 hover:bg-white/10"
                }`}
              >
                {singleDownloadStatus === "downloading" ? (
                  "Saving Part..."
                ) : singleDownloadStatus === "success" ? (
                  <>
                    <Check size={13} /> Part Saved!
                  </>
                ) : (
                  <>
                    <Download size={13} /> Download Current Part ({activeIndex + 1})
                  </>
                )}
              </button>

              {/* Master Pack Download All */}
              <button
                onClick={handleDownloadAll}
                disabled={packDownloadStatus === "downloading"}
                className={`w-full py-3 px-4 font-sans font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                  packDownloadStatus === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : packDownloadStatus === "error"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                }`}
              >
                {packDownloadStatus === "downloading" ? (
                  "Saving All Files..."
                ) : packDownloadStatus === "success" ? (
                  <>
                    <Check size={15} /> All {selectedPack.items.length} Files Saved!
                  </>
                ) : (
                  <>
                    <FolderArchive size={14} /> Download Entire Pack ({selectedPack.items.length} Files)
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
