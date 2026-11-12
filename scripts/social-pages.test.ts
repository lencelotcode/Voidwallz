import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DEFAULT_IMAGE, resolvePageMeta, socialTags, STATIC_META, wallpaperMeta } from "../src/shared/seo/pageMetadata";
import { canonicalUrl, PUBLIC_SITE_PATHS } from "../src/shared/seo/siteUrls";
import { renderSocialHead, renderSocialPage, routeFile, socialPages } from "./social-pages";

const root = new URL("../", import.meta.url);
const { catalog } = JSON.parse(await readFile(new URL("scripts/sitemap-catalog.json", root), "utf8"));

test("all public routes and wallpapers receive matching canonical metadata", () => {
  const pages = socialPages(catalog);
  assert.equal(pages.size, PUBLIC_SITE_PATHS.length + catalog.desktop.length + catalog.mobile.length);
  assert.equal(pages.has("/admin"), false);
  assert.equal(pages.has("/desktop/-mirror-hall/"), true);
  for (const [path, meta] of pages) {
    assert.equal(resolvePageMeta(meta).url, canonicalUrl(path));
    assert.ok(meta.title);
    assert.ok(meta.description);
    if (/^\/(desktop|mobile)\/.+\/$/.test(path)) {
      assert.match(resolvePageMeta(meta).image, /^https:\/\/wrvgosqpjqrthmtpzmrm\.supabase\.co\/storage\/v1\/object\/public\/wallpapers\/(desktop|mobile)\/previews\/.+\.webp$/);
    }
  }
});

test("share URLs omit local hosts, tracking queries and fragments", () => {
  const meta = resolvePageMeta({ title: "Test", url: "http://localhost:3000/mobile/hillside-crt-daydream?utm_source=x#preview" });
  assert.equal(meta.url, "https://voidwallz.live/mobile/hillside-crt-daydream/");
});

test("HTML escapes hostile catalogue text and replaces metadata exactly once", () => {
  const hostile = '<img src=x onerror="alert(1)"> & \'title\'';
  const template = '<head><!-- social-meta:start --><title>old</title><!-- social-meta:end --></head><body><div id="root"></div></body>';
  const html = renderSocialPage(template, { title: hostile, description: hostile, image: "javascript:alert(1)" });
  assert.equal(html.includes(hostile), false);
  assert.equal(html.includes('<img src=x'), false);
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &apos;title&apos;'));
  assert.equal((html.match(/property="og:title"/g) ?? []).length, 1);
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.ok(html.includes(DEFAULT_IMAGE));
  assert.ok(html.includes('<div id="root"></div>'));
  assert.throws(() => renderSocialPage("<head></head>", { title: "Missing block" }));
  assert.throws(() => renderSocialPage(template + template, { title: "Duplicate blocks" }));
});

test("default image dimensions are accurate and never carried onto portrait images", async () => {
  const png = await readFile(new URL("public/og-image.png", root));
  assert.equal(png.subarray(1,4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  const home = socialTags(STATIC_META["/"]);
  assert.equal(home.find(tag => tag.key === "og:image:width")?.content, "1200");
  const portrait = socialTags(wallpaperMeta({ title: "Hillside CRT daydream", device: "mobile", previewUrl: catalog.mobile[0].image }, "/mobile/hillside-crt-daydream/"));
  assert.equal(portrait.some(tag => /og:image:(width|height|type)/.test(tag.key)), false);
  assert.equal(portrait.find(tag => tag.key === "twitter:card")?.content, "summary_large_image");
  assert.equal(portrait.find(tag => tag.key === "og:image:alt")?.content, "Hillside CRT daydream — phone wallpaper");
  assert.ok(renderSocialHead(STATIC_META["/"]).includes('name="twitter:site" content="@Voidwallz"'));
});

test("static output paths reject traversal, encoded separators and control characters", () => {
  for (const path of ["../bad", "/../bad", "/%2E%2E/bad", "/desktop/a%2Fb/", "/desktop/a%5Cb/", "/desktop/%00/", "/desktop/a?x=1"]) {
    assert.throws(() => routeFile(path), path);
  }
  assert.equal(routeFile("/mobile/crimson-horizon-(1)/"), "mobile/crimson-horizon-(1)/index.html");
  assert.equal(routeFile("/"), "index.html");
});

test("Vercel routes reach generated HTML without capturing APIs or sitemap files", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  const pages = socialPages(catalog);
  for (const [path] of pages) {
    if (path === "/") continue;
    const clean = path.replace(/\/$/, "");
    const wallpaper = clean.match(/^\/(desktop|mobile)\/([^/]+)$/);
    const source = wallpaper ? `/${wallpaper[1]}/:slug` : clean;
    const rule = config.rewrites.find(rule => rule.source === source);
    assert.ok(rule, `Missing static HTML rewrite for ${path}`);
    const destination = rule.destination.replace(":slug", wallpaper?.[2] ?? "");
    assert.equal(decodeURIComponent(destination.slice(1)), routeFile(path));
  }
  assert.equal(config.rewrites.at(-1).destination, "/");
});

test("built HTML contains one complete share card before any JavaScript executes", async () => {
  const pages = socialPages(catalog);
  for (const [path, meta] of pages) {
    const html = await readFile(new URL(`dist/${routeFile(path)}`, root), "utf8");
    assert.ok(html.includes(renderSocialHead(meta)), `Wrong initial metadata: ${path}`);
    for (const key of ["og:title", "og:image", "og:url", "twitter:card", "twitter:image"]) {
      assert.equal((html.match(new RegExp(`(?:property|name)="${key}"`, "g")) ?? []).length, 1, `${key}: ${path}`);
    }
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.match(html, /<script[^>]+src="\/assets\//);
    assert.ok(html.includes('<div id="root"></div>'));
  }
});
