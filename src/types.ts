export interface Wallpaper {
  id: string;
  title: string;
  serial: string;
  category: string;
  format: string;
  downloads: number;
  previewUrl: string;
  tinyUrl: string;
  originalUrl: string;
  device: "desktop" | "mobile";
  createdAt?: string;
}
