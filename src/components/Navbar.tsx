import React, { useState, useEffect } from "react";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { sound } from "../lib/soundEffects";

export type AtmosphereMode = "standard" | "oled" | "crt" | "noir";

export default function Navbar({
  isOledOptimized,
  setIsOledOptimized,
  atmosphereMode = "standard",
  setAtmosphereMode,
}: {
  isOledOptimized?: boolean;
  setIsOledOptimized?: (val: boolean) => void;
  atmosphereMode?: AtmosphereMode;
  setAtmosphereMode?: (mode: AtmosphereMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  useEffect(() => {
    const handleSfxChange = () => setIsMuted(sound.getIsMuted());
    window.addEventListener("voidwallz-sfx-toggled", handleSfxChange);
    return () => window.removeEventListener("voidwallz-sfx-toggled", handleSfxChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    e.preventDefault();
    sound.playTap();
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
    setCurrentPath(path);
    setIsOpen(false);
  };

  const atmosphereOptions: { id: AtmosphereMode; label: string; icon: string }[] = [
    { id: "standard", label: "STANDARD", icon: "✦" },
    { id: "oled", label: "OLED PURE", icon: "●" },
    { id: "crt", label: "CRT SCAN", icon: "▤" },
    { id: "noir", label: "NOIR GRAIN", icon: "◪" },
  ];

  const currentMode = atmosphereMode || (isOledOptimized ? "oled" : "standard");

  const cycleAtmosphere = () => {
    sound.playSwitch();
    if (!setAtmosphereMode) {
      setIsOledOptimized?.(!isOledOptimized);
      return;
    }
    const order: AtmosphereMode[] = ["standard", "oled", "crt", "noir"];
    const currentIndex = order.indexOf(currentMode);
    const nextMode = order[(currentIndex + 1) % order.length];
    setAtmosphereMode(nextMode);
    setIsOledOptimized?.(nextMode === "oled");
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 md:px-10 py-3 sm:py-4 border-b border-white/5 flex justify-between items-center bg-void-black/85 backdrop-blur-md">
        <div className="flex justify-start items-center flex-shrink-0">
          <a
            href="/"
            onClick={(e) => handleNavigate(e, "/")}
            className="flex items-center gap-2.5 sm:gap-3 hover-trigger group cursor-pointer"
            data-cursor="HOME"
          >
            {/* Animated Logo Emblem */}
            <div className="relative flex items-center justify-center">
              {/* Pulsing Ambient Glow */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-white/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 blur-md group-hover:scale-125 transition-all duration-500 pointer-events-none" />

              {/* Logo Badge Container with 3D Tilt & Sheen */}
              <div className="relative overflow-hidden rounded-xl ring-1 ring-white/15 group-hover:ring-white/50 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 ease-out shadow-xl bg-black">
                <img
                  src="/Mainlogo.svg"
                  alt="Voidwallz Logo"
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain"
                />
                {/* Diagonal Holographic Sweep on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
              </div>
            </div>

            {/* Animated Brand Typography */}
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-serif italic tracking-tight text-white select-none transition-all duration-500 group-hover:tracking-wider group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.75)]">
                voidwallz
              </h1>
              <span className="w-1 h-1 rounded-full bg-emerald-400/60 group-hover:bg-emerald-400 group-hover:scale-125 group-hover:shadow-[0_0_8px_rgba(52,211,153,1)] transition-all duration-500" />
            </div>
          </a>
        </div>
        <div className="hidden md:flex justify-center flex-1">
          <nav className="flex space-x-8 text-[11px] uppercase tracking-[0.2em]">
            <a
              href="/"
              onClick={(e) => handleNavigate(e, "/")}
              className={`hover:opacity-100 transition-opacity ${
                currentPath === "/" ? "text-white opacity-100 font-bold" : "text-white/50 opacity-60"
              }`}
            >
              Home
            </a>
            <a
              href="/packs"
              onClick={(e) => handleNavigate(e, "/packs")}
              className={`hover:opacity-100 transition-opacity ${
                currentPath === "/packs" ? "text-white opacity-100 font-bold" : "text-white/50 opacity-60"
              }`}
            >
              Packs
            </a>
            <a
              href="/desktop"
              onClick={(e) => handleNavigate(e, "/desktop")}
              className={`hover:opacity-100 transition-opacity ${
                currentPath === "/desktop" ? "text-white opacity-100 font-bold" : "text-white/50 opacity-60"
              }`}
            >
              Desktop
            </a>
            <a
              href="/mobile"
              onClick={(e) => handleNavigate(e, "/mobile")}
              className={`hover:opacity-100 transition-opacity ${
                currentPath === "/mobile" ? "text-white opacity-100 font-bold" : "text-white/50 opacity-60"
              }`}
            >
              Phone
            </a>
            <a
              href="/updates"
              onClick={(e) => handleNavigate(e, "/updates")}
              className={`hover:opacity-100 transition-opacity flex items-center gap-1 ${
                currentPath === "/updates" ? "text-white opacity-100 font-bold" : "text-white/50 opacity-60"
              }`}
            >
              <span>Logs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </a>
          </nav>
        </div>

        <div className="flex justify-end items-center flex-shrink-0">
          {/* Unified Luxury Studio Capsule */}
          <div className="hidden md:flex items-center p-1 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
            {/* Atmosphere Mode Switcher */}
            <button
              onClick={cycleAtmosphere}
              aria-label="Cycle visual atmosphere effects"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                currentMode !== "standard"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
              title="Cycle Atmosphere Effects (Standard / OLED / CRT / Noir)"
              data-cursor="FX"
            >
              <span className="text-[11px]">
                {atmosphereOptions.find((a) => a.id === currentMode)?.icon}
              </span>
              <span>
                {atmosphereOptions.find((a) => a.id === currentMode)?.label}
              </span>
            </button>

            <div className="w-px h-3 bg-white/15 mx-0.5" />

            {/* Sound FX Minimalist Icon Toggle */}
            <button
              onClick={() => sound.toggleMute()}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              aria-label={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              data-cursor="SFX"
            >
              {!isMuted ? (
                <Volume2 size={12} className="text-emerald-400" />
              ) : (
                <VolumeX size={12} className="text-white/35" />
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => sound.toggleMute()}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-transform cursor-pointer"
              title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              aria-label={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            >
              {!isMuted ? (
                <Volume2 size={13} className="text-emerald-400" />
              ) : (
                <VolumeX size={13} className="text-white/40" />
              )}
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 z-[9999] bg-void-black/95 backdrop-blur-2xl flex flex-col items-center justify-start overflow-y-auto px-6 py-10 sm:py-14 pointer-events-auto"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X size={20} />
                </button>

                {/* Mobile Drawer Top Brand */}
                <div className="flex flex-col items-center mb-6 sm:mb-8 gap-2 pointer-events-none mt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-md pointer-events-none" />
                    <img
                      src="/Mainlogo.svg"
                      alt="Voidwallz Logo"
                      className="w-12 h-12 object-contain rounded-2xl ring-1 ring-white/20 shadow-2xl bg-black relative z-10"
                    />
                  </div>
                  <span className="font-serif italic text-xl tracking-tighter text-white">voidwallz</span>
                </div>

                <nav className="flex flex-col space-y-6 text-center text-xs sm:text-sm uppercase tracking-[0.25em] w-full max-w-xs">
                  <a
                    href="/"
                    onClick={(e) => handleNavigate(e, "/")}
                    className={`py-1.5 hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Home
                  </a>
                  <a
                    href="/packs"
                    onClick={(e) => handleNavigate(e, "/packs")}
                    className={`py-1.5 hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/packs" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Packs
                  </a>
                  <a
                    href="/desktop"
                    onClick={(e) => handleNavigate(e, "/desktop")}
                    className={`py-1.5 hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/desktop" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Desktop
                  </a>
                  <a
                    href="/mobile"
                    onClick={(e) => handleNavigate(e, "/mobile")}
                    className={`py-1.5 hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/mobile" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Phone
                  </a>
                  <a
                    href="/updates"
                    onClick={(e) => handleNavigate(e, "/updates")}
                    className={`py-1.5 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center gap-2 ${
                      currentPath === "/updates" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    <span>System Logs</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </a>

                  {/* Atmosphere selector for mobile */}
                  <div className="pt-5 border-t border-white/10 flex flex-col items-center gap-2.5">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      Atmosphere FX
                    </span>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {atmosphereOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAtmosphereMode?.(opt.id);
                            setIsOledOptimized?.(opt.id === "oled");
                            setIsOpen(false);
                          }}
                          className={`px-3 py-2 text-[10px] font-mono rounded-lg border uppercase tracking-wider transition-colors ${
                            currentMode === opt.id
                              ? "bg-white text-black border-white font-bold shadow-md"
                              : "border-white/10 text-white/50 hover:border-white/30"
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
