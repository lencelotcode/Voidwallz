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
  Download,
  FolderDown,
  CheckCircle2,
  Loader2,
  Share2,
  Link2,
  ArrowUpRight,
  Check,
} from "lucide-react";
import JSZip from "jszip";
import OptimizedImage from "./OptimizedImage";
import { VoidPack, Wallpaper } from "../types";
import { useWallpaperStats } from "../hooks/useWallpaperStats";
import { sound } from "../lib/soundEffects";
import { downloadWallpaperAsPng, fetchImageAsPngArrayBuffer } from "../lib/downloadWallpaper";

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
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { recordDownload, getDownloads } = useWallpaperStats();

  const handleClose = () => {
    sound.playClose();
    onClose();
  };

  useEffect(() => {
    setActiveIndex(0);
    setPreviewMode("frame");
    setIsDownloadingZip(false);
    setIsDownloadingSingle(false);
    setDownloadSuccess(null);
    setCopied(false);
  }, [selectedPack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && selectedPack && selectedPack.items.length > 0) {
        sound.playTap();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : selectedPack.items.length - 1));
      } else if (e.key === "ArrowRight" && selectedPack && selectedPack.items.length > 0) {
        sound.playTap();
        setActiveIndex((prev) => (prev < selectedPack.items.length - 1 ? prev + 1 : 0));
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        sound.playSwitch();
        setPreviewMode((prev) => (prev === "frame" ? "canvas" : "frame"));
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

  if (!selectedPack || selectedPack.items.length === 0) return null;

  const currentWp = selectedPack.items[activeIndex] || selectedPack.items[0];

  // Share Pack Link
  const handleSharePack = async () => {
    sound.playTap();
    const packUrl = `${window.location.origin}/packs#${selectedPack.id}`;
    const shareTitle = `VOIDWALLZ // ${selectedPack.title} Pack`;
    const shareText = `Check out the ${selectedPack.title} 5-piece wallpaper suite on Voidwallz: ${selectedPack.tagline}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: packUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Native share failed, falling back to copy:", err);
        }
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(packUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download entire pack as .ZIP with genuine lossless PNG files
  const handleDownloadZip = async () => {
    if (isDownloadingZip || isDownloadingSingle || !selectedPack || selectedPack.items.length === 0) return;
    sound.playShutter();
    setIsDownloadingZip(true);
    setZipProgress({ current: 0, total: selectedPack.items.length, percent: 0 });

    try {
      const zip = new JSZip();
      const folderName = `VOIDWALLZ-${selectedPack.title.toUpperCase().replace(/\s+/g, "-")}-${selectedPack.device.toUpperCase()}`;
      const packFolder = zip.folder(folderName) || zip;

      // Add Readme / metadata
      packFolder.file(
        "README.txt",
        `VOIDWALLZ // MASTER WALLPAPER SUITE\n\nPack: ${selectedPack.title}\nSerial: ${selectedPack.serial}\nFormat: PNG Lossless Master\nDevice: ${selectedPack.device.toUpperCase()}\nTotal Wallpapers: ${selectedPack.items.length}\n\nDownloaded from Voidwallz (https://voidwallz.live)\nExclusively curated for high-resolution digital workspace elevation.\n`
      );

      for (let i = 0; i < selectedPack.items.length; i++) {
        const item = selectedPack.items[i];
        const downloadUrl = item.originalUrl || item.previewUrl;

        setZipProgress({
          current: i + 1,
          total: selectedPack.items.length,
          percent: Math.round(((i + 1) / selectedPack.items.length) * 85),
        });

        try {
          const arrayBuffer = await fetchImageAsPngArrayBuffer(downloadUrl);
          const cleanTitle = item.title.replace(/[/\\?%*:|"<>]/g, "-");
          const filename = `${String(i + 1).padStart(2, "0")} - ${cleanTitle}.png`;
          packFolder.file(filename, arrayBuffer);
          recordDownload(item.id);
        } catch (fetchErr) {
          console.warn(`Failed to fetch pack item ${item.title}:`, fetchErr);
        }
      }

      setZipProgress((prev) => ({ ...prev, percent: 95 }));
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      recordDownload(selectedPack.id);
      sound.playSuccess();
      setDownloadSuccess("Complete Suite Downloaded!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error("Pack zip generation failed:", err);
      alert("Could not generate ZIP archive. Downloading individual wallpapers instead...");
      for (const item of selectedPack.items) {
        downloadWallpaperAsPng(item.originalUrl || item.previewUrl, item.title);
      }
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Download single active wallpaper from pack as PNG
  const handleDownloadSingle = async () => {
    if (isDownloadingSingle || isDownloadingZip || !currentWp) return;
    sound.playShutter();
    setIsDownloadingSingle(true);

    const downloadUrl = currentWp.originalUrl || currentWp.previewUrl;
    try {
      await downloadWallpaperAsPng(downloadUrl, currentWp.title);
      recordDownload(currentWp.id);
      sound.playSuccess();
      setDownloadSuccess(`Part 0${activeIndex + 1} Downloaded!`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error("Single download failed:", err);
    } finally {
      setIsDownloadingSingle(false);
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                  onClick={handleClose}
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
                /* Clean Full Art Canvas Mode - True Widescreen 16:10 */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={`canvas-${currentWp.id}`}
                  className="w-full h-full relative flex items-center justify-center p-3 sm:p-6"
                >
                  <div className="relative w-full max-w-[370px] sm:max-w-[430px] md:max-w-[460px] aspect-[16/10] rounded-xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] ring-1 ring-white/20 bg-black flex items-center justify-center">
                    <OptimizedImage
                      src={currentWp.previewUrl}
                      placeholder={currentWp.tinyUrl}
                      fallbackSrc={currentWp.fallbackUrl || currentWp.previewUrl}
                      alt={currentWp.title}
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
              onClick={() => {
                sound.playTap();
                setActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : selectedPack.items.length - 1,
                );
              }}
              aria-label="Previous Wallpaper"
              className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveIndex((prev) =>
                  prev < selectedPack.items.length - 1 ? prev + 1 : 0,
                );
              }}
              aria-label="Next Wallpaper"
              className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 z-30 cursor-pointer"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* RIGHT: Pack Details & Action Panel */}
          <div className="w-full md:w-2/5 p-4 sm:p-6 md:p-7 flex flex-col justify-between bg-[#0b0b0b] space-y-4">
            <div>
              {/* Header Badges & Share */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                  {selectedPack.category} // {selectedPack.device === "desktop" ? "DESKTOP" : "PHONE"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-white/50">
                    {selectedPack.format}
                  </span>

                  {/* Share Pack Button */}
                  <button
                    onClick={handleSharePack}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white transition-all cursor-pointer text-[9px] font-mono tracking-wider active:scale-95 shadow-sm"
                    title="Share Pack"
                  >
                    <Share2 size={11} />
                    <span>{copied ? "COPIED" : "SHARE"}</span>
                  </button>
                </div>
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
                    Included Wallpapers ({selectedPack.items.length})
                  </span>
                  <span className="text-[10px] font-mono text-white/80 font-semibold truncate max-w-[140px]">
                    {currentWp.title}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {selectedPack.items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playTap();
                        setActiveIndex(idx);
                      }}
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
                    <span className="text-white/90 font-bold block">
                      {((getDownloads(selectedPack.id) || 0) + selectedPack.items.reduce((sum, item) => sum + (getDownloads(item.id) || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase block">Files</span>
                    <span className="text-white/90 font-bold block">{selectedPack.items.length} Master Assets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action & Download Section */}
            <div className="space-y-2 pt-2">
              {/* Success Notification Pill */}
              <AnimatePresence>
                {downloadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono"
                  >
                    <CheckCircle2 size={13} />
                    <span>{downloadSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Action: Download Complete Pack .ZIP */}
              <button
                onClick={handleDownloadZip}
                disabled={isDownloadingZip || isDownloadingSingle}
                className="w-full py-3.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer disabled:opacity-50"
              >
                {isDownloadingZip ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin text-black" />
                    <span>
                      Packaging ZIP {zipProgress.current}/{zipProgress.total} ({zipProgress.percent}%)...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FolderDown size={15} />
                    <span>Download Complete Pack (.ZIP)</span>
                  </div>
                )}
              </button>

              {/* Secondary Action: Download Active Single Artwork */}
              <button
                onClick={handleDownloadSingle}
                disabled={isDownloadingZip || isDownloadingSingle}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-[11px] uppercase tracking-wider rounded-xl border border-white/10 hover:border-white/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDownloadingSingle ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-white" />
                    <span>Downloading Part 0{activeIndex + 1}...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download size={13} />
                    <span>Download Part 0{activeIndex + 1} Only (1 of {selectedPack.items.length})</span>
                  </div>
                )}
              </button>

              {/* Quick Share Links Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-white/50">
                <button
                  onClick={handleSharePack}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Pack Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={11} />
                      <span>Copy Pack Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out "${selectedPack.title}" on @voidwallz — ${selectedPack.items.length}-Piece Master Wallpaper Suite:`
                  )}&url=${encodeURIComponent(`${window.location.origin}/packs`)}`}
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
