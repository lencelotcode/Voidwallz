import { motion } from "motion/react";
import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Layers,
  Cpu,
  Tv,
  Zap,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

interface UpdateLog {
  version: string;
  codename: string;
  date: string;
  status: "LATEST" | "STABLE" | "ARCHIVED";
  category: "FEATURE" | "ENGINE" | "VISUAL FX" | "CORE";
  summary: string;
  icon: any;
  highlights: string[];
  specs: { label: string; val: string }[];
  actionLink?: { label: string; path: string };
}

const UPDATES_DATA: UpdateLog[] = [
  {
    version: "v2.4.0",
    codename: "CAPSULE DISPATCH",
    date: "August 2026",
    status: "LATEST",
    category: "FEATURE",
    icon: Layers,
    summary: "Introduced Void Packs: Thematic 5-piece multi-artwork series for both Desktop and Mobile ecosystems.",
    highlights: [
      "Phone Decks: Interactive 5-device overlapping iPhone titanium deck with 3D hover fan-out physics.",
      "Desktop Suites: 5-slice panoramic architectural showcases with dynamic hover slice expansion.",
      "Pack Explorer Portal: Fullscreen interactive modal with miniature deck navigation and bulk 1-click pack downloading.",
      "Dedicated /packs Route: Independent high-performance routing with active navbar tracking.",
    ],
    specs: [
      { label: "Assets Per Pack", val: "5 Master Files" },
      { label: "Phone Deck UI", val: "3D Perspective Fan" },
      { label: "Desktop Suite UI", val: "5-Slice Panorama" },
      { label: "Format", val: "8K AVIF / 4K Retina" },
    ],
    actionLink: { label: "Explore Void Packs", path: "/packs" },
  },
  {
    version: "v2.3.0",
    codename: "ATMOSPHERE ENGINE",
    date: "August 2026",
    status: "STABLE",
    category: "VISUAL FX",
    icon: Tv,
    summary: "Complete visual atmosphere pipeline featuring 4 rendering modes and photorealistic device mockups.",
    highlights: [
      "4-Mode Atmosphere Engine: Standard luxury, Pure OLED (true black), CRT Scanlines, and 35mm Noir Grain.",
      "Studio Display & Titanium Pro Mockups: Realistic camera notch, dynamic island, and specular glass glares.",
      "Adaptive Ambient Glow: Background dynamically illuminates with high-blur color sampling of hovered artworks.",
      "Dual View Mode: Instant switching between Studio Hardware Frame and Clean Full-Art Canvas.",
    ],
    specs: [
      { label: "FX Modes", val: "Standard / OLED / CRT / Noir" },
      { label: "Mockup Types", val: "Studio Display & Titanium" },
      { label: "Color Depth", val: "10-bit Simulated" },
      { label: "Ambient Blur", val: "160px Spatial" },
    ],
  },
  {
    version: "v2.2.0",
    codename: "RETINA 8K PIPELINE",
    date: "August 2026",
    status: "STABLE",
    category: "ENGINE",
    icon: Zap,
    summary: "Resolution and compression overhaul with direct master blob fetching and portrait-lock algorithms.",
    highlights: [
      "Master Resolution Pipeline: Upgraded fallback and storage CDN assets to pristine 8K (3840px+) and 4K Mobile.",
      "Zero-Latency Master Downloader: Direct fetch and blob triggering with instant extension auto-detection.",
      "Aspect Ratio Optimization: Enforced vertical portrait-crop standards for mobile device formats.",
      "Refactored Metadata HUD: Streamlined wallpaper specs panel with category, release, and live download counters.",
    ],
    specs: [
      { label: "Desktop Res", val: "8K Ultra (3840x2160+)" },
      { label: "Mobile Res", val: "4K Retina (1440x2560+)" },
      { label: "Formats", val: "AVIF, WEBP, PNG" },
      { label: "Download Speed", val: "Direct Blob Buffer" },
    ],
  },
  {
    version: "v2.1.0",
    codename: "TYPOGRAPHIC IDENTITY",
    date: "August 2026",
    status: "STABLE",
    category: "VISUAL FX",
    icon: Sparkles,
    summary: "Integrated custom Google typography and cinematic kinetic loading sequences.",
    highlights: [
      "Curated Typography Engine: Integrated Outfit (Geometric Sans) and Space Mono (Technical HUD) across all components.",
      "Cinematic Welcome Loader: Multi-phase protocol initialization text with giant background countdown numbers and progress glow.",
      "Multi-Ring Spinners: Futuristic dual-opposing rotating kinetic rings for gallery and hero states.",
      "Scrollbar Cleanup: Engineered cross-browser zero-scrollbar utility (.scrollbar-hide) for sleek horizontal navigation.",
    ],
    specs: [
      { label: "Headings", val: "Outfit Variable" },
      { label: "HUD / Code", val: "Space Mono" },
      { label: "Accent", val: "Playfair Display" },
      { label: "Loader Transitions", val: "Spatial Scale-In" },
    ],
  },
  {
    version: "v2.0.0",
    codename: "VOID GENESIS",
    date: "July 2026",
    status: "ARCHIVED",
    category: "CORE",
    icon: Cpu,
    summary: "The architectural foundation of Voidwallz: dark luxury styling, Supabase integration, and spatial mouse physics.",
    highlights: [
      "Supabase Cloud Storage: Distributed CDN bucket architecture for desktop and mobile preview/original assets.",
      "Magnetic Cursor Physics: Sub-pixel cursor tracking with contextual hover states ('VIEW', 'CLOSE', 'PREV', 'NEXT').",
      "Liquid Void Hero: 3D perspective tilt with mouse parallax physics and metallic border glow tokens.",
      "Infinite Grid Architecture: Optimized virtual scrolling with category filters and instant keyword search.",
    ],
    specs: [
      { label: "Framework", val: "React 19 + Vite" },
      { label: "Styling", val: "Tailwind v4 Engine" },
      { label: "Animations", val: "Motion (Framer)" },
      { label: "Backend", val: "Supabase Storage" },
    ],
  },
];

