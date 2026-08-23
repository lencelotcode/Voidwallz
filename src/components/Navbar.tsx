import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

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
  const [isAtmosphereMenuOpen, setIsAtmosphereMenuOpen] = useState(false);

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
      <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-4 border-b border-white/5 flex justify-between items-center bg-void-black/80 backdrop-blur-md">
        <div className="w-1/3 flex justify-start items-center">
          <a
            href="/"
            onClick={(e) => handleNavigate(e, "/")}
            className="flex items-center gap-3 hover-trigger group"
            data-cursor="HOME"
          >
            <img
              src="/logomain.png?v=2"
              alt="Voidwallz Logo"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <h1 className="hidden sm:block text-base md:text-lg font-light tracking-tighter font-serif italic text-white select-none">
              voidwallz
            </h1>
          </a>
        </div>
        <div className="w-1/3 flex justify-center">
          <nav className="hidden md:flex space-x-8 text-[11px] uppercase tracking-[0.2em]">
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
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </a>
          </nav>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-3">
          {/* Atmosphere Mode Switcher */}
          <button
            onClick={cycleAtmosphere}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 luxury-border-glow ${
              currentMode !== "standard"
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                : "bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
            title="Click to cycle atmosphere effects (Standard / OLED / CRT / Noir)"
            data-cursor="FX"
          >
            <span className="text-[11px]">
              {atmosphereOptions.find((a) => a.id === currentMode)?.icon}
            </span>
            <span>
              FX: {atmosphereOptions.find((a) => a.id === currentMode)?.label}
            </span>
          </button>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(true)}
              className="text-white opacity-90 hover:opacity-100 p-2 -mr-2 cursor-pointer"
            >
              <Menu size={24} />
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
                className="fixed inset-0 z-[9999] bg-void-black/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-white opacity-60 hover:opacity-100 p-2 cursor-pointer"
                >
                  <X size={32} />
                </button>
                <nav className="flex flex-col space-y-8 text-center text-sm uppercase tracking-[0.3em]">
                  <a
                    href="/"
                    onClick={(e) => handleNavigate(e, "/")}
                    className={`hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Home
                  </a>
                  <a
                    href="/packs"
                    onClick={(e) => handleNavigate(e, "/packs")}
                    className={`hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/packs" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Packs
                  </a>
                  <a
                    href="/desktop"
                    onClick={(e) => handleNavigate(e, "/desktop")}
                    className={`hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/desktop" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Desktop
                  </a>
                  <a
                    href="/mobile"
                    onClick={(e) => handleNavigate(e, "/mobile")}
                    className={`hover:opacity-100 transition-opacity cursor-pointer ${
                      currentPath === "/mobile" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Phone
                  </a>
                  <a
                    href="/updates"
                    onClick={(e) => handleNavigate(e, "/updates")}
                    className={`hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center gap-2 ${
                      currentPath === "/updates" ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    <span>System Logs</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </a>

                  {/* Atmosphere selector for mobile */}
                  <div className="pt-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      Atmosphere FX
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {atmosphereOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAtmosphereMode?.(opt.id);
                            setIsOledOptimized?.(opt.id === "oled");
                            setIsOpen(false);
                          }}
                          className={`px-3 py-2 text-[10px] font-mono rounded border uppercase tracking-wider transition-colors ${
                            currentMode === opt.id
                              ? "bg-white text-black border-white font-bold"
                              : "border-white/10 text-white/50"
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
