import { useSyncExternalStore } from "react";

// A single source for background inertness. A loader ending must not unlock a
// live dialog; a dialog closing must not restore a stale loader lock.
let count = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
export function registerDialog() {
  count += 1; notify();
  let released = false;
  return () => { if (!released) { released = true; count = Math.max(0, count - 1); notify(); } };
}
export function useDialogCount() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => count, () => 0);
}