export default function UpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "FEATURE", "VISUAL FX", "ENGINE", "CORE"];

  const filteredUpdates =
    activeCategory === "ALL"
      ? UPDATES_DATA
      : UPDATES_DATA.filter((u) => u.category === activeCategory);

  const handleNavigate = (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="min-h-screen bg-void-black text-void-light pt-28 pb-32 px-6 md:px-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[60vw] h-[400px] bg-white/[0.02] blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 right-10 w-[30vw] h-[300px] bg-white/[0.015] blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link */}
        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white mb-10 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </button>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 pb-10 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">
                System Dispatch // Live Changelog
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white">
              System Logs_
            </h1>
            <p className="text-sm text-white/50 max-w-xl mt-3 font-sans leading-relaxed">
              Chronological log of visual architectural evolutions, new protocol features, and rendering pipeline enhancements.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-widest rounded-full transition-all ${
                  activeCategory === cat
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 md:pl-10 space-y-12">
          {/* Vertical glowing timeline track */}
          <div className="absolute left-[7px] md:left-[11px] top-4 bottom-8 w-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

          {filteredUpdates.map((item, idx) => {
            const Icon = item.icon;
            const isLatest = item.status === "LATEST";

            return (
              <motion.div
                key={item.version}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[30px] md:-left-[46px] top-6 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isLatest
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                      : "bg-[#0c0c0c] text-white/60 border-white/20 group-hover:border-white/50 group-hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                </div>

                {/* Main Patch Card */}
                <div className="bg-[#0a0a0a]/90 border border-white/10 hover:border-white/25 rounded-xl p-6 md:p-8 backdrop-blur-xl luxury-border-glow shadow-2xl transition-all duration-300">
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight">
                        {item.version}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                        // {item.codename}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 text-white/50 border border-white/5 flex items-center gap-1">
                        <Calendar size={10} />
                        {item.date}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded font-bold ${
                          isLatest
                            ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                            : "bg-white/10 text-white/70 border border-white/10"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm md:text-base text-white/90 font-sans leading-relaxed mb-6">
                    {item.summary}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5 mb-8">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-3">
                      Key Upgrades & Architecture
                    </span>
                    {item.highlights.map((highlight, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-start gap-3 text-xs md:text-sm text-white/70 font-sans"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-white/40 mt-0.5 shrink-0 group-hover:text-white/80 transition-colors"
                        />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technical Specs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-black/40 border border-white/5 mb-4">
                    {item.specs.map((spec, sIdx) => (
                      <div key={sIdx}>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/40 block mb-0.5">
                          {spec.label}
                        </span>
                        <span className="text-[11px] font-mono text-white/90">
                          {spec.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Link Button if provided */}
                  {item.actionLink && (
                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={() => handleNavigate(item.actionLink!.path)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold rounded hover:bg-white/90 transition-all shadow-lg group/btn"
                      >
                        <span>{item.actionLink.label}</span>
                        <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
