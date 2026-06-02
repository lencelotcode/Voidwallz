import { useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface OptimizedImageProps extends Omit<
  HTMLMotionProps<"img">,
  "src" | "placeholder"
> {
  src: string;
  placeholder: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export default function OptimizedImage({
  src,
  placeholder,
  alt,
  className = "",
  containerClassName = "",
  ...motionProps
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Placeholder - Tiny blurry image */}
      <img
        src={placeholder}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? "opacity-0" : "opacity-100"
        } blur-lg scale-110`}
      />

      {/* Main Image */}
      <motion.img
        {...motionProps}
        initial={{ opacity: 0, ...(motionProps.initial as object) }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          ...(isLoaded ? (motionProps.animate as object) : {}),
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          ...motionProps.transition,
        }}
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    </div>
  );
}
