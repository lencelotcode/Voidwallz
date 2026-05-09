import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Wait a bit after reaching 100%
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] bg-void-black flex flex-col items-center justify-center text-void-light"
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-void-black via-white to-void-black opacity-50" />
      
      <div className="overflow-hidden">
        <motion.h1 
          className="font-serif italic text-4xl md:text-6xl font-light tracking-tighter"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          voidwallz
        </motion.h1>
      </div>
      
      <div className="mt-8 overflow-hidden h-6">
        <motion.p 
          className="font-mono text-[10px] uppercase tracking-widest text-void-light/50"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
        >
          {progress}% // ALL NODES ACTIVE
        </motion.p>
      </div>
    </motion.div>
  );
}
