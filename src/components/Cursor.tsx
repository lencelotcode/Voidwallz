import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

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

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

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
    </>
  );
}

