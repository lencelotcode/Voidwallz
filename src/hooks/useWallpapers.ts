import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Wallpaper } from "../types";

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
    id: 1,
    title: "Vortex I",
    serial: "ID: V-082",
    category: "Minimal / Abstract",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=1600&h=900",
    originalUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=1600&h=900",
    device: "desktop",
  },
  {
    id: 2,
    title: "Angular Drift",
    serial: "ID: V-104",
    category: "Dark / Geometry",
    format: "8K WEBP",
    previewUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600&h=900",
    originalUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600&h=900",
    device: "desktop",
  },
  {
    id: 3,
    title: "Nested Void",
    serial: "ID: V-211",
    category: "Monochrome / Render",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=80&w=1600&h=900",
    originalUrl:
      "https://images.unsplash.com/photo-1518818419601-72c8673f5852?auto=format&fit=crop&q=80&w=1600&h=900",
    device: "desktop",
  },
  {
    id: 4,
    title: "Chrome Aesthetic",
    serial: "ID: V-310",
    category: "3D / Silver",
    format: "8K AVIF",
    previewUrl:
      "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=80&w=1600&h=900",
    originalUrl:
      "https://images.unsplash.com/photo-1634055627253-15df1f63fcb3?auto=format&fit=crop&q=80&w=1600&h=900",
    device: "desktop",
  },
];

const fallbackMobile: Wallpaper[] = [
  {
    id: 5,
    title: "Singularity",
    serial: "ID: V-001",
    category: "Dark / Space",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=600&h=1200",
    originalUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=600&h=1200",
    device: "mobile",
  },
  {
    id: 6,
    title: "Obsidian Wave",
    serial: "ID: V-999",
    category: "Liquid / Fluid",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=1200",
    originalUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=1200",
    device: "mobile",
  },
  {
    id: 7,
    title: "Grain Matrix",
    serial: "ID: V-402",
    category: "Texture / Film",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=80&w=600&h=1200",
    originalUrl:
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=80&w=600&h=1200",
    device: "mobile",
  },
  {
    id: 8,
    title: "Void Aura",
    serial: "ID: V-505",
    category: "Gradient / Minimal",
    format: "4K MOBILE",
    previewUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=600&h=1200",
    originalUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=600&h=1200",
    device: "mobile",
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

  // Determine preview and original paths
  const previewPath =
    folder === "desktop"
      ? `${DESKTOP_PREVIEWS_FOLDER}/${file.name}`
      : `${MOBILE_PREVIEWS_FOLDER}/${file.name}`;

  const originalPath =
    folder === "desktop"
      ? `${DESKTOP_ORIGINALS_FOLDER}/${file.name}`
      : `${MOBILE_ORIGINALS_FOLDER}/${file.name}`;

  const previewUrl = supabase
    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(previewPath).data
        .publicUrl
    : "";

  const originalUrl = supabase
    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(originalPath).data
        .publicUrl
    : "";

  // Determine if it's mobile format
  const displayFormat = folder === "mobile" ? `${format} MOBILE` : format;

  // Generate downloads based on file size (simulate popularity)
  const baseDownloads = folder === "mobile" ? 15000 : 8000;
  const downloads =
    Math.floor((file.metadata.size / 50000) * baseDownloads) +
    Math.floor(Math.random() * 5000);

  return {
    id: index + 1,
    title,
    serial: generateSerial(file.name, index),
    category,
    format: displayFormat,
    downloads,
    previewUrl,
    originalUrl,
    device: folder,
  };
}

/**
 * Custom hook to fetch wallpapers from Supabase storage
 */
export function useWallpapers(): UseWallpapersResult {
  const [desktopWallpapers, setDesktopWallpapers] = useState<Wallpaper[]>([]);
  const [mobileWallpapers, setMobileWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const reload = () => setRefreshIndex((v) => v + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchWallpapers() {
      // If Supabase is not configured, use fallback immediately
      if (!supabase) {
        console.warn("Supabase client is null - using fallback data");
        if (!cancelled) {
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
        setLoading(true);
        setError(null);

        // Fetch desktop wallpapers from previews folder
        console.log(
          "Fetching desktop wallpapers from:",
          DESKTOP_PREVIEWS_FOLDER,
        );
        console.log("Bucket:", BUCKET_NAME);
        const { data: desktopFiles, error: desktopError } =
          await supabase.storage
            .from(BUCKET_NAME)
            .list(DESKTOP_PREVIEWS_FOLDER, {
              limit: 100,
              sortBy: { column: "name", order: "asc" },
            });

        console.log("Desktop API response:", {
          data: desktopFiles,
          error: desktopError,
        });

        if (desktopError) {
          console.error("Desktop wallpapers error:", desktopError);
          throw desktopError;
        }

        console.log("Desktop files found:", desktopFiles?.length || 0);
        if (desktopFiles) {
          console.log("Desktop files data:", desktopFiles);
        }

        // Fetch mobile wallpapers from previews folder
        console.log("Fetching mobile wallpapers from:", MOBILE_PREVIEWS_FOLDER);
        console.log("Bucket:", BUCKET_NAME);
        const { data: mobileFiles, error: mobileError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(MOBILE_PREVIEWS_FOLDER, {
            limit: 100,
            sortBy: { column: "name", order: "asc" },
          });

        console.log("Mobile API response:", {
          data: mobileFiles,
          error: mobileError,
        });

        if (mobileError) {
          console.error("Mobile wallpapers error:", mobileError);
          throw mobileError;
        }

        console.log("Mobile files found:", mobileFiles?.length || 0);
        if (mobileFiles) {
          console.log("Mobile files data:", mobileFiles);
        }

        if (!cancelled) {
          // Map files to Wallpaper objects, filtering out any folders or invalid files
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

          // If no files found in storage, show empty state (don't use fallback)
          if (desktopResult.length === 0 && mobileResult.length === 0) {
            setDesktopWallpapers([]);
            setMobileWallpapers([]);
            setIsUsingFallback(false);
            setError(
              "No wallpapers found. Upload some images to your storage bucket.",
            );
          } else {
            setDesktopWallpapers(desktopResult);
            setMobileWallpapers(mobileResult);
            setIsUsingFallback(false);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching wallpapers from Supabase:", err);
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
export function useWallpaper(id: number): Wallpaper | null {
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const allWallpapers = [...desktopWallpapers, ...mobileWallpapers];
  return allWallpapers.find((wp) => wp.id === id) || null;
}
