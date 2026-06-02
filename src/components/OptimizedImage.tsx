import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface OptimizedImageProps {
  src: string;
  placeholder: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  animate?: any;
  transition?: any;
}

export default function OptimizedImage({
  src,
  placeholder,
  alt,
  className = "",
  containerClassName = "",
  animate,
  transition,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset load state when source changes
    setIsLoaded(false);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/*
          Placeholder - Tiny blurry image.
          We use absolute positioning to keep it behind the main image.
      */}
      <img
        src={placeholder}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-0" : "opacity-100"
        } blur-xl scale-110`}
        style={{ zIndex: 0 }}
      />

      {/* Main Image */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          ...(animate || {}),
        }}
        transition={transition || { duration: 0.8, ease: "easeOut" }}
        src={src}
        alt={alt}
        className={`relative w-full h-full object-cover ${className}`}
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
