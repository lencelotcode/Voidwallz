import { sound } from "./soundEffects";

export interface RadarPulseDetail {
  x: number;
  y: number;
  color?: string;
}

export function triggerRadarPulse(
  x: number,
  y: number,
  color: "white" | "emerald" | "crimson" | "cyan" = "white"
) {
  if (typeof window === "undefined") return;
  sound.playRadarPing();
  window.dispatchEvent(
    new CustomEvent<RadarPulseDetail>("voidwallz-radar-pulse", {
      detail: { x, y, color },
    })
  );
}
