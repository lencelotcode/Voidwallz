export interface DownloadActivity {
  id: number;
  title: string;
  preview?: string;
  kind: "image" | "pack";
  phase: "preparing" | "packing" | "ready" | "error";
  prepared: number;
  total?: number;
}
let activity: DownloadActivity | null = null;
let serial = 0;
let dismissTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const publish = () => listeners.forEach(listener => listener());
export const getDownloadActivity = () => activity;
export function subscribeDownloads(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function beginDownload(title: string, preview?: string, kind: "image" | "pack" = "image", total?: number) {
  clearTimeout(dismissTimer);
  activity = { id: ++serial, title, preview, kind, phase: "preparing", prepared: 0, total };
  publish(); return activity.id;
}
export function updateDownload(id: number, update: Partial<Pick<DownloadActivity, "phase" | "prepared">>) {
  if (activity?.id !== id) return;
  activity = { ...activity, ...update }; publish();
}
export function finishDownload(id: number, success: boolean) {
  if (activity?.id !== id) return;
  updateDownload(id, { phase: success ? "ready" : "error" });
  dismissTimer = setTimeout(() => { if (activity?.id === id) { activity = null; publish(); } }, success ? 5500 : 8500);
}
