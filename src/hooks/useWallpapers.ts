import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Wallpaper } from "../types";
import { bundledDesktop, bundledMobile } from "../data/featuredWallpapers";
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

// The bundled collection contains the owner's artwork, not stock placeholders.
const fallbackDesktop = bundledDesktop;
const fallbackMobile = bundledMobile;

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
  originalsSet?: Set<string>,
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

  // Only assign original URL if the file actually exists in the originals folder
  const hasOriginal = originalsSet ? originalsSet.has(file.name) : false;
  const originalPublicUrl = hasOriginal && supabase
    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(originalPath).data.publicUrl
    : previewPublicUrl;

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
    originalUrl: originalPublicUrl || previewPublicUrl,
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
let cachedIsFallback = false;
let cachedError: string | null = null;

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
    cachedIsFallback = false;
    cachedError = null;
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
          setIsUsingFallback(cachedIsFallback);
          setError(cachedError);
          setLoading(false);
        }
        return;
      }

      // If Supabase is not configured, use fallback immediately
      if (!supabase) {
        console.warn("Supabase client is null - using fallback data");
        if (!cancelled) {
          cachedIsFallback = true;
          cachedError = "The full collection is unavailable.";
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

            // Check which desktop originals actually exist in storage
            const { data: desktopOriginals } = await supabase.storage
              .from(BUCKET_NAME)
              .list(DESKTOP_ORIGINALS_FOLDER, { limit: 1000 });
            const desktopOriginalsSet = new Set(
              (desktopOriginals || [])
                .filter((f) => (f.metadata?.size ?? 0) > 0 && !f.name.startsWith("."))
                .map((f) => f.name),
            );

            // Fetch mobile wallpapers from previews folder
            const { data: mobileFiles, error: mobileError } =
              await supabase.storage
                .from(BUCKET_NAME)
                .list(MOBILE_PREVIEWS_FOLDER, {
                  limit: 1000,
                  sortBy: { column: "created_at", order: "desc" },
                });

            if (mobileError) throw mobileError;

            // Check which mobile originals actually exist in storage
            const { data: mobileOriginals } = await supabase.storage
              .from(BUCKET_NAME)
              .list(MOBILE_ORIGINALS_FOLDER, { limit: 1000 });
            const mobileOriginalsSet = new Set(
              (mobileOriginals || [])
                .filter((f) => (f.metadata?.size ?? 0) > 0 && !f.name.startsWith("."))
                .map((f) => f.name),
            );

            const desktopResult = (desktopFiles || [])
              .filter(
                (file: StorageFile) =>
                  file.metadata?.size > 0 && !file.name.startsWith("."),
              )
              .map((file: StorageFile, index: number) =>
                mapFileToWallpaper(file, "desktop", index, desktopOriginalsSet),
              );

            const mobileResult = (mobileFiles || [])
              .filter(
                (file: StorageFile) =>
                  file.metadata?.size > 0 && !file.name.startsWith("."),
              )
              .map((file: StorageFile, index: number) =>
                mapFileToWallpaper(file, "mobile", index, mobileOriginalsSet),
              );

            cachedIsFallback = false;
            cachedError = null;
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
          cachedDesktopWallpapers = fallbackDesktop;
          cachedMobileWallpapers = fallbackMobile;
          cachedIsFallback = true;
          cachedError = "The full collection is unavailable.";
          setDesktopWallpapers(fallbackDesktop);
          setMobileWallpapers(fallbackMobile);
          setLoading(false);
          setIsUsingFallback(true);
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
