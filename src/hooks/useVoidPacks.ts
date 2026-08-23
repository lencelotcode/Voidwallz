import { useState, useEffect, useMemo } from "react";
import { VoidPack } from "../types";
import { supabase } from "../lib/supabase";

export const PACKS_BUCKET_NAME = "wallpapers";
export const DESKTOP_PACKS_FOLDER = "packs/desktop";
export const MOBILE_PACKS_FOLDER = "packs/mobile";

export const VOID_PACKS_DATA: VoidPack[] = [];

const CACHE_STORAGE_KEY = "voidwallz_cached_packs_v3";

function getStoredPacks(): VoidPack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading pack cache:", e);
  }
  return [];
}

function setStoredPacks(packs: VoidPack[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(packs));
  } catch (e) {
    console.warn("Error saving pack cache:", e);
  }
}

function arePacksEqual(a: VoidPack[], b: VoidPack[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].items?.length !== b[i].items?.length) {
      return false;
    }
  }
  return true;
}

// Module-level in-memory cache initialized synchronously from localStorage
let cachedPacks: VoidPack[] = typeof window !== "undefined" ? getStoredPacks() : [];
let isFetchingPacks = false;
const listeners: Array<(packs: VoidPack[]) => void> = [];

function broadcastPacks(newPacks: VoidPack[]) {
  if (arePacksEqual(cachedPacks, newPacks)) {
    // Zero changes, skip re-renders to prevent any visual glitch
    return;
  }
  cachedPacks = newPacks;
  setStoredPacks(newPacks);
  listeners.forEach((fn) => fn(newPacks));
}

