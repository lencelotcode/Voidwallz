import React, { useRef, useState } from "react";
import { motion } from "motion/react";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  disabled?: boolean;
}

export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 280, damping: 20, mass: 0.2 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.div>
  );
}
