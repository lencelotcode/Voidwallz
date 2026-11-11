import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
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

const pauseKey = "voidwallz_motion_paused";
function getMotionPaused() { return typeof window !== "undefined" && localStorage.getItem(pauseKey) === "true"; }
function subscribeToPause(listener: () => void) {
  window.addEventListener("voidwallz-motion-changed", listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener("voidwallz-motion-changed", listener); window.removeEventListener("storage", listener); };
}
function toggleMotion() {
  localStorage.setItem(pauseKey, String(!getMotionPaused()));
  window.dispatchEvent(new Event("voidwallz-motion-changed"));
}
interface VisualEffectsState { reduceMotion: boolean; motionPaused: boolean; toggleMotion: () => void; }

const VisualEffectsContext = createContext<VisualEffectsState>({
  reduceMotion: false, motionPaused: false, toggleMotion: () => {},
});

/**
 * Bridges the OS `prefers-reduced-motion` setting into the motion library.
 * The full-motion experience stays the default; animations only collapse
 * to instant state changes when the visitor explicitly asks for it.
 */
export function VisualEffectsProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, () => false);

  const motionPaused = useSyncExternalStore(subscribeToPause, getMotionPaused, () => false);
  useEffect(() => {
    document.documentElement.dataset.motionState = reduceMotion || motionPaused ? "paused" : "running";
    document.documentElement.dataset.motion = reduceMotion || motionPaused ? "off" : "on";
  }, [reduceMotion, motionPaused]);
  return (
    <VisualEffectsContext.Provider value={{ reduceMotion, motionPaused, toggleMotion }}>
      <MotionConfig reducedMotion={reduceMotion || motionPaused ? "always" : "user"}>{children}</MotionConfig>
    </VisualEffectsContext.Provider>
  );
}

export function useVisualEffects() {
  return useContext(VisualEffectsContext);
}
