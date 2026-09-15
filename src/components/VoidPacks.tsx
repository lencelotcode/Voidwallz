import React, { useState } from "react";
import { FolderArchive, Sparkles, ArrowUpRight, Monitor, Smartphone, Lock, Clock } from "lucide-react";
import { motion } from "motion/react";
import { VoidPack } from "../types";
import { useVoidPacks } from "../hooks/useVoidPacks";
import { sound } from "../lib/soundEffects";

export default function VoidPacks({
  onOpenPack,
  onHoverWallpaper,
  isDedicatedPage = false,
}: {
  onOpenPack: (pack: VoidPack) => void;
  onHoverWallpaper?: (url: string | null) => void;
  isDedicatedPage?: boolean;
}) {
  const { allPacks, desktopPacks, mobilePacks, loading } = useVoidPacks();
  const [filter, setFilter] = useState<"all" | "desktop" | "mobile">("all");

  const displayedPacks =
    filter === "all"
      ? allPacks
      : filter === "desktop"
        ? desktopPacks
        : mobilePacks;

  return (
    <section
      id="packs"
      className={`${isDedicatedPage ? "pt-24 sm:pt-28 pb-24 sm:pb-32 min-h-screen bg-void-black" : "py-16 sm:py-20 md:py-28 border-t border-white/5 bg-void-deep"} px-4 sm:px-6 md:px-10 relative`}
    >
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[300px] bg-white/[0.02] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[40vw] h-[300px] bg-white/[0.02] blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-5 sm:gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="spec-badge text-[9px] sm:text-[10px] font-mono px-2.5 sm:px-3 py-1 rounded-full text-emerald-300/90 bg-emerald-500/10 border-emerald-500/30 tracking-widest uppercase flex items-center gap-1.5 shadow-lg">
                <Sparkles size={11} className="text-emerald-400" />
                MASTER SUITES UNLOCKED
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest">
                // 5-PIECE PACKAGES
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold uppercase tracking-tight text-white">
              VOID PACKS_
            </h2>
            <p className="text-xs md:text-sm text-white/50 max-w-lg mt-2 sm:mt-3 font-sans leading-relaxed">
              Thematic 5-piece wallpaper suites engineered to elevate your entire digital workspace. Download complete .ZIP packages or individual master files.
            </p>
          </div>

          {/* Filter Pills with Fluid Segmented Spring Indicator */}
          <div className="w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 whitespace-nowrap w-fit">
              <button
                onClick={() => {
                  sound.playTap();
                  setFilter("all");
                }}
                className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest rounded-full transition-colors duration-200 cursor-pointer ${
                  filter === "all"
                    ? "text-black font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {filter === "all" && (
                  <motion.div
                    layoutId="activePackPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-full shadow-lg z-0"
                  />
                )}
                <span className="relative z-10">All ({allPacks.length})</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setFilter("desktop");
                }}
                className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest rounded-full transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                  filter === "desktop"
                    ? "text-black font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {filter === "desktop" && (
                  <motion.div
                    layoutId="activePackPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-full shadow-lg z-0"
                  />
                )}
                <Monitor size={12} className="relative z-10" />
                <span className="relative z-10">Desktop ({desktopPacks.length})</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setFilter("mobile");
                }}
                className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest rounded-full transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                  filter === "mobile"
                    ? "text-black font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {filter === "mobile" && (
                  <motion.div
                    layoutId="activePackPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-full shadow-lg z-0"
                  />
                )}
                <Smartphone size={12} className="relative z-10" />
                <span className="relative z-10">Phone ({mobilePacks.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && displayedPacks.length === 0 ? (
            /* Skeleton Loading Grid */
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="h-96 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse flex flex-col justify-between p-6"
              >
                <div className="w-full h-48 bg-white/5 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-white/10 rounded" />
                  <div className="w-48 h-6 bg-white/10 rounded" />
                </div>
              </div>
            ))
          ) : (
            <>
              {displayedPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  onOpenPack={(p) => {
                    sound.playOpenModal();
                    onOpenPack(p);
                  }}
                  onHoverWallpaper={onHoverWallpaper}
                />
              ))}

              {/* Coming Soon Capsule Card */}
              <ComingSoonCard />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

