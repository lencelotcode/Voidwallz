import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  placeholder?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  animate?: any;
  transition?: any;
}

export default function OptimizedImage({
  src,
  placeholder,
  fallbackSrc,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  animate,
  transition,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retriedDirectUrl, setRetriedDirectUrl] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When src prop changes, reset state
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
    setRetriedDirectUrl(false);
  }, [src]);

  // Check if image is already cached/complete on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

  const handleError = () => {
    // If currentSrc has transform query params (e.g. Supabase render/image), retry with clean URL
    if (!retriedDirectUrl && currentSrc.includes("?")) {
      const cleanUrl = currentSrc.split("?")[0];
      if (cleanUrl !== currentSrc) {
        setRetriedDirectUrl(true);
        setCurrentSrc(cleanUrl);
        return;
      }
    }

    // Next fallback: try explicit fallbackSrc if provided
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    // Final fallback: try placeholder if valid and distinct
    if (placeholder && currentSrc !== placeholder && !placeholder.startsWith("data:")) {
      setCurrentSrc(placeholder);
      return;
    }

    // All fallbacks exhausted
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-void-black/40 ${containerClassName}`}>
      {/* Background Shimmer Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Tiny Blurred Placeholder (if provided and different from current image) */}
      {placeholder && !hasError && placeholder !== currentSrc && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
            isLoaded ? "opacity-0" : "opacity-100"
          } blur-xl scale-110`}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Error Fallback Display */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-void-gray/40 border border-white/5 p-4 text-center">
          <ImageOff size={24} className="text-white/20 mb-2" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 truncate max-w-[80%]">
            {alt || "Wallpaper"}
          </span>
        </div>
      ) : (
        /* Main Image */
        <motion.img
          ref={imgRef}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            ...(animate || {}),
          }}
          transition={transition || { duration: 0.5, ease: "easeOut" }}
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
          }}
          onError={handleError}
          className={`relative w-full h-full object-cover ${className}`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
}
