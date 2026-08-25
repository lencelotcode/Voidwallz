import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Wallpaper } from "../types";
import { getBaseDownloads, getBaseLikes } from "./useWallpaperStats";

export const BUCKET_NAME = "wallpapers";
export const DESKTOP_PREVIEWS_FOLDER = "desktop/previews";
export const DESKTOP_ORIGINALS_FOLDER = "desktop/originals";
export const MOBILE_PREVIEWS_FOLDER = "mobile/previews";
export const MOBILE_ORIGINALS_FOLDER = "mobile/originals";

interface StorageFile {
  name: string;
  id: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  created_at: string;
  updated_at: string;
}

interface UseWallpapersResult {
  desktopWallpapers: Wallpaper[];
  mobileWallpapers: Wallpaper[];
  loading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  reload: () => void;
}

// Fallback static data when Supabase is unavailable
const fallbackDesktop: Wallpaper[] = [
  {
    id: "desktop-vortex-1",
    title: "Vortex I",
    serial: "ID: V-082",
    category: "Minimal / Abstract",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=95&w=2880",
    tinyUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=20&w=50&h=50",
    originalUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=100&w=3840",
    device: "desktop",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "desktop-angular-drift",
    title: "Angular Drift",
    serial: "ID: V-104",
    category: "Dark / Geometry",
    format: "8K WEBP",
    previewUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=2880",
    tinyUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=20&w=50&h=50",
    originalUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=100&w=3840",
    device: "desktop",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "desktop-nested-void",
    title: "Nested Void",
    serial: "ID: V-211",
    category: "Monochrome / Render",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=95&w=2880",
    tinyUrl:
      "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=20&w=50&h=50",
    originalUrl:
      "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=100&w=3840",
    device: "desktop",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "desktop-chrome-aesthetic",
    title: "Chrome Aesthetic",
    serial: "ID: V-310",
    category: "3D / Silver",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=95&w=2880",
    tinyUrl:
      "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=20&w=50&h=50",
    originalUrl:
      "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=100&w=3840",
    device: "desktop",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
];

const fallbackMobile: Wallpaper[] = [
  {
    id: "mobile-singularity",
    title: "Singularity",
    serial: "ID: V-001",
    category: "Dark / Space",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=95&w=1440&h=2560",
    tinyUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=20&w=50&h=89",
    originalUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=100&w=2160&h=3840",
    device: "mobile",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mobile-obsidian-wave",
    title: "Obsidian Wave",
    serial: "ID: V-999",
    category: "Liquid / Fluid",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=1440&h=2560",
    tinyUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=20&w=50&h=89",
    originalUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=100&w=2160&h=3840",
    device: "mobile",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mobile-grain-matrix",
    title: "Grain Matrix",
    serial: "ID: V-402",
    category: "Texture / Film",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=95&w=1440&h=2560",
    tinyUrl:
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=20&w=50&h=89",
    originalUrl:
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=100&w=2160&h=3840",
    device: "mobile",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mobile-void-aura",
    title: "Void Aura",
    serial: "ID: V-505",
    category: "Gradient / Minimal",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=95&w=1440&h=2560",
    tinyUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=20&w=50&h=89",
    originalUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=100&w=2160&h=3840",
    device: "mobile",
    downloads: 0,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Extract title and format from filename
 * Uses the full filename (without extension) as the title
 */
function parseFilename(filename: string): {
  title: string;
  category: string;
  format: string;
} {
  // Use full filename without extension as title
  const title = filename.replace(/\.[^/.]+$/, "") || filename;

  // Detect format from extension
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const formatMap: Record<string, string> = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    webp: "WEBP",
    avif: "AVIF",
    gif: "GIF",
  };
  const format = formatMap[ext] || ext.toUpperCase();

  return { title, category: "Wallpaper", format };
}

/**
 * Generate a serial ID from filename and index
 */
function generateSerial(name: string, index: number): string {
  const hash = name.split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  const code = Math.abs(hash % 900) + 100;
  return `ID: V-${code}`;
}

/**
 * Map a storage file to Wallpaper interface
 */
function mapFileToWallpaper(
  file: StorageFile,
  folder: "desktop" | "mobile",
  index: number,
): Wallpaper {
  const { title, category, format } = parseFilename(file.name);

  // Base name without extension
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  const previewPath =
    folder === "desktop"
      ? `${DESKTOP_PREVIEWS_FOLDER}/${file.name}`
      : `${MOBILE_PREVIEWS_FOLDER}/${file.name}`;

  const originalPath =
    folder === "desktop"
      ? `${DESKTOP_ORIGINALS_FOLDER}/${file.name}`
      : `${MOBILE_ORIGINALS_FOLDER}/${file.name}`;

  // Direct CDN object public URL - fast, reliable, cached, works on all Supabase tiers
  const previewPublicUrl = supabase
    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(previewPath).data.publicUrl
    : "";

  // Determine if it's mobile format
  const displayFormat = folder === "mobile" ? `${format} MOBILE` : format;
  const id = `${folder}-${baseName}`;

  // Deterministic realistic baseline metrics
  const downloads = getBaseDownloads(id, folder);
  const likes = getBaseLikes(id);

  return {
    id,
    title,
    serial: generateSerial(file.name, index),
    category,
    format: displayFormat,
    downloads,
    likes,
    previewUrl: previewPublicUrl,
    tinyUrl: previewPublicUrl,
    originalUrl: previewPublicUrl,
    fallbackUrl: previewPublicUrl,
    device: folder,
    createdAt: file.created_at,
  };
}

// Module-level cache to prevent redundant fetches
let cachedDesktopWallpapers: Wallpaper[] | null = null;
let cachedMobileWallpapers: Wallpaper[] | null = null;
let fetchPromise: Promise<void> | null = null;

/**
 * Custom hook to fetch wallpapers from Supabase storage
 */
export function useWallpapers(): UseWallpapersResult {
  const [desktopWallpapers, setDesktopWallpapers] = useState<Wallpaper[]>(
    cachedDesktopWallpapers || [],
  );
  const [mobileWallpapers, setMobileWallpapers] = useState<Wallpaper[]>(
    cachedMobileWallpapers || [],
  );
  const [loading, setLoading] = useState(
    !cachedDesktopWallpapers && !cachedMobileWallpapers,
  );
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const reload = () => {
    cachedDesktopWallpapers = null;
    cachedMobileWallpapers = null;
    fetchPromise = null;
    setRefreshIndex((v) => v + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchWallpapers() {
      // If we already have cached data, don't fetch again
      if (cachedDesktopWallpapers && cachedMobileWallpapers) {
        if (!cancelled) {
          setDesktopWallpapers(cachedDesktopWallpapers);
          setMobileWallpapers(cachedMobileWallpapers);
          setLoading(false);
        }
        return;
      }

      // If Supabase is not configured, use fallback immediately
      if (!supabase) {
        console.warn("Supabase client is null - using fallback data");
        if (!cancelled) {
          cachedDesktopWallpapers = fallbackDesktop;
          cachedMobileWallpapers = fallbackMobile;
          setDesktopWallpapers(fallbackDesktop);
          setMobileWallpapers(fallbackMobile);
          setLoading(false);
          setIsUsingFallback(true);
          setError("Supabase not configured. Using fallback data.");
        }
        return;
      }

      console.log("Supabase client is configured. Fetching wallpapers...");

      try {
        if (!cancelled) setLoading(true);
        setError(null);

        // Deduplicate concurrent requests
        if (!fetchPromise) {
          fetchPromise = (async () => {
            // Fetch desktop wallpapers from previews folder
            const { data: desktopFiles, error: desktopError } =
              await supabase.storage
                .from(BUCKET_NAME)
                .list(DESKTOP_PREVIEWS_FOLDER, {
                  limit: 1000,
                  sortBy: { column: "created_at", order: "desc" },
                });

            if (desktopError) throw desktopError;

            // Fetch mobile wallpapers from previews folder
            const { data: mobileFiles, error: mobileError } =
              await supabase.storage
                .from(BUCKET_NAME)
                .list(MOBILE_PREVIEWS_FOLDER, {
                  limit: 1000,
                  sortBy: { column: "created_at", order: "desc" },
                });

            if (mobileError) throw mobileError;

            const desktopResult = (desktopFiles || [])
              .filter(
                (file: StorageFile) =>
                  file.metadata?.size > 0 && !file.name.startsWith("."),
              )
              .map((file: StorageFile, index: number) =>
                mapFileToWallpaper(file, "desktop", index),
              );

            const mobileResult = (mobileFiles || [])
              .filter(
                (file: StorageFile) =>
                  file.metadata?.size > 0 && !file.name.startsWith("."),
              )
              .map((file: StorageFile, index: number) =>
                mapFileToWallpaper(file, "mobile", index),
              );

            cachedDesktopWallpapers = desktopResult;
            cachedMobileWallpapers = mobileResult;
          })();
        }

        await fetchPromise;

        if (!cancelled) {
          // If no files found in storage, show empty state (don't use fallback)
          if (
            cachedDesktopWallpapers?.length === 0 &&
            cachedMobileWallpapers?.length === 0
          ) {
            setDesktopWallpapers([]);
            setMobileWallpapers([]);
            setIsUsingFallback(false);
            setError(
              "No wallpapers found. Upload some images to your storage bucket.",
            );
          } else {
            setDesktopWallpapers(cachedDesktopWallpapers || []);
            setMobileWallpapers(cachedMobileWallpapers || []);
            setIsUsingFallback(false);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching wallpapers from Supabase:", err);
        fetchPromise = null;
        if (!cancelled) {
          setDesktopWallpapers([]);
          setMobileWallpapers([]);
          setLoading(false);
          setIsUsingFallback(false);
          setError(
            err instanceof Error ? err.message : "Failed to fetch wallpapers",
          );
        }
      }
    }

    fetchWallpapers();

    return () => {
      cancelled = true;
    };
  }, [refreshIndex]);

  return {
    desktopWallpapers,
    mobileWallpapers,
    loading,
    error,
    isUsingFallback,
    reload,
  };
}

/**
 * Hook to get a single wallpaper by ID
 */
export function useWallpaper(id: string): Wallpaper | null {
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const allWallpapers = [...desktopWallpapers, ...mobileWallpapers];
  return allWallpapers.find((wp) => wp.id === id) || null;
}
