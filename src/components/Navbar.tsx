import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

export default function Navbar({
  isOledOptimized,
  setIsOledOptimized,
}: {
  isOledOptimized?: boolean;
  setIsOledOptimized?: (val: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    e.preventDefault();
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-4 border-b border-white/5 flex justify-between items-center bg-void-black/80 backdrop-blur-md">
        <div className="w-1/3 flex justify-start items-center">
          <a
            href="/"
            onClick={(e) => handleNavigate(e, "/")}
            className="flex items-center gap-3 hover-trigger group"
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
          <nav className="hidden md:flex space-x-8 text-[11px] uppercase tracking-[0.2em] opacity-60">
            <a
              href="/"
              onClick={(e) => handleNavigate(e, "/")}
              className="hover:opacity-100 text-white opacity-100 transition-opacity"
            >
              Home
            </a>
            <a
              href="/desktop"
              onClick={(e) => handleNavigate(e, "/desktop")}
              className="hover:opacity-100 transition-opacity"
            >
              Desktop
            </a>
            <a
              href="/phone"
              onClick={(e) => handleNavigate(e, "/phone")}
              className="hover:opacity-100 transition-opacity"
            >
              Phone
            </a>
          </nav>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-4">
          {setIsOledOptimized && (
            <button
              onClick={() => setIsOledOptimized(!isOledOptimized)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 ${
                isOledOptimized
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isOledOptimized ? "bg-black animate-pulse" : "bg-white/20"}`}
              />
              OLED Mode
            </button>
          )}

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
                <nav className="flex flex-col space-y-8 text-center text-sm uppercase tracking-[0.3em] opacity-80">
                  <a
                    href="/"
                    onClick={(e) => handleNavigate(e, "/")}
                    className="hover:opacity-100 text-white transition-opacity cursor-pointer"
                  >
                    Home
                  </a>
                  <a
                    href="/desktop"
                    onClick={(e) => handleNavigate(e, "/desktop")}
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Desktop
                  </a>
                  <a
                    href="/phone"
                    onClick={(e) => handleNavigate(e, "/phone")}
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Phone
                  </a>
                  {setIsOledOptimized && (
                    <button
                      onClick={() => {
                        setIsOledOptimized(!isOledOptimized);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 mx-auto ${
                        isOledOptimized
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-white/40 border-white/10"
                      }`}
                    >
                      OLED Mode: {isOledOptimized ? "ON" : "OFF"}
                    </button>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
