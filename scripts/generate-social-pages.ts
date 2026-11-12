import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { renderSocialPage, routeFile, socialPages } from "./social-pages";
import type { Catalog } from "./sitemap";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const template = await readFile(resolve(dist, "index.html"), "utf8");
const { catalog }: { catalog: Catalog } = JSON.parse(await readFile(new URL("./sitemap-catalog.json", import.meta.url), "utf8"));
const pages = socialPages(catalog);
for (const [route, meta] of pages) {
  const target = resolve(dist, routeFile(route));
  if (!target.startsWith(`${dist.replace(/\/$/, "")}${sep}`)) throw new Error("Static route escaped the build directory.");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, renderSocialPage(template, meta), "utf8");
}
console.log(`[social] Wrote ${pages.size} HTML pages with Open Graph and X cards (no JavaScript needed to read metadata).`);
