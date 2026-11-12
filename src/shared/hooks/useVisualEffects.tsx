import { preferencesStore, toggleMotion } from '../state/preferencesStore';
import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { MotionConfig } from 'motion/react';

const motionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia?.(motionQuery);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}

function getReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(motionQuery).matches);
}

interface VisualEffectsState {
  reduceMotion: boolean;
  motionPaused: boolean;
  toggleMotion: () => void;
}

const VisualEffectsContext = createContext<VisualEffectsState>({
  reduceMotion: false,
  motionPaused: false,
  toggleMotion: () => {},
});

/**
 * Bridges the OS `prefers-reduced-motion` setting into the motion library.
 * The full-motion experience stays the default; animations only collapse
 * to instant state changes when the visitor explicitly asks for it.
 */
export function VisualEffectsProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, () => false);

  const { motionPaused } = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getSnapshot,
  );
  useEffect(() => {
    document.documentElement.dataset.motionState =
      reduceMotion || motionPaused ? 'paused' : 'running';
    document.documentElement.dataset.motion = reduceMotion || motionPaused ? 'off' : 'on';
  }, [reduceMotion, motionPaused]);
  return (
    <VisualEffectsContext.Provider value={{ reduceMotion, motionPaused, toggleMotion }}>
      <MotionConfig reducedMotion={reduceMotion || motionPaused ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </VisualEffectsContext.Provider>
  );
}

export function useVisualEffects() {
  return useContext(VisualEffectsContext);
}
