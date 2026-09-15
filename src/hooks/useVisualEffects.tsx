import React, { createContext, useContext, useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia?.(motionQuery);
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.(motionQuery).matches);
}

interface VisualEffectsState {
  reduceMotion: boolean;
}

const VisualEffectsContext = createContext<VisualEffectsState>({
  reduceMotion: false,
});

/**
 * Bridges the OS `prefers-reduced-motion` setting into the motion library.
 * The full-motion experience stays the default; animations only collapse
 * to instant state changes when the visitor explicitly asks for it.
 */
export function VisualEffectsProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, () => false);

  return (
    <VisualEffectsContext.Provider value={{ reduceMotion }}>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>{children}</MotionConfig>
    </VisualEffectsContext.Provider>
  );
}

export function useVisualEffects() {
  return useContext(VisualEffectsContext);
}
