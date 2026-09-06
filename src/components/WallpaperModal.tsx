import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Share2,
  Link2,
  ArrowUpRight,
  ZoomIn,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import Magnetic from "./Magnetic";
import { triggerRadarPulse } from "../lib/radarPulse";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useWallpaperStats } from "../hooks/useWallpaperStats";
import { sound } from "../lib/soundEffects";
import { downloadWallpaperAsPng } from "../lib/downloadWallpaper";

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
  const [previewMode, setPreviewMode] = useState<"frame" | "canvas" | "loupe">("frame");
  const [loupePos, setLoupePos] = useState({ x: 50, y: 50 });
  const [isHoveringLoupe, setIsHoveringLoupe] = useState(false);
  const loupeContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const { toggleFavorite, isFavorite, recordDownload, getDownloads, getLikes } =
    useWallpaperStats();

  const handleClose = () => {
    sound.playClose();
    onClose();
  };

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
    sound.playTap();
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
    sound.playTap();
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
    setDownloadStatus("idle");
    setPreviewMode("frame");
    setCopied(false);
  }, [selectedWp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    if (selectedWp) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWp, onClose, currentIndex, allRelevantWallpapers]);

  if (!selectedWp || typeof document === "undefined") return null;

  const handleShare = async () => {
    sound.playTap();
    const slug = selectedWp.title.toLowerCase().replace(/\s+/g, "-");
    const directUrl = `${window.location.origin}/${selectedWp.device}/${slug}/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedWp.title} // Voidwallz`,
          text: `Explore "${selectedWp.title}" on Voidwallz — Curated ${selectedWp.format || "8K"} Minimal Wallpaper`,
          url: directUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const textarea = document.createElement("textarea");
      textarea.value = directUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const updateLoupePosition = (clientX: number, clientY: number) => {
    if (!loupeContainerRef.current) return;
    const rect = loupeContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setLoupePos({ x, y });
  };

  const handleLoupeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHoveringLoupe(true);
    updateLoupePosition(e.clientX, e.clientY);
  };

  const handleLoupeTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsHoveringLoupe(true);
      updateLoupePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (downloadStatus === "downloading") return;
    sound.playShutter();
    if (e) {
      triggerRadarPulse(e.clientX, e.clientY, "emerald");
    }
    setDownloadStatus("downloading");
    const downloadUrl = selectedWp.originalUrl || selectedWp.previewUrl;

    if (!downloadUrl) {
      setDownloadStatus("error");
      return;
    }

    try {
      const ok = await downloadWallpaperAsPng(
        downloadUrl,
        selectedWp.title,
        selectedWp.previewUrl
      );
      recordDownload(selectedWp.id);
      sound.playSuccess();
      setDownloadStatus(ok ? "success" : "idle");
      setTimeout(() => setDownloadStatus("idle"), 3000);
    } catch (err) {
      console.error("Direct download failed:", err);
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
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
          onClick={handleClose}
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
          {/* Universal Top-Right Close Button */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <Magnetic strength={0.25}>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all shadow-xl cursor-pointer"
                title="Close Modal"
              >
                <X size={15} />
              </button>
            </Magnetic>
          </div>

          {/* LEFT: Visual Stage Section */}
          <div className="w-full md:w-3/5 min-h-[300px] sm:min-h-[380px] md:min-h-[520px] relative flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group bg-[#040404]">
            {/* Ambient Background Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              key={`glow-${selectedWp.id}`}
              className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${selectedWp.tinyUrl || selectedWp.previewUrl})` }}
            />

            {/* TOP BAR: View Switcher + Spec Badge */}
            <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
              {/* Left: View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-xl">
                <button
                  onClick={() => {
                    sound.playSwitch();
                    setPreviewMode("frame");
                  }}
                  className={`h-6 px-3 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center leading-none ${
                    previewMode === "frame"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Display
                </button>
                {selectedWp.device === "desktop" && (
                  <button
                    onClick={() => {
                      sound.playSwitch();
                      setPreviewMode("canvas");
                    }}
                    className={`h-6 px-3 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center leading-none ${
                      previewMode === "canvas"
                        ? "bg-white text-black font-bold shadow-md"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Full Art
                  </button>
                )}
                <button
                  onClick={() => {
                    sound.playSwitch();
                    setPreviewMode("loupe");
                  }}
                  className={`h-6 px-3 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
                    previewMode === "loupe"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <ZoomIn size={10} className="flex-shrink-0" />
                  <span>8K Loupe</span>
                </button>
              </div>

              {/* Right: Spec Badge */}
              <div className="flex items-center pointer-events-auto pr-1">
                <span className="spec-badge h-6 px-3 text-[9px] font-mono rounded-full text-white/90 tracking-widest bg-black/80 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-1.5 leading-none">
                  {selectedWp.device === "desktop" ? <Monitor size={10} /> : <Smartphone size={10} />}
                  <span>{selectedWp.format || (selectedWp.device === "mobile" ? "4K MOBILE" : "8K MASTER")}</span>
                </span>
              </div>
            </div>

            {/* Stage Center Display */}
            <div className="relative z-10 w-full h-full p-4 pt-16 pb-6 sm:p-8 sm:pt-20 sm:pb-8 flex items-center justify-center">
              {previewMode === "frame" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`frame-${selectedWp.id}`}
                  className="flex items-center justify-center w-full"
                >
                  {selectedWp.device === "desktop" ? (
                    /* Apple Studio Display Pro Mockup */
                    <motion.div
                      layoutId={`wp-display-frame-${selectedWp.id}`}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      className="relative flex flex-col items-center w-full max-w-[370px] sm:max-w-[420px] md:max-w-[435px]"
                    >
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
                    </motion.div>
                  ) : (
                    /* Titanium Pro iPhone Mockup */
                    <motion.div
                      layoutId={`wp-display-frame-${selectedWp.id}`}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      className="relative w-[160px] sm:w-[190px] md:w-[210px] aspect-[9/19.5] rounded-[2.5rem] border-[3.5px] border-[#222] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/20 flex items-center justify-center overflow-hidden"
                    >
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
                    </motion.div>
                  )}
                </motion.div>
              ) : previewMode === "canvas" ? (
                /* Clean Full Art Canvas Mode */
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
              ) : (
                /* Interactive 8K Precision Art Loupe Mode */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`loupe-${selectedWp.id}`}
                  className="w-full h-full relative flex flex-col items-center justify-center p-3 sm:p-6 select-none"
                >
                  <div
                    ref={loupeContainerRef}
                    onMouseMove={handleLoupeMouseMove}
                    onTouchMove={handleLoupeTouchMove}
                    onMouseEnter={() => setIsHoveringLoupe(true)}
                    onMouseLeave={() => setIsHoveringLoupe(false)}
                    className={`relative w-full ${
                      selectedWp.device === "mobile"
                        ? "max-w-[210px] sm:max-w-[240px] aspect-[9/19.5] rounded-[2.5rem]"
                        : "max-w-[380px] sm:max-w-[440px] md:max-w-[470px] aspect-[16/10] rounded-xl"
                    } overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] ring-1 ring-white/20 bg-black cursor-crosshair group touch-none`}
                  >
                    {/* Dimmed Base Canvas */}
                    <OptimizedImage
                      src={selectedWp.previewUrl}
                      placeholder={selectedWp.tinyUrl}
                      fallbackSrc={selectedWp.fallbackUrl || selectedWp.previewUrl}
                      alt={selectedWp.title}
                      priority={true}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isHoveringLoupe ? "opacity-35" : "opacity-85"
                      } ${isOledOptimized ? "oled-image" : ""}`}
                      containerClassName="w-full h-full"
                    />

                    {/* Floating Magnifier Loupe Lens */}
                    <motion.div
                      animate={{
                        left: `${loupePos.x}%`,
                        top: `${loupePos.y}%`,
                        opacity: isHoveringLoupe ? 1 : 0.85,
                        scale: isHoveringLoupe ? 1 : 0.95,
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute w-40 h-40 sm:w-48 sm:h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)] ring-4 ring-white/15 overflow-hidden pointer-events-none z-30 bg-black"
                    >
                      {/* Magnified Optical Canvas View */}
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${selectedWp.originalUrl || selectedWp.previewUrl})`,
                          backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                          backgroundSize: "280%",
                          backgroundRepeat: "no-repeat",
                        }}
                      />

                      {/* Optical Glass Flare */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-transparent pointer-events-none" />

                      {/* Reticle Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 relative">
                          <div className="absolute top-1/2 left-0 w-2 h-px bg-white/80 -translate-y-1/2" />
                          <div className="absolute top-1/2 right-0 w-2 h-px bg-white/80 -translate-y-1/2" />
                          <div className="absolute top-0 left-1/2 h-2 w-px bg-white/80 -translate-x-1/2" />
                          <div className="absolute bottom-0 left-1/2 h-2 w-px bg-white/80 -translate-x-1/2" />
                          <div className="absolute inset-1 rounded-full border border-white/40" />
                        </div>
                      </div>

                      {/* HUD Label Tag */}
                      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full bg-black/90 backdrop-blur-md border border-white/25 text-[7px] font-mono tracking-widest text-white/90 shadow-lg uppercase">
                          8K MASTER // 2.8X
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Stage Footer Status Pill */}
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-mono tracking-widest text-white/50 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Inspection Mode // {Math.round(loupePos.x)}% X : {Math.round(loupePos.y)}% Y</span>
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
          </div>          {/* RIGHT: Wallpaper Details & Action Panel */}
          <div className="w-full md:w-2/5 p-5 sm:p-6 md:p-8 flex flex-col justify-between bg-[#0b0b0b] relative">
            <div>
              {/* Header Info */}
              <div className="mb-5 pr-10">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1">
                  {selectedWp.serial || `V-${selectedWp.id}`} // {selectedWp.device === "desktop" ? "DESKTOP MASTER" : "PHONE MASTER"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-tight text-white mb-3">
                  {selectedWp.title}
                </h2>

                <div className="flex items-center gap-2">
                  {/* Share Artwork Button */}
                  <Magnetic strength={0.25}>
                    <button
                      onClick={(e) => {
                        triggerRadarPulse(e.clientX, e.clientY, "cyan");
                        handleShare();
                      }}
                      className="h-8 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-mono"
                      title="Share Artwork"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400 font-semibold text-[10px] uppercase">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={12} />
                          <span className="text-[10px] uppercase font-semibold">SHARE</span>
                        </>
                      )}
                    </button>
                  </Magnetic>

                  {/* Favorite / Like Button with Live Counter */}
                  <Magnetic strength={0.25}>
                    <button
                      onClick={(e) => {
                        sound.playLike();
                        triggerRadarPulse(e.clientX, e.clientY, "crimson");
                        toggleFavorite(selectedWp.id);
                      }}
                      className={`h-8 px-3.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono active:scale-95 ${
                        isFavorite(selectedWp.id)
                          ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/30"
                      }`}
                      title="Like Wallpaper"
                    >
                      <Heart
                        size={12}
                        fill={isFavorite(selectedWp.id) ? "currentColor" : "none"}
                      />
                      <span className="text-[10px] font-semibold">
                        {getLikes(selectedWp.id).toLocaleString()}
                      </span>
                    </button>
                  </Magnetic>
                </div>
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

            {/* Bottom Actions & Download Button */}
            <div className="pt-3 space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-3.5 px-4 font-sans font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex justify-center items-center gap-2 shadow-xl cursor-pointer ${
                  downloadStatus === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : downloadStatus === "error"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-white text-black hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
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
              </motion.button>

              {/* Quick Share Links Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-white/50">
                <button
                  onClick={handleShare}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Direct Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={11} />
                      <span>Copy Direct Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out "${selectedWp.title}" on @voidwallz — Curated Minimal Wallpaper:`
                  )}&url=${encodeURIComponent(`${window.location.origin}/${selectedWp.device}/${selectedWp.title.toLowerCase().replace(/\s+/g, "-")}/`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Share on X</span>
                  <ArrowUpRight size={10} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
