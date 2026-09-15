import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("voidwallz_cookie_consent");
    if (!consent) {
      // Short delay for smooth slide-in after initial page mount
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("voidwallz_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("voidwallz_cookie_consent", "essential");
    setIsVisible(false);
  };

  const handleNavigate = (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="region"
          aria-label="Privacy and Cookie Consent"
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:max-w-md z-[99998] p-5 sm:p-6 bg-void-raised/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-void-light"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white/90">
              <Cookie size={16} />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold flex items-center gap-1.5">
                Privacy & Data Choice
              </h3>
              <p className="text-xs text-white/70 mt-1 font-sans leading-relaxed">
                Voidwallz operates under a strict <strong className="text-white font-semibold">Zero Invasive Tracking</strong> policy. We only use local storage for essential session states (OLED mode, acoustic ASMR volume, and saved favorites). No third-party behavioral advertising trackers.
              </p>
            </div>
            <button
              onClick={handleEssentialOnly}
              aria-label="Dismiss cookie notice with essential cookies only"
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              onClick={() => handleNavigate("/cookies")}
              className="text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              Cookie Policy &rarr;
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEssentialOnly}
                className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-[10px] font-mono uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Essential Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black text-[10px] font-mono uppercase tracking-wider font-bold hover:bg-white/90 shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck size={12} />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