interface PackCardProps {
  pack: VoidPack;
  onOpenPack: (pack: VoidPack) => void;
  onHoverWallpaper?: (url: string | null) => void;
}

const PackCard: React.FC<PackCardProps> = ({
  pack,
  onOpenPack,
  onHoverWallpaper,
}) => {
  const [mobileSliceIdx, setMobileSliceIdx] = useState(0);
  const activeMobileItem = pack.items[mobileSliceIdx] || pack.items[0];

  return (
    <div
      onClick={() => onOpenPack(pack)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPack(pack);
        }
      }}
      onMouseEnter={() => onHoverWallpaper?.(pack.featuredImage)}
      onMouseLeave={() => onHoverWallpaper?.(null)}
      data-cursor="EXP-PACK"
      role="button"
      tabIndex={0}
      aria-label={`Explore ${pack.title} pack`}
      className="group cursor-pointer flex flex-col bg-void-gray/30 border border-white/10 hover:border-white/30 rounded-xl overflow-hidden transition-all duration-300 luxury-border-glow shadow-2xl glass-sheen"
    >
      {/* DESKTOP ACCORDION VIEW: Active on md:flex, hidden on mobile */}
      <div className="hidden md:flex relative w-full h-64 overflow-hidden border-b border-white/10 bg-black group/deck">
        {pack.items.map((item, sliceIdx) => (
          <div
            key={item.id}
            className="relative h-full overflow-hidden border-r last:border-r-0 border-white/20 transition-[flex] duration-300 ease-out flex-1 [@media(hover:hover)]:group-hover/deck:flex-[0.1] [@media(hover:hover)]:group-hover/deck:hover:!flex-[10] group/slice"
          >
            <img
              src={item.previewUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover/slice:opacity-0 transition-opacity duration-200 pointer-events-none" />

            {/* Dynamic Part Title Pill */}
            <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover/slice:opacity-100 transition-opacity duration-200 flex items-center gap-2 whitespace-nowrap pointer-events-none">
              <span className="text-[10px] font-mono text-white bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${pack.device === "desktop" ? "bg-emerald-400" : "bg-blue-400"}`} />
                {pack.device === "desktop" ? "PART" : "DECK"} 0{sliceIdx + 1}: {item.title}
              </span>
            </div>

            {/* Number indicator */}
            <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white/70 bg-black/75 px-1.5 py-0.5 rounded border border-white/10 opacity-80 group-hover/slice:opacity-0 transition-opacity duration-150">
              0{sliceIdx + 1}
            </span>
          </div>
        ))}

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 pointer-events-none">
          <span className="spec-badge text-[9px] font-mono px-2.5 py-1 rounded-full text-white/90 tracking-widest uppercase bg-black/70 backdrop-blur-md border border-white/15">
            {pack.items.length} PIECE PACK
          </span>
        </div>

        <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none">
          <span className="spec-badge text-[9px] font-mono px-2.5 py-1 rounded-full text-white/80 tracking-widest uppercase flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/15">
            {pack.device === "desktop" ? <Monitor size={10} /> : <Smartphone size={10} />}
            {pack.device === "desktop" ? "DESKTOP" : "PHONE"}
          </span>
        </div>

        {/* Glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
      </div>

      {/* MOBILE SHOWCASE VIEW: Full-Bleed Preview + 5 Piece Interactive Touch Selector */}
      <div className="md:hidden relative w-full h-56 sm:h-64 overflow-hidden border-b border-white/10 bg-black">
        <img
          src={activeMobileItem.previewUrl}
          alt={activeMobileItem.title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="spec-badge text-[8px] font-mono px-2 py-0.5 rounded-full text-white/90 tracking-widest uppercase bg-black/80 backdrop-blur-md border border-white/15">
            {pack.items.length} PIECES
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="spec-badge text-[8px] font-mono px-2 py-0.5 rounded-full text-white/80 tracking-widest uppercase flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/15">
            {pack.device === "desktop" ? <Monitor size={9} /> : <Smartphone size={9} />}
            {pack.device === "desktop" ? "DESKTOP" : "PHONE"}
          </span>
        </div>

        {/* Piece Title & Interactive Thumbnail Pills */}
        <div className="absolute bottom-2 inset-x-2 z-20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/80 px-0.5">
            <span className="truncate max-w-[170px]">
              0{mobileSliceIdx + 1} // {activeMobileItem.title}
            </span>
            <span className="text-[9px] text-white/50 uppercase tracking-wider">TAP PIECE</span>
          </div>

          <div className="flex items-center gap-1">
            {pack.items.map((item, idx) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  setMobileSliceIdx(idx);
                }}
                className={`relative flex-1 h-7 sm:h-8 rounded overflow-hidden border transition-all duration-200 cursor-pointer ${
                  mobileSliceIdx === idx
                    ? "border-white ring-1 ring-white/60 scale-[1.02] shadow-lg"
                    : "border-white/15 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={item.tinyUrl || item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white bg-black/40">
                  0{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Information */}
      <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 bg-void-black/80">
        <div>
          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
            <span className="font-mono text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest">
              {pack.serial} // {pack.category}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-white/60">
              {pack.format}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl md:text-2xl font-sans font-bold uppercase tracking-tight text-white group-hover:text-white/90 transition-colors">
            {pack.title}
          </h3>
          <p className="text-xs text-white/50 mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed font-sans">
            {pack.tagline}
          </p>
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <FolderArchive size={12} className="text-white/40" />
            {pack.items.length} Master Files
          </span>

          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/90 bg-white/5 hover:bg-white/10 px-2.5 sm:px-3 py-1.5 rounded-md border border-white/10 group-hover:border-white/30 transition-all">
            <span>Explore Suite</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ComingSoonCard: React.FC = () => {
  return (
    <div className="group flex flex-col bg-void-gray/20 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 luxury-border-glow shadow-2xl relative select-none">
      {/* Visual Top Stage */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden border-b border-white/10 flex items-center justify-center bg-gradient-to-b from-void-raised via-void-black to-void-deep">
        {/* Ambient Aura */}
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-white/[0.04] via-blue-500/[0.08] to-purple-500/[0.05] blur-3xl group-hover:scale-150 transition-transform duration-1000" />

        {/* Subtle Grid Lines */}
        <div
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(128,128,128,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.07)_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {/* Center Glowing Lock */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:border-white/30 group-hover:text-white transition-all duration-500 group-hover:scale-110">
            <Lock size={22} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-white/80 tracking-widest uppercase">
              STUDIO FORGING ASSETS
            </span>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
          <span className="spec-badge text-[9px] font-mono px-2.5 py-1 rounded-full text-white/80 tracking-widest uppercase bg-black/70 backdrop-blur-md border border-white/15">
            NEXT DROP
          </span>
        </div>

        <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none">
          <span className="spec-badge text-[9px] font-mono px-2.5 py-1 rounded-full text-white/60 tracking-widest uppercase flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/15">
            <Clock size={10} />
            UPCOMING
          </span>
        </div>

        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-transparent pointer-events-none z-20" />
      </div>

      {/* Card Info */}
      <div className="p-6 flex flex-col justify-between flex-1 bg-void-black/70">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
              VP-DROP04 // UNRELEASED
            </span>
            <span className="text-[10px] font-mono text-white/40">
              8K / 4K / OLED
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-sans font-bold uppercase tracking-tight text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
            Capsule Vol. 04
            <Sparkles size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </h3>
          <p className="text-xs text-white/45 mt-1.5 line-clamp-2 leading-relaxed font-sans">
            A brand-new 5-piece thematic wallpaper suite is currently being designed and rendered in the studio.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <FolderArchive size={12} />
            5 Exclusive Wallpapers
          </span>

          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 bg-white/5 px-2.5 py-1 rounded border border-white/10 group-hover:border-white/20 transition-all">
            Dropping Soon
          </span>
        </div>
      </div>
    </div>
  );
};
