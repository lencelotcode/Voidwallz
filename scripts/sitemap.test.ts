import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalUrl, PUBLIC_SITE_PATHS } from "../src/shared/seo/siteUrls";
import { escapeXml, renderSitemap } from "./sitemap";

test("uses production canonicals without query/fragment variants", () => {
  assert.equal(canonicalUrl("http://localhost:3000/mobile/hillside-crt-daydream?preview=1#gallery"), "https://voidwallz.live/mobile/hillside-crt-daydream/");
  assert.equal(canonicalUrl("/desktop/#gallery"), "https://voidwallz.live/desktop");
});

test("escapes XML and preserves the gallery's actual slug rules", () => {
  assert.equal(escapeXml('<&>"\''), "&lt;&amp;&gt;&quot;&apos;");
  const { xml, count } = renderSitemap({
    desktop: [{ title: " Mirror Hall" }],
    mobile: [{ title: "Sky & sea's (1)" }],
  });
  assert.equal(count, PUBLIC_SITE_PATHS.length + 2);
  assert.ok(xml.includes("/desktop/-mirror-hall/"));
  assert.ok(xml.includes("/mobile/sky-%26-sea&apos;s-(1)/"));
  assert.ok(!xml.includes("/admin"));
  assert.ok(!xml.includes("/api/"));
});

test("deduplicates format variants and only includes trustworthy modified dates", () => {
  const { xml, count } = renderSitemap({ desktop: [
    { title: "Same Title", modifiedAt: "2020-01-01T00:00:00Z" },
    { title: "Same Title", modifiedAt: "2021-01-01T00:00:00Z" },
    { title: "Future", modifiedAt: "2099-01-01" },
    { title: "Invalid", modifiedAt: "not a date" },
    { title: "Undated" },
  ], mobile: [] });
  assert.equal(count, PUBLIC_SITE_PATHS.length + 4);
  assert.equal((xml.match(/<lastmod>/g) ?? []).length, 1);
  assert.ok(xml.includes("<lastmod>2021-01-01T00:00:00.000Z</lastmod>"));
  assert.ok(!xml.includes("2099"));
  assert.ok(!xml.includes("<priority>"));
  assert.ok(!xml.includes("<changefreq>"));
});

test("deployment does not rewrite crawler files to the React app", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const appRewrite = new RegExp(`^${config.rewrites.find(rule => rule.destination === "/").source}$`);
  assert.equal(appRewrite.test("/sitemap.xml"), false);
  assert.equal(appRewrite.test("/robots.txt"), false);
  assert.equal(appRewrite.test("/BingSiteAuth.xml"), false);
  assert.equal(appRewrite.test("/api/report"), false);
  assert.equal(appRewrite.test("/mobile/hillside-crt-daydream/"), true);
});
