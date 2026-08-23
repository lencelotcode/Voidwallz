import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { FolderArchive, Sparkles, Layers, ArrowUpRight, Monitor, Smartphone, Lock, Clock } from "lucide-react";
import { VoidPack } from "../types";
import { useVoidPacks } from "../hooks/useVoidPacks";

export default function VoidPacks({
  onOpenPack,
  onHoverWallpaper,
  isDedicatedPage = false,
}: {
  onOpenPack: (pack: VoidPack) => void;
  onHoverWallpaper?: (url: string | null) => void;
  isDedicatedPage?: boolean;
}) {
  const { allPacks, desktopPacks, mobilePacks } = useVoidPacks();
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
      className={`${isDedicatedPage ? "pt-10 pb-28 min-h-[85vh]" : "py-28"} px-6 md:px-10 border-t border-white/5 bg-[#060606] relative`}
    >
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[300px] bg-white/[0.02] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[40vw] h-[300px] bg-white/[0.02] blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="spec-badge text-[10px] font-mono px-3 py-1 rounded-full text-amber-300/90 bg-amber-500/10 border-amber-500/30 tracking-widest uppercase flex items-center gap-1.5">
                <Lock size={11} />
                DROPPING SOON
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                // VAULT IN PRIVATE STAGING
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white">
              Void Packs_
            </h2>
            <p className="text-xs md:text-sm text-white/50 max-w-lg mt-3 font-sans leading-relaxed">
              Thematic 5-piece wallpaper suites engineered to elevate your entire digital workspace. Currently in staging — public drop coming soon.
            </p>
          </motion.div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all ${
                filter === "all"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              All ({allPacks.length})
            </button>
            <button
              onClick={() => setFilter("desktop")}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 ${
                filter === "desktop"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Monitor size={12} />
              Desktop ({desktopPacks.length})
            </button>
            <button
              onClick={() => setFilter("mobile")}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 ${
                filter === "mobile"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Smartphone size={12} />
              Phone ({mobilePacks.length})
            </button>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPacks.map((pack, index) => (
            <PackCard
              key={pack.id}
              pack={pack}
              index={index}
              onOpenPack={onOpenPack}
              onHoverWallpaper={onHoverWallpaper}
            />
          ))}
          
          {/* Coming Soon Capsule Card */}
          <ComingSoonCard index={displayedPacks.length} />
        </div>
      </div>
    </section>
  );
}

interface PackCardProps {
  pack: VoidPack;
  index: number;
  onOpenPack: (pack: VoidPack) => void;
  onHoverWallpaper?: (url: string | null) => void;
}

const PackCard: React.FC<PackCardProps> = ({
  pack,
  index,
  onOpenPack,
  onHoverWallpaper,
}) => {
  const [activePhoneIdx, setActivePhoneIdx] = useState<number | null>(null);

  const activePhoneItem = activePhoneIdx !== null ? pack.items[activePhoneIdx] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onClick={() => onOpenPack(pack)}
      onMouseEnter={() => onHoverWallpaper?.(pack.featuredImage)}
      onMouseLeave={() => {
        onHoverWallpaper?.(null);
        setActivePhoneIdx(null);
      }}
      data-cursor="EXP-PACK"
      className="group cursor-pointer flex flex-col bg-void-gray/30 border border-white/10 hover:border-white/30 rounded-xl overflow-hidden transition-all duration-500 luxury-border-glow shadow-2xl"
    >
      {pack.device === "desktop" ? (
        /* DESKTOP SUITE: Pure Accordion Slice Expansion into Full Scale */
        <div className="relative w-full h-56 sm:h-64 overflow-hidden border-b border-white/10 flex bg-black group/deck">
          {pack.items.map((item, sliceIdx) => (
            <div
              key={item.id}
              className="relative h-full overflow-hidden border-r last:border-r-0 border-white/20 transition-[flex] duration-300 ease-out flex-1 group-hover/deck:flex-[0.1] group-hover/deck:hover:!flex-[10] group/slice cursor-pointer"
            >
              <img
                src={item.previewUrl}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Subtle dark gradient overlay on compressed slices */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover/slice:opacity-0 transition-opacity duration-200 pointer-events-none" />

              {/* Dynamic Part Title Pill (reveals smoothly) */}
              <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover/slice:opacity-100 transition-opacity duration-200 flex items-center gap-2 whitespace-nowrap pointer-events-none">
                <span className="text-[10px] font-mono text-white bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  PART 0{sliceIdx + 1}: {item.title}
                </span>
              </div>

              {/* Number indicator on collapsed slices */}
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
              <Monitor size={10} />
              DESKTOP
            </span>
          </div>

          {/* Glass reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
        </div>
      ) : (
        /* PHONE DECK: Pure Accordion Portrait Slice Expansion into Full Scale */
        <div className="relative w-full h-56 sm:h-64 overflow-hidden border-b border-white/10 flex bg-black group/deck">
          {pack.items.map((item, sliceIdx) => (
            <div
              key={item.id}
              className="relative h-full overflow-hidden border-r last:border-r-0 border-white/20 transition-[flex] duration-300 ease-out flex-1 group-hover/deck:flex-[0.1] group-hover/deck:hover:!flex-[10] group/slice cursor-pointer"
            >
              <img
                src={item.previewUrl}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Subtle dark gradient overlay on compressed slices */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover/slice:opacity-0 transition-opacity duration-200 pointer-events-none" />

              {/* Dynamic iOS Lockscreen Time Overlay on Expanded Slice */}
              <div className="absolute top-4 inset-x-0 flex flex-col items-center opacity-0 group-hover/slice:opacity-100 transition-opacity duration-200 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <span className="text-[7px] font-sans font-medium text-white/80 uppercase tracking-wider">
                  Sunday, Aug 23
                </span>
                <span className="text-xl font-sans font-bold text-white tracking-tight">
                  12:45
                </span>
              </div>

              {/* Dynamic Part Title Pill (reveals smoothly) */}
              <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover/slice:opacity-100 transition-opacity duration-200 flex items-center gap-2 whitespace-nowrap pointer-events-none">
                <span className="text-[10px] font-mono text-white bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  DECK 0{sliceIdx + 1}: {item.title}
                </span>
              </div>

              {/* Number indicator on collapsed slices */}
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
              <Smartphone size={10} />
              PHONE
            </span>
          </div>

          {/* Glass reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
        </div>
      )}

      {/* Card Footer Information */}
      <div className="p-6 flex flex-col justify-between flex-1 bg-void-black/80">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
              {pack.serial} // {pack.category}
            </span>
            <span className="text-[10px] font-mono text-white/60">
              {pack.format}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-sans font-bold uppercase tracking-tight text-white group-hover:text-white/90 transition-colors">
            {pack.title}
          </h3>
          <p className="text-xs text-white/50 mt-1.5 line-clamp-2 leading-relaxed font-sans">
            {pack.tagline}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-amber-400/70 uppercase tracking-widest flex items-center gap-1.5">
            <Lock size={12} />
            Dropping Soon
          </span>

          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/90 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 group-hover:border-white/30 transition-all">
            <span>Preview Pack</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ComingSoonCard: React.FC<{ index: number }> = ({ index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group flex flex-col bg-void-gray/20 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-500 luxury-border-glow shadow-2xl relative select-none"
    >
      {/* Visual Top Stage with Cosmic Glow & Animated Radar Pulse */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden border-b border-white/10 flex items-center justify-center bg-gradient-to-b from-[#0c0c0c] via-[#070707] to-[#040404]">
        {/* Animated Cybernetic Ambient Aura */}
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-white/[0.04] via-blue-500/[0.08] to-purple-500/[0.05] blur-3xl group-hover:scale-150 transition-transform duration-1000" />

        {/* Subtle Grid Lines */}
        <div
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {/* Center Glowing Lock & Hologram Capsule */}
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
    </motion.div>
  );
};
