import { Instagram, Twitter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Cursor from "./components/Cursor";
import Gallery from "./components/Gallery";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import WallpaperModal from "./components/WallpaperModal";
import { Wallpaper } from "./types";
import {
  PrivacyPolicy,
  TermsOfService,
  License,
} from "./components/LegalPages";

const wallpaperOfTheDay: Wallpaper = {
  id: 999,
  title: "Liquid Void",
  serial: "ID: V-142",
  category: "Wallpaper of the Day",
  format: "8K AVIF",
  downloads: 48920,
  imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600"
};

function Hero() {
  const [selectedWp, setSelectedWp] = useState<Wallpaper | null>(null);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-10 pt-32 pb-16 overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-void-black z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-16 pb-24 md:pb-16 mt-8 md:mt-0">
        <div className="flex flex-col w-full md:w-5/12">
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

          <motion.h1
            className="text-6xl md:text-7xl lg:text-[6rem] leading-[1.1] font-serif italic font-light tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The Ethereal <br />
            Monochrome
          </motion.h1>

          <motion.p
            className="text-sm md:text-base opacity-50 max-w-md mt-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Curated minimalist captures designed to disappear into your
            interface. Focus on negative space and subtle gradients.
          </motion.p>
        </div>

        <motion.div
          onClick={() => setSelectedWp(wallpaperOfTheDay)}
          className="w-full md:w-7/12 h-[50vh] md:h-[65vh] relative group cursor-pointer hover-trigger"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          <div className="w-full h-full border border-white/10 p-2 relative overflow-hidden bg-white/5">
            <img
              src={wallpaperOfTheDay.imgUrl}
              alt={wallpaperOfTheDay.title}
              className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-1000 ease-out"
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
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.2,
          delay: 0.6,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
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
            href="#gallery"
            className="text-[10px] uppercase font-bold tracking-widest hover:text-white/50 transition-colors"
          >
            Scroll to explore &darr;
          </a>
        </div>
      </motion.div>

      <WallpaperModal 
        selectedWp={selectedWp} 
        onClose={() => setSelectedWp(null)} 
      />
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
    <div className="py-4 border-y border-white/5 bg-void-black marquee-container">
      <div className="marquee-content flex items-center gap-16 font-serif italic text-3xl opacity-20">
        {[...words, ...words, ...words].map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <section
      id="about"
      className="py-32 px-10 border-t border-white/5 bg-void-black"
    >
      <div className="flex flex-col md:flex-row gap-16 md:gap-32 justify-between">
        <div className="md:w-1/3">
          <p className="text-[10px] opacity-30 uppercase tracking-[0.3em] mb-4">
            Philosophy
          </p>
          <h2 className="text-4xl md:text-5xl font-serif italic font-light tracking-tighter leading-tight">
            How we craft <br /> our voids.
          </h2>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 border-l border-white/5 pl-8 md:pl-16">
          <div className="group hover-trigger cursor-default">
            <span className="text-[10px] opacity-40 font-mono mb-2 block">
              01 // Discover
            </span>
            <p className="text-sm opacity-50 mt-4 leading-relaxed">
              We scour the digital frontier for the most striking, minimal
              artistry that doesn't scream for attention, but rather commands it
              quietly.
            </p>
          </div>
          <div className="group hover-trigger cursor-default">
            <span className="text-[10px] opacity-40 font-mono mb-2 block">
              02 // Refine
            </span>
            <p className="text-sm opacity-50 mt-4 leading-relaxed">
              Every image is color-graded, contrast-adjusted, and tested on
              high-density OLED displays to ensure absolute pixel perfection.
            </p>
          </div>
          <div className="group hover-trigger cursor-default mt-8 md:mt-0">
            <span className="text-[10px] opacity-40 font-mono mb-2 block">
              03 // Elevate
            </span>
            <p className="text-sm opacity-50 mt-4 leading-relaxed">
              We organize and crop resources into native resolutions spanning
              from mobile up to 8K, ensuring your setup always looks
              intentional.
            </p>
          </div>
        </div>
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
          <p className="text-sm opacity-40 max-w-sm mb-8 leading-relaxed">
            Join our newsletter for weekly drops of exclusive, high-resolution
            minimal wallpapers. No spam, just aesthetics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="ENTER EMAIL"
              className="bg-white/5 border border-white/10 px-6 py-3 text-[10px] uppercase tracking-widest font-mono text-white focus:outline-none focus:border-white/30 transition-colors w-full sm:w-64"
            />
            <button className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors hover-trigger">
              Subscribe
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-start md:justify-end gap-16 md:gap-32">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono mb-2 block">
              Social
            </span>
            <a
              href="#"
              className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger group"
            >
              <Instagram
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>Instagram</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger group"
            >
              <Twitter
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>X // Twitter</span>
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono mb-2 block">
              Legal
            </span>
            <a
              href="#privacy"
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-sm opacity-60 hover:opacity-100 transition-opacity hover-trigger"
            >
              Terms of Service
            </a>
            <a
              href="#license"
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
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderContent = () => {
    switch (hash) {
      case "#privacy":
        return <PrivacyPolicy key="privacy" />;
      case "#terms":
        return <TermsOfService key="terms" />;
      case "#license":
        return <License key="license" />;
      case "#desktop":
        return (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full bg-void-black"
          >
            <Gallery view="desktop" />
          </motion.div>
        );
      case "#phone":
        return (
          <motion.div
            key="phone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full bg-void-black"
          >
            <Gallery view="phone" />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <Hero />
            <Marquee />
            <Gallery />
            <Manifesto />
          </motion.div>
        );
    }
  };

  return (
    <div className="no-cursor bg-void-black min-h-screen text-void-light overflow-x-hidden selection:bg-white selection:text-black relative">
      <Cursor />

      <div className="fixed top-0 w-full h-px bg-gradient-to-r from-void-black via-white to-void-black opacity-30 z-[60]" />

      <AnimatePresence mode="wait">
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Navbar />
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          <Footer />
        </>
      )}
    </div>
  );
}
