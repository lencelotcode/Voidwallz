export interface Wallpaper {
  id: string;
  title: string;
  serial: string;
  category: string;
  format: string;
  downloads: number;
  likes?: number;
  previewUrl: string;
  tinyUrl: string;
  originalUrl: string;
  fallbackUrl?: string;
  device: "desktop" | "mobile";
  createdAt?: string;
}

export interface VoidPack {
  id: string;
  title: string;
  serial: string;
  tagline: string;
  category: string;
  device: "desktop" | "mobile";
  format: string;
  downloads: number;
  createdAt: string;
  featuredImage: string;
  items: Wallpaper[];
}

export type UserPlan = "free" | "pro_trial" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  plan?: UserPlan;
  trialStartedAt?: string;
  trialExpiresAt?: string;
  createdAt: string;
  isGuest?: boolean;
}
