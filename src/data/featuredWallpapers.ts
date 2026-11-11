import type { Wallpaper } from "../types";

// Aditya's existing Voidwallz artwork, bundled so previews/downloads still work
// when the remote collection cannot be reached. The PNGs retain their native sizes.
const bundledWallpapers: Wallpaper[] = [
  { id: "bundled-desktop-obsidian-dunes", title: "Obsidian Dunes", category: "Dark / Landscape", device: "desktop", serial: "VW / 001", format: "1672 × 941 PNG", downloads: 0, likes: 0, previewUrl: "/wallpapers/previews/obsidian-dunes.jpg", tinyUrl: "/wallpapers/tiny/obsidian-dunes.jpg", originalUrl: "/wallpapers/originals/obsidian-dunes.png", createdAt: "2026-11-11T12:57:00Z" },
  { id: "bundled-mobile-hillside-crt", title: "Hillside CRT Daydream", category: "Illustration / Landscape", device: "mobile", serial: "VW / 002", format: "941 × 1672 PNG", downloads: 0, likes: 0, previewUrl: "/wallpapers/previews/hillside-crt.jpg", tinyUrl: "/wallpapers/tiny/hillside-crt.jpg", originalUrl: "/wallpapers/originals/hillside-crt.png", createdAt: "2026-11-11T13:04:00Z" },
  { id: "bundled-mobile-cobalt-ribbon", title: "Cobalt Ribbon", category: "Architecture / Abstract", device: "mobile", serial: "VW / 003", format: "941 × 1672 PNG", downloads: 0, likes: 0, previewUrl: "/wallpapers/previews/cobalt-ribbon.jpg", tinyUrl: "/wallpapers/tiny/cobalt-ribbon.jpg", originalUrl: "/wallpapers/originals/cobalt-ribbon.png", createdAt: "2026-11-11T12:57:00Z" },
];
export const bundledDesktop = bundledWallpapers.filter((wallpaper) => wallpaper.device === "desktop");
export const bundledMobile = bundledWallpapers.filter((wallpaper) => wallpaper.device === "mobile");
