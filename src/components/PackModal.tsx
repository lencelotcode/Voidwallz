import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Monitor,
  Smartphone,
  X,
  Lock,
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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<"frame" | "canvas">("frame");

  useEffect(() => {
    setActiveIndex(0);
    setPreviewMode("frame");
  }, [selectedPack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && selectedPack) {
        setActiveIndex((prev) => (prev + 1) % selectedPack.items.length);
      }
      if (e.key === "ArrowLeft" && selectedPack) {
        setActiveIndex((prev) =>
          prev === 0 ? selectedPack.items.length - 1 : prev - 1,
        );
      }
    };

    if (selectedPack) {
      document.body.style.overflow = "hidden";
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
          <div className="w-full md:w-3/5 min-h-[260px] sm:min-h-[340px] md:min-h-[480px] relative flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group bg-[#040404]">
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
              {/* Left: Pack Badge */}
              <div className="flex items-center gap-1.5 p-1 px-2.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[9px] font-mono text-white/80 uppercase tracking-widest">
                  {selectedPack.serial}
                </span>
              </div>

              {/* Right: Part Indicator & Close Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="spec-badge text-[9px] font-mono px-2.5 py-1 rounded-full text-white/90 tracking-widest flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
                  <Layers size={10} />
                  0{activeIndex + 1} / 0{selectedPack.items.length}
                </span>

                <button
                  onClick={onClose}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 active:scale-95 transition-all shadow-xl cursor-pointer"
                  title="Close Modal"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Stage Center Display */}
            <div className="relative z-10 w-full h-full p-4 pt-12 pb-4 sm:p-6 sm:pt-14 sm:pb-6 flex items-center justify-center">
              {previewMode === "frame" || selectedPack.device === "mobile" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`frame-${currentWp.id}`}
                  className="flex items-center justify-center w-full"
                >
                  {selectedPack.device === "desktop" ? (
                    /* Studio Display Mockup - Spacious & Balanced */
                    <div className="relative flex flex-col items-center w-full max-w-[270px] sm:max-w-[380px] md:max-w-[440px]">
                      <div className="w-full aspect-[16/10] rounded-lg sm:rounded-xl border-[3px] sm:border-[3.5px] border-[#222] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/15">
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
                      <div className="w-12 sm:w-14 h-2.5 sm:h-3.5 bg-gradient-to-b from-[#222] to-[#141414] rounded-b-sm shadow-md ring-1 ring-white/10" />
                      <div className="w-20 sm:w-28 h-1 bg-[#282828] rounded-full shadow-lg ring-1 ring-white/10" />
                    </div>
                  ) : (
                    /* Titanium Pro iPhone Mockup - Clean Proportions */
                    <div className="relative w-[140px] sm:w-[175px] md:w-[200px] aspect-[9/19.5] rounded-[2.2rem] border-[3px] sm:border-[3.5px] border-[#222] bg-black shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/20 flex items-center justify-center overflow-hidden">
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-black rounded-full z-30 ring-1 ring-white/10 flex items-center justify-end px-1 pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#080808] ring-1 ring-blue-900/30" />
                      </div>

                      {/* Bottom Home Indicator */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/70 rounded-full z-20 pointer-events-none" />

                      {/* Wallpaper Image */}
                      <OptimizedImage
                        src={currentWp.previewUrl}
                        placeholder={currentWp.tinyUrl}
                        fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                        alt={currentWp.title}
                        priority={true}
                        className={`w-full h-full object-cover ${isOledOptimized ? "oled-image" : ""}`}
                        containerClassName="w-full h-full rounded-[1.9rem]"
                      />
                      {/* Glass Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20 rounded-[1.9rem]" />
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Clean Full Art Canvas Mode */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`canvas-${currentWp.id}`}
                  className="w-full h-full relative flex items-center justify-center p-2"
                >
                  <div className="relative w-full h-full max-h-[300px] sm:max-h-[420px] md:max-h-[480px] flex items-center justify-center">
                    <OptimizedImage
                      src={currentWp.previewUrl}
                      placeholder={currentWp.tinyUrl}
                      fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                      alt={currentWp.title}
                      priority={true}
                      className={`max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/15 ${isOledOptimized ? "oled-image" : ""}`}
                      containerClassName="flex items-center justify-center w-full h-full"
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
              className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev < selectedPack.items.length - 1 ? prev + 1 : 0,
                )
              }
              aria-label="Next Wallpaper"
              className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* RIGHT: Pack Details & Action Panel */}
          <div className="w-full md:w-2/5 p-4 sm:p-6 md:p-7 flex flex-col justify-between bg-[#0b0b0b] space-y-4">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                  {selectedPack.category} // {selectedPack.device === "desktop" ? "DESKTOP" : "PHONE"}
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  {selectedPack.format}
                </span>
              </div>

              {/* Bold Modern Sans Title */}
              <h2 className="text-xl sm:text-2xl font-sans font-bold uppercase tracking-tight text-white mb-1">
                {selectedPack.title}
              </h2>
              <p className="text-xs text-white/60 leading-relaxed font-sans line-clamp-2">
                {selectedPack.tagline}
              </p>

              {/* Capsule Thumbnails Deck */}
              <div className="mt-3.5 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] opacity-50 font-mono uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} />
                    Included Wallpapers
                  </span>
                  <span className="text-[10px] font-mono text-white/80 font-semibold truncate max-w-[140px]">
                    {currentWp.title}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {selectedPack.items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative rounded-md overflow-hidden border transition-all duration-200 group/thumb cursor-pointer ${
                        selectedPack.device === "mobile" ? "aspect-[9/16]" : "aspect-[16/10]"
                      } ${
                        activeIndex === idx
                          ? "border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] ring-1 ring-white/60 scale-105"
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
              </div>

              {/* Compact 2x2 Specifications Grid */}
              <div className="border-t border-white/10 pt-3 mb-2">
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Downloads</span>
                    <span className="text-white/90 font-bold block">{selectedPack.downloads.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Files</span>
                    <span className="text-white/90 font-bold block">{selectedPack.items.length} Master Assets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault Locked / Dropping Soon Notice */}
            <div>
              <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-amber-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Lock size={12} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-amber-300 font-mono text-[10px] uppercase font-bold tracking-wider block">
                      VAULT LOCKED // DROPPING SOON
                    </span>
                    <span className="text-[9px] text-white/40 font-sans block">
                      Quality assurance staging in progress
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 rounded text-[8px] font-mono text-amber-300 uppercase tracking-wider shrink-0 border border-amber-500/20">
                  Dropping Soon
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
