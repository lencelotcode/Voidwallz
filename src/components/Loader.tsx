import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const loadingTextStates = [
  "INITIALIZING NEURAL NET",
  "CONNECTING TO CLUSTER",
  "CACHING HIGH-RES ASSETS",
  "PREPARING CANVAS",
  "ALL NODES ACTIVE"
];

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 18);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Determine text based on progress
  const textIndex = Math.min(
    Math.floor((progress / 100) * loadingTextStates.length),
    loadingTextStates.length - 1
  );

  return (
    <motion.div
      className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.05,
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
    >
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Giant Background Number */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-mono font-bold text-white/[0.02] pointer-events-none select-none tracking-tighter"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {progress}
      </motion.div>

      {/* Main Branding */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="overflow-hidden mb-2">
          <motion.h1 
            className="font-mono uppercase text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            voidwallz
          </motion.h1>
        </div>
        
        {/* Dynamic Loading Text */}
        <div className="h-6 overflow-hidden mt-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50"
            >
              {progress === 100 ? "ACCESS GRANTED" : loadingTextStates[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 w-48 md:w-64 h-px bg-white/10 overflow-hidden">
        <motion.div 
          className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>

      {/* Progress Text overlaying bar slightly */}
      <motion.div 
        className="absolute bottom-16 md:bottom-20 font-mono text-[9px] text-white/40 tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {progress.toString().padStart(3, '0')}%
      </motion.div>
    </motion.div>
  );
}
