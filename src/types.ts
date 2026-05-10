export interface Wallpaper {
  id: number;
  title: string;
  serial: string;
  category: string;
  format: string;
  downloads: number;
  previewUrl: string;
  originalUrl: string;
  device: "desktop" | "mobile";
  createdAt?: string;
}