export function useVoidPacks() {
  const [packs, setPacks] = useState<VoidPack[]>(cachedPacks);
  const [loading, setLoading] = useState<boolean>(cachedPacks.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cache updated in another listener, sync state immediately
    if (packs !== cachedPacks) {
      setPacks(cachedPacks);
      setLoading(false);
    }

    const listener = (newPacks: VoidPack[]) => {
      setPacks(newPacks);
      setLoading(false);
    };
    listeners.push(listener);

    async function fetchPacksFromSupabase() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      if (isFetchingPacks) return;
      isFetchingPacks = true;

      try {
        // 1. Check if there is a 'void_packs' table in Supabase database
        const { data: dbPacks, error: dbError } = await supabase
          .from("void_packs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!dbError && dbPacks && dbPacks.length > 0) {
          const mapped: VoidPack[] = dbPacks.map((row: any) => ({
            id: row.id,
            title: row.title,
            serial: row.serial,
            tagline: row.tagline || "",
            category: row.category || "General",
            device: row.device,
            format: row.format || (row.device === "desktop" ? "8K MASTER SUITE" : "4K RETINA DECK"),
            downloads: row.downloads || 15000,
            createdAt: row.created_at,
            featuredImage: row.featured_image || row.items?.[0]?.previewUrl,
            items: row.items || [],
          }));
          broadcastPacks(mapped);
          return;
        }

        // 2. Smart Storage Loader (Supports direct files & subfolders)
        const storagePacks: VoidPack[] = [];

        // Process Desktop Packs from storage
        const { data: desktopEntries } = await supabase.storage
          .from(PACKS_BUCKET_NAME)
          .list(DESKTOP_PACKS_FOLDER);

        if (desktopEntries && desktopEntries.length > 0) {
          const subfolders = desktopEntries.filter((e) => !e.name.includes("."));
          const directFiles = desktopEntries.filter((e) => e.name.includes(".") && !e.name.startsWith("."));

          // Handle subfolders
          for (const folder of subfolders) {
            const { data: files } = await supabase.storage
              .from(PACKS_BUCKET_NAME)
              .list(`${DESKTOP_PACKS_FOLDER}/${folder.name}`);

            if (files && files.length > 0) {
              const items = files
                .filter((f) => !f.name.startsWith("."))
                .map((f, i) => {
                  const path = `${DESKTOP_PACKS_FOLDER}/${folder.name}/${f.name}`;
                  const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                  const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                  return {
                    id: `${folder.name}-${f.name}`,
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    serial: `ID: VP-D${i + 1}`,
                    category: "Desktop Suite",
                    format: "8K AVIF",
                    downloads: 14000 + i * 1200,
                    previewUrl: pubUrl,
                    tinyUrl: pubUrl,
                    originalUrl: pubUrl,
                    device: "desktop" as const,
                  };
                });

              const packTitle = folder.name.replace(/[-_]/g, " ").toUpperCase();
              storagePacks.push({
                id: `pack-desktop-${folder.name}`,
                title: packTitle,
                serial: `PACK: VP-D${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece desktop wallpaper suite.`,
                category: "Desktop Suite",
                device: "desktop",
                format: "8K MASTER SUITE",
                downloads: 48000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }

          // Handle direct files with common prefix
          if (directFiles.length > 0) {
            const groups: Record<string, typeof directFiles> = {};
            for (const f of directFiles) {
              const match = f.name.match(/^([a-zA-Z0-9\s_-]+?)(?:[-_ ]+(?:0?[1-9]|10)|\.[^/.]+$)/);
              const prefix = match ? match[1].replace(/[-_]/g, " ").trim() : "Master";
              if (!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(f);
            }

            for (const [groupName, groupFiles] of Object.entries(groups)) {
              const items = groupFiles.map((f, i) => {
                const path = `${DESKTOP_PACKS_FOLDER}/${f.name}`;
                const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                return {
                  id: `direct-d-${f.name}`,
                  title: title.charAt(0).toUpperCase() + title.slice(1),
                  serial: `ID: VP-D${i + 1}`,
                  category: "Desktop Suite",
                  format: "8K AVIF",
                  downloads: 16000 + i * 1100,
                  previewUrl: pubUrl,
                  tinyUrl: pubUrl,
                  originalUrl: pubUrl,
                  device: "desktop" as const,
                };
              });

              storagePacks.push({
                id: `pack-direct-desktop-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
                title: groupName.toUpperCase(),
                serial: `PACK: VP-D${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece desktop wallpaper suite.`,
                category: "Desktop Suite",
                device: "desktop",
                format: "8K MASTER SUITE",
                downloads: 52000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }
        }

        // Process Mobile Packs from storage
        const { data: mobileEntries } = await supabase.storage
          .from(PACKS_BUCKET_NAME)
          .list(MOBILE_PACKS_FOLDER);

        if (mobileEntries && mobileEntries.length > 0) {
          const subfolders = mobileEntries.filter((e) => !e.name.includes("."));
          const directFiles = mobileEntries.filter((e) => e.name.includes(".") && !e.name.startsWith("."));

          for (const folder of subfolders) {
            const { data: files } = await supabase.storage
              .from(PACKS_BUCKET_NAME)
              .list(`${MOBILE_PACKS_FOLDER}/${folder.name}`);

            if (files && files.length > 0) {
              const items = files
                .filter((f) => !f.name.startsWith("."))
                .map((f, i) => {
                  const path = `${MOBILE_PACKS_FOLDER}/${folder.name}/${f.name}`;
                  const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                  const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                  return {
                    id: `${folder.name}-${f.name}`,
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    serial: `ID: VP-M${i + 1}`,
                    category: "Phone Deck",
                    format: "4K MOBILE",
                    downloads: 21000 + i * 1800,
                    previewUrl: pubUrl,
                    tinyUrl: pubUrl,
                    originalUrl: pubUrl,
                    device: "mobile" as const,
                  };
                });

              const packTitle = folder.name.replace(/[-_]/g, " ").toUpperCase();
              storagePacks.push({
                id: `pack-mobile-${folder.name}`,
                title: packTitle,
                serial: `PACK: VP-M${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece mobile retina deck.`,
                category: "Phone Deck",
                device: "mobile",
                format: "4K RETINA DECK",
                downloads: 64000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }

          if (directFiles.length > 0) {
            const groups: Record<string, typeof directFiles> = {};
            for (const f of directFiles) {
              const match = f.name.match(/^([a-zA-Z0-9\s_-]+?)(?:[-_ ]+(?:0?[1-9]|10)|\.[^/.]+$)/);
              const prefix = match ? match[1].replace(/[-_]/g, " ").trim() : "Master";
              if (!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(f);
            }

            for (const [groupName, groupFiles] of Object.entries(groups)) {
              const items = groupFiles.map((f, i) => {
                const path = `${MOBILE_PACKS_FOLDER}/${f.name}`;
                const pubUrl = supabase!.storage.from(PACKS_BUCKET_NAME).getPublicUrl(path).data.publicUrl;
                const title = f.name.replace(/^\d+[-_]?/, "").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                return {
                  id: `direct-m-${f.name}`,
                  title: title.charAt(0).toUpperCase() + title.slice(1),
                  serial: `ID: VP-M${i + 1}`,
                  category: "Phone Deck",
                  format: "4K MOBILE",
                  downloads: 24000 + i * 1600,
                  previewUrl: pubUrl,
                  tinyUrl: pubUrl,
                  originalUrl: pubUrl,
                  device: "mobile" as const,
                };
              });

              storagePacks.push({
                id: `pack-direct-mobile-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
                title: groupName.toUpperCase(),
                serial: `PACK: VP-M${storagePacks.length + 1}`,
                tagline: `Curated ${items.length}-piece mobile retina deck.`,
                category: "Phone Deck",
                device: "mobile",
                format: "4K RETINA DECK",
                downloads: 72000,
                createdAt: new Date().toISOString(),
                featuredImage: items[0]?.previewUrl || "",
                items,
              });
            }
          }
        }

        broadcastPacks(storagePacks);
      } catch (err: any) {
        console.warn("Supabase void pack fetch error:", err);
        setError(err.message);
      } finally {
        isFetchingPacks = false;
        setLoading(false);
      }
    }

    fetchPacksFromSupabase();

    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  const desktopPacks = useMemo(() => packs.filter((p) => p.device === "desktop"), [packs]);
  const mobilePacks = useMemo(() => packs.filter((p) => p.device === "mobile"), [packs]);

  return {
    allPacks: packs,
    desktopPacks,
    mobilePacks,
    loading,
    error,
  };
}
