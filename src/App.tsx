import { Instagram, Twitter } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "motion/react";
import React, { useEffect, useState, useRef } from "react";
import Cursor from "./components/Cursor";
import OptimizedImage from "./components/OptimizedImage";
import Gallery from "./components/Gallery";
import LatestUploads from "./components/LatestUploads";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import ReportPage from "./components/ReportPage";
import WallpaperModal from "./components/WallpaperModal";
import { Wallpaper } from "./types";
import { useWallpapers } from "./hooks/useWallpapers";
import {
  PrivacyPolicy,
  TermsOfService,
  License,
} from "./components/LegalPages";

export const navigateToWallpaper = (wp: Wallpaper) => {
  const slug = wp.title.toLowerCase().replace(/\s+/g, "-");
  window.history.pushState(null, "", `/${wp.device}/${slug}/`);
  window.dispatchEvent(new Event("wallpaper-navigate"));
};

function WallpaperRouteManager({
  isOledOptimized,
}: {
  isOledOptimized: boolean;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();
  const [selectedWp, setSelectedWp] = useState<Wallpaper | null>(null);

  useEffect(() => {
    if (loading) return;

    const handleUrlChange = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/(desktop|mobile)\/([^/]+)\/?$/);

      if (match) {
        const device = match[1];
        const rawSlug = match[2];
        const slug = decodeURIComponent(rawSlug)
          .toLowerCase()
          .replace(/\s+/g, "-");

        const allWallpapers =
          device === "desktop" ? desktopWallpapers : mobileWallpapers;

        const wp = allWallpapers.find((w) => {
          const titleSlug = w.title.toLowerCase().replace(/\s+/g, "-");
          return titleSlug === slug;
        });

        if (wp) {
          setSelectedWp(wp);
        } else {
          setSelectedWp(null);
        }
      } else {
        setSelectedWp(null);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("wallpaper-navigate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("wallpaper-navigate", handleUrlChange);
    };
  }, [desktopWallpapers, mobileWallpapers, loading]);

  const handleClose = () => {
    window.history.pushState(
      null,
      "",
      window.location.pathname === "/" ? "/" : window.location.pathname,
    );
    window.dispatchEvent(new Event("wallpaper-navigate"));
  };

  return (
    <WallpaperModal
      selectedWp={selectedWp}
      onClose={handleClose}
      isOledOptimized={isOledOptimized}
    />
  );
}

const fallbackWallpaperOfTheDay: Wallpaper = {
  id: "desktop-liquid-void",
  title: "Liquid Void",
  serial: "ID: V-142",
  category: "Wallpaper of the Day",
  format: "8K AVIF",
  downloads: 48920,
  previewUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600",
  tinyUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=50",
  originalUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100",
  device: "desktop",
};

function Hero({
  onOpenModal,
  isOledOptimized,
}: {
  onOpenModal: (wp: Wallpaper) => void;
  isOledOptimized: boolean;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 150]);
  const yImage = useTransform(scrollY, [0, 1000], [0, -100]);

  // Mouse parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const { left, top, width, height } =
      heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Dynamically select the newest wallpaper
  const dynamicWp = desktopWallpapers[0] || mobileWallpapers[0];
  const wallpaperOfTheDay = dynamicWp
    ? { ...dynamicWp, category: "Wallpaper of the Day" }
    : fallbackWallpaperOfTheDay;

  const titleLines = ["The Ethereal", "Monochrome"];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col justify-center px-10 pt-32 pb-16 overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-void-black z-0 pointer-events-none" />

      {/* Interactive background elements */}
      <motion.div
        animate={{
          x: mousePos.x * 50,
          y: mousePos.y * 50,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 50 }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-16 pb-24 md:pb-16 mt-8 md:mt-0">
        <motion.div
          style={{ y: yText }}
          className="flex flex-col w-full md:w-5/12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-[10px] opacity-30 uppercase tracking-[0.3em]">
              Selection 01
            </span>
          </motion.div>

          <div className="overflow-hidden">
            {titleLines.map((line, i) => (
              <motion.h1
                key={i}
                className="text-6xl md:text-7xl lg:text-[6rem] leading-[1.1] font-serif italic font-light tracking-tighter"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 0.3 + i * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p
            className="text-sm md:text-base opacity-50 max-w-md mt-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Curated minimalist captures designed to disappear into your
            interface. Focus on negative space and subtle gradients.
          </motion.p>
        </motion.div>

        <motion.div
          style={{ y: yImage }}
          animate={{
            rotateX: mousePos.y * -10,
            rotateY: mousePos.x * 10,
            opacity: 1,
            scale: 1,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 40 }}
          onClick={() => !loading && onOpenModal(wallpaperOfTheDay)}
          className="w-full md:w-7/12 h-[50vh] md:h-[65vh] relative group cursor-pointer hover-trigger perspective-1000"
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <div className="w-full h-full border border-white/10 p-2 relative overflow-hidden bg-white/5 shadow-2xl">
            {loading ? (
              <div className="w-full h-full bg-void-black/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full bg-black/20 animate-shimmer" />
              </div>
            ) : (
              <>
                <OptimizedImage
                  src={wallpaperOfTheDay.previewUrl}
                  placeholder={wallpaperOfTheDay.tinyUrl}
                  alt={wallpaperOfTheDay.title}
                  animate={{
                    scale:
                      1.05 +
                      (Math.abs(mousePos.x) + Math.abs(mousePos.y)) * 0.05,
                    x: mousePos.x * -20,
                    y: mousePos.y * -20,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`filter brightness-75 group-hover:brightness-90 transition-all duration-300 ease-out ${isOledOptimized ? "oled-image" : ""}`}
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
                  <div>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-mono mb-2 block text-white drop-shadow-md">
                      {wallpaperOfTheDay.category}
                    </span>
                    <h3 className="text-2xl font-serif italic tracking-wide text-white drop-shadow-md">
                      {wallpaperOfTheDay.title}
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[10px] border border-white/20 px-2 py-1 bg-black/40 backdrop-blur-md rounded font-mono text-white">
                      {wallpaperOfTheDay.serial}
                    </span>
                    <span className="text-[10px] bg-white text-black px-2 py-1 rounded font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {wallpaperOfTheDay.format}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="absolute bottom-8 left-10 right-10 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/5 pt-4 z-20"
      >
        <div className="flex gap-8 md:gap-12 w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">
              Resolution
            </span>
            <span className="text-xs font-mono">8192 &times; 4608</span>
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">
              Format
            </span>
            <span className="text-xs font-mono">RAW / AVIF</span>
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">
              Color Depth
            </span>
            <span className="text-xs font-mono">14 BIT</span>
          </div>
        </div>
        <div className="mt-2 md:mt-0 ml-auto md:ml-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, "", "/");
              window.dispatchEvent(new Event("popstate"));
              setTimeout(() => {
                document
                  .getElementById("gallery")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="text-[10px] uppercase font-bold tracking-widest hover:text-white/50 transition-colors"
          >
            Scroll to explore &darr;
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const words = [
    "VOIDWALLZ",
    "MONOCHROME",
    "ETHEREAL",
    "VORTEX",
    "SINGULARITY",
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-4 border-y border-white/5 bg-void-black marquee-container"
    >
      <div className="marquee-content flex items-center gap-16 font-serif italic text-3xl opacity-20">
        {[...words, ...words, ...words].map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </motion.div>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax effects
  const yText = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const ySteps = useTransform(scrollYProgress, [0, 1], [150, -150]);

  const steps = [
    {
      num: "01",
      title: "Discover",
      desc: "We explore emerging digital aesthetics to uncover atmospheric compositions shaped through modern visual creation and cinematic design.",
    },
    {
      num: "02",
      title: "Refine",
      desc: "Every wallpaper is carefully refined, color-balanced, and optimized to preserve depth, clarity, and visual harmony across modern displays.",
    },
    {
      num: "03",
      title: "Elevate",
      desc: "Prepared in native resolutions from mobile to 8K, each piece is designed to transform everyday screens into immersive digital environments.",
    },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="py-32 md:py-48 px-6 md:px-10 border-t border-white/5 bg-void-black relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px] pointer-events-none -translate-y-1/2 mix-blend-screen" />

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20 lg:gap-32 justify-between relative z-10">
        <motion.div
          style={{ y: yText }}
          className="lg:w-5/12 flex flex-col justify-start"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[10px] text-white/40 uppercase tracking-[0.4em] mb-8 font-mono"
          >
            Philosophy
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl md:text-7xl lg:text-[5rem] font-serif italic font-light tracking-tighter leading-[1.05] max-w-[12ch] text-white/90 drop-shadow-sm"
          >
            How we craft our voids.
          </motion.h2>
        </motion.div>

        <motion.div
          style={{ y: ySteps }}
          className="lg:w-7/12 relative pl-8 md:pl-16"
        >
          {/* Animated Vertical Line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent"
          />

          <div className="flex flex-col gap-16 md:gap-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="group cursor-default relative"
              >
                {/* Node on the timeline */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.6 }}
                  className="absolute top-2 -left-[35px] md:-left-[67px] w-1.5 h-1.5 bg-white/40 rounded-full group-hover:bg-white/90 transition-colors duration-500 shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                />

                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <span className="text-[10px] text-white/30 font-mono tracking-widest">
                    {step.num}
                  </span>
                  <span className="w-8 h-px bg-white/10 group-hover:w-12 transition-all duration-700 ease-out" />
                  <span className="text-[10px] text-white/60 font-mono tracking-widest uppercase">
                    {step.title}
                  </span>
                </div>
                <p className="text-sm md:text-base text-white/50 leading-[1.8] group-hover:text-white/70 transition-colors duration-500 max-w-lg font-light">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-void-black border-t border-white/5 pt-32 pb-12 px-10 overflow-hidden relative">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter mb-8 leading-tight">
            Embrace the <br /> void.
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-start md:justify-end gap-16 md:gap-32">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono mb-2 block">
              Social
            </span>
            <a
              href="/"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger group"
            >
              <Instagram
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>Instagram</span>
            </a>
            <a
              href="/"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger group"
            >
              <Twitter
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>X // Twitter</span>
            </a>
            <a
              href="https://discord.gg/xhWGaPp8H2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="group-hover:scale-110 transition-transform"
              >
                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
              </svg>
              <span>Discord</span>
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono mb-2 block">
              Support
            </span>
            <a
              href="/report"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "/report");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger text-red-400/80 hover:text-red-400"
            >
              Report Anomaly
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono mb-2 block">
              Legal
            </span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "/privacy");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "/terms");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger"
            >
              Terms of Service
            </a>
            <a
              href="/license"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "/license");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger"
            >
              License
            </a>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest">
            &copy; 2026 VOIDWALLZ
          </span>
        </div>

        <div className="w-full md:w-1/3 flex justify-center text-4xl md:text-5xl font-serif italic font-light tracking-tighter opacity-20 select-none">
          voidwallz
        </div>

        <div className="w-full md:w-1/3 flex justify-center md:justify-end">
          <motion.div
            className="relative w-16 h-16 opacity-20 hover:opacity-60 transition-opacity cursor-pointer delay-75"
            whileHover={{ scale: 1.05 }}
          >
            {/* Desktop frame */}
            <div className="absolute top-0 right-0 w-12 h-10 border border-current rounded-sm">
              <div className="absolute inset-x-0 bottom-0 h-2 border-t border-current flex items-center justify-center">
                <div className="w-2 h-[1px] bg-current"></div>
              </div>
            </div>
            {/* Phone frame */}
            <div className="absolute bottom-0 left-0 w-8 h-12 border border-current rounded-sm bg-void-black"></div>

            {/* Abstract shapes / artwork */}
            <motion.div
              className="absolute top-2 left-2 w-6 h-6 border border-current rounded-full"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-2 left-4 w-4 h-4 rounded-full bg-current"
              animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

function FeaturedCollections({
  onOpenModal,
}: {
  onOpenModal: (wp: Wallpaper) => void;
}) {
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();

  const collections = [
    {
      title: "Ethereal Voids",
      desc: "Deep monochrome explorations of negative space.",
      tag: "Minimal",
      image:
        desktopWallpapers.find((w) => w.category.includes("Minimal"))
          ?.previewUrl || desktopWallpapers[0]?.previewUrl,
    },
    {
      title: "Obsidian Flows",
      desc: "Liquid textures and dark atmospheric waves.",
      tag: "Liquid",
      image:
        mobileWallpapers.find((w) => w.category.includes("Liquid"))
          ?.previewUrl || mobileWallpapers[0]?.previewUrl,
    },
    {
      title: "Geometric Order",
      desc: "Structured patterns for focused interfaces.",
      tag: "Geometry",
      image:
        desktopWallpapers.find((w) => w.category.includes("Geometry"))
          ?.previewUrl || desktopWallpapers[1]?.previewUrl,
    },
  ];

  return (
    <section className="py-24 px-10 border-t border-white/5 bg-void-black">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col mb-16"
        >
          <span className="text-[10px] opacity-30 uppercase tracking-[0.3em] mb-4">
            Curated Series
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter">
            Featured Collections
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="group cursor-pointer relative aspect-[4/5] overflow-hidden border border-white/10"
              onClick={() => {
                const gallery = document.getElementById("gallery");
                if (gallery) {
                  gallery.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.history.pushState(null, "", "/");
                  window.dispatchEvent(new Event("popstate"));
                  setTimeout(() => {
                    document
                      .getElementById("gallery")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
            >
              <img
                src={col.image}
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                alt={col.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 block">
                  {col.tag}
                </span>
                <h3 className="text-2xl font-serif italic mb-2">{col.title}</h3>
                <p className="text-xs opacity-50 leading-relaxed max-w-[20ch]">
                  {col.desc}
                </p>
                <div className="mt-6 w-10 h-px bg-white/20 group-hover:w-20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hash, setHash] = useState(window.location.hash);
  const [path, setPath] = useState(window.location.pathname);
  const [isOledOptimized, setIsOledOptimized] = useState(false);
  const [ambientImage, setAmbientImage] = useState<string | null>(null);

  // Spotlight state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const spotlightY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  useEffect(() => {
    const handleLocationChange = () => {
      setHash(window.location.hash);
      setPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const renderContent = () => {
    const isWallpaperRoute = /^\/(desktop|mobile)\/([^/]+)\/?$/.test(path);

    if (path === "/report" || hash === "#report")
      return <ReportPage key="report" />;
    if (path === "/privacy" || hash === "#privacy")
      return <PrivacyPolicy key="privacy" />;
    if (path === "/terms" || hash === "#terms")
      return <TermsOfService key="terms" />;
    if (path === "/license" || hash === "#license")
      return <License key="license" />;

    if (path === "/desktop") {
      return (
        <motion.div
          key="desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col h-full bg-void-black"
        >
          <Gallery
            view="desktop"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    if (path === "/phone") {
      return (
        <motion.div
          key="phone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col h-full bg-void-black"
        >
          <Gallery
            view="phone"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    // Always render the main view if we are on a wallpaper route so the modal can overlay the gallery.
    if (isWallpaperRoute || path === "/" || path === "" || hash === "#main") {
      return (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col h-full"
        >
          <Hero
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
          />
          <Marquee />
          <FeaturedCollections onOpenModal={navigateToWallpaper} />
          <LatestUploads
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
          <Gallery
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
          <Manifesto />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div
      className={`no-cursor bg-void-black min-h-screen text-void-light overflow-x-hidden selection:bg-white selection:text-black relative ${isOledOptimized ? "oled-mode" : ""}`}
    >
      {/* Global Ambient Glow */}
      <AnimatePresence>
        {ambientImage && !isOledOptimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center blur-[150px]"
            style={{ backgroundImage: `url(${ambientImage})` }}
          />
        )}
      </AnimatePresence>

      <div className="film-grain" />
      <motion.div
        className="spotlight"
        style={{ left: spotlightX, top: spotlightY }}
      />

      <div className="hidden md:block">
        <Cursor />
      </div>

      <div className="fixed top-0 w-full h-px bg-gradient-to-r from-void-black via-white to-void-black opacity-30 z-[60]" />

      <AnimatePresence mode="wait">
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <WallpaperRouteManager isOledOptimized={isOledOptimized} />

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <Navbar
            isOledOptimized={isOledOptimized}
            setIsOledOptimized={setIsOledOptimized}
          />
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          <Footer />
        </motion.div>
      )}
    </div>
  );
}
