import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import type { RadarPulseDetail } from "../lib/radarPulse";

interface ActivePulse {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function Cursor() {
  const [cursorState, setCursorState] = useState<{
    hovered: boolean;
    label: string | null;
    isButton: boolean;
  }>({
    hovered: false,
    label: null,
    isButton: false,
  });

  const [pulses, setPulses] = useState<ActivePulse[]>([]);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleRadarPulse = (e: Event) => {
      const customEvent = e as CustomEvent<RadarPulseDetail>;
      const { x, y, color = "white" } = customEvent.detail || {};
      if (typeof x !== "number" || typeof y !== "number") return;

      const newPulse: ActivePulse = {
        id: Date.now() + Math.random(),
        x,
        y,
        color,
      };

      setPulses((prev) => [...prev, newPulse]);

      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== newPulse.id));
      }, 850);
    };

    window.addEventListener("voidwallz-radar-pulse", handleRadarPulse);
    return () => {
      window.removeEventListener("voidwallz-radar-pulse", handleRadarPulse);
    };
  }, []);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      const customLabel = cursorTarget?.getAttribute("data-cursor") || null;

      const isButton = Boolean(
        target.tagName.toLowerCase() === "button" ||
        target.closest("button") ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("a")
      );

      const hasHoverTrigger = Boolean(
        target.classList.contains("hover-trigger") ||
        target.closest(".hover-trigger") ||
        target.classList.contains("wallpaper-card") ||
        cursorTarget
      );

      if (customLabel) {
        setCursorState({ hovered: true, label: customLabel, isButton });
      } else if (isButton || hasHoverTrigger) {
        setCursorState({ hovered: true, label: null, isButton });
      } else {
        setCursorState({ hovered: false, label: null, isButton: false });
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Precision Core Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[99999] mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: cursorState.hovered ? 0 : 1,
          scale: cursorState.hovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Morphing Lens Ring & Label */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99998] flex items-center justify-center rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: cursorState.label ? 68 : cursorState.hovered ? 38 : 20,
          height: cursorState.label ? 26 : cursorState.hovered ? 38 : 20,
          borderRadius: cursorState.label ? "9999px" : "50%",
          backgroundColor: cursorState.label
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          borderColor: cursorState.label
            ? "transparent"
            : cursorState.hovered
            ? "rgba(255, 255, 255, 0.65)"
            : "rgba(255, 255, 255, 0.25)",
          borderWidth: "1px",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {cursorState.label && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-[9px] font-mono font-bold tracking-widest text-black uppercase select-none px-2 text-center leading-none"
          >
            {cursorState.label}
          </motion.span>
        )}
      </motion.div>

      {/* Expanding Concentric Radar Shockwave Rings */}
      <AnimatePresence>
        {pulses.map((pulse) => {
          const colorClass =
            pulse.color === "emerald"
              ? "border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              : pulse.color === "crimson"
              ? "border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
              : pulse.color === "cyan"
              ? "border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              : "border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.6)]";

          return (
            <div
              key={pulse.id}
              className="fixed pointer-events-none z-[99999]"
              style={{ left: pulse.x, top: pulse.y }}
            >
              {/* Primary High-Speed Shockwave Ring */}
              <motion.div
                initial={{ width: 0, height: 0, opacity: 1, scale: 0 }}
                animate={{ width: 190, height: 190, opacity: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute rounded-full border-2 -translate-x-1/2 -translate-y-1/2 ${colorClass}`}
              />
              {/* Secondary Harmonic Outer Wave */}
              <motion.div
                initial={{ width: 0, height: 0, opacity: 0.8, scale: 0 }}
                animate={{ width: 300, height: 300, opacity: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: "easeOut", delay: 0.05 }}
                className="absolute rounded-full border border-white/30 -translate-x-1/2 -translate-y-1/2"
              />
              {/* Center Core Flash */}
              <motion.div
                initial={{ scale: 1.6, opacity: 1 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full blur-[1px]"
              />
            </div>
          );
        })}
      </AnimatePresence>
    </>
  );
}

