import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import { renderSitemap, type Catalog, type CatalogItem, type Device } from "./sitemap";

const root = fileURLToPath(new URL("../", import.meta.url));
const snapshotPath = new URL("./sitemap-catalog.json", import.meta.url);
const env = { ...loadEnv("production", root, "VITE_"), ...process.env };
const snapshot: { source: string; catalog: Catalog } = JSON.parse(await readFile(snapshotPath, "utf8"));
if (!snapshot.catalog || !["desktop", "mobile"].every(device =>
  Array.isArray(snapshot.catalog[device]) && snapshot.catalog[device].every(item => typeof item.title === "string")
)) throw new Error("The saved sitemap catalogue is invalid.");
const catalog: Catalog = structuredClone(snapshot.catalog);
let refreshed = 0;

if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY && process.env.SITEMAP_OFFLINE !== "1") {
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }) },
  });
  async function listGallery(device: Device): Promise<CatalogItem[]> {
    const items: CatalogItem[] = [];
    // Match the actual gallery: public files in wallpapers/{device}/previews.
    // Pagination prevents a larger catalogue from being silently truncated.
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await client.storage.from("wallpapers").list(`${device}/previews`, {
        limit: 1000, offset, sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new Error("Catalogue unavailable");
      for (const file of data ?? []) {
        if ((file.metadata?.size ?? 0) <= 0 || file.name.startsWith(".") || !/\.(png|jpe?g|webp|avif|gif)$/i.test(file.name)) continue;
        items.push({ title: file.name.replace(/\.[^/.]+$/, ""), ...(file.updated_at ? { modifiedAt: file.updated_at } : {}) });
      }
      if (!data || data.length < 1000) return items;
      if (offset >= 50_000) throw new Error("Catalogue is too large for a single sitemap.");
    }
  }
  const results = await Promise.allSettled((["desktop", "mobile"] as const).map(listGallery));
  for (const [index, device] of (["desktop", "mobile"] as const).entries()) {
    const result = results[index];
    if (result.status === "fulfilled") {
      catalog[device] = result.value;
      refreshed++;
    } else {
      console.warn(`[sitemap] ${device}: using the saved public catalogue; the gallery source could not be reached.`);
    }
  }
} else {
  console.log("[sitemap] Using the saved public catalogue (offline or gallery configuration unavailable).");
}

const { xml, count } = renderSitemap(catalog);
await writeFile(new URL("../public/sitemap.xml", import.meta.url), xml, "utf8");
if (refreshed) await writeFile(snapshotPath, `${JSON.stringify({ source: "public gallery", catalog }, null, 2)}\n`, "utf8");
console.log(`[sitemap] Wrote ${count} URLs (${catalog.desktop.length} desktop + ${catalog.mobile.length} phone wallpapers).`);
