import assert from "node:assert/strict";
import test, { before, beforeEach, afterEach } from "node:test";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import report from "../api/report";
import admin from "../api/admin";
import { hashPassword, verifyPassword, createSession, requireSession } from "../server/adminSession";
import { assertOrigin, HttpError, readBody } from "../server/security";
import { validateImage, MAX_PACK_BYTES } from "../server/uploads";
import WallpaperCard from "../src/components/WallpaperCard";

const PASSWORD = "unique-test-only-password-2026";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=", "base64");
let passwordHash = "";
let fetchMock: ReturnType<typeof test.mock.method>;
let calls: { url: URL; method: string; body: any; headers: Headers }[] = [];
let denyRate = false; let upstreamFails = false;
const savedEnv = { ...process.env };
before(async () => { passwordHash = await hashPassword(PASSWORD); });
beforeEach(() => {
  process.env.NODE_ENV = "production"; process.env.VERCEL_ENV = "production";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.VITE_SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test_only_not_a_real_key";
  process.env.ADMIN_PASSWORD_HASH = passwordHash;
  process.env.ADMIN_SESSION_SECRET = "test-only-session-secret-at-least-32-characters";
  process.env.SECURITY_LOG_SALT = "test-only-logging-salt-at-least-32-characters";
  process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/123456789/test_only_token";
  calls = []; denyRate = false; upstreamFails = false;
  fetchMock = test.mock.method(globalThis, "fetch", async (input: any, init: RequestInit = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    calls.push({ url, method: init.method || "GET", body: init.body, headers: new Headers(init.headers) });
    if (url.hostname === "project.supabase.co" && url.pathname.endsWith("/rpc/security_take_token")) return Response.json(!denyRate);
    if (url.hostname === "project.supabase.co" && url.pathname.startsWith("/storage/v1/object/")) return Response.json({ Key: "test-key", Id: "test-id" });
    if (url.hostname === "project.supabase.co" && url.pathname === "/rest/v1/void_packs") return new Response(null, { status: init.method === "DELETE" ? 204 : 201 });
    if (url.hostname === "discord.com") {
      if (upstreamFails) throw new Error("PRIVATE_WEBHOOK_SECRET must never appear in the response");
      return new Response(null, { status: 204 });
    }
    throw new Error("Unexpected network destination in test");
  });
});
afterEach(() => { fetchMock.mock.restore(); for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key]; Object.assign(process.env, savedEnv); });
function request(path: string, method = "POST", body?: BodyInit, extra: Record<string,string> = {}) {
  return new Request(`https://voidwallz.live${path}`, { method, body, headers: {
    Origin: "https://voidwallz.live", "X-Voidwallz-Request": "1", "x-vercel-forwarded-for": "198.51.100.7", ...extra,
  } });
}
function reportForm() {
  const form = new FormData();
  Object.entries({ title: "Preview image issue", description: "The preview image does not load after opening the gallery.", email: "", device: "mobile", browser: "safari", consent: "on", viewport: "390x844", userAgent: "Test browser", currentRoute: "https://voidwallz.live/mobile?private=value#gallery" }).forEach(([key,value]) => form.append(key,value));
  return form;
}
async function session() {
  const created = await createSession();
  return { cookie: created.cookie.split(";")[0], csrf: created.csrf };
}
function packForm() {
  const form = new FormData();
  Object.entries({ title: "Quiet Forms", tagline: "A test collection", category: "Minimal / Abstract", device: "mobile" }).forEach(([key,value]) => form.append(key,value));
  form.append("images", new File([png], "original.png", { type: "image/png" }));
  return form;
}

test("rejects cross-origin, missing verification and production HTTP", async () => {
  assert.throws(() => assertOrigin(request("/api/report", "POST", null, { Origin: "https://evil.example" })), (e:any) => e.status === 403);
  assert.throws(() => assertOrigin(request("/api/report", "POST", null, { "X-Voidwallz-Request": "" })), (e:any) => e.status === 403);
  assert.throws(() => assertOrigin(new Request("http://voidwallz.live/api/report")), (e:any) => e.status === 400);
  assert.throws(() => assertOrigin(request("/api/report", "POST", null, { "Sec-Fetch-Site": "cross-site" })), (e:any) => e.status === 403);
  assert.equal(calls.length, 0);
});
test("enforces streaming and declared body limits before parsing", async () => {
  await assert.rejects(readBody(new Request("https://voidwallz.live/api/report", { method:"POST", body:"too large" }), 4), (e:any) => e.status === 413);
  await assert.rejects(readBody(new Request("https://voidwallz.live/api/report", { method:"POST", body:"x", headers:{"Content-Length":"9999"} }), 4), (e:any) => e.status === 413);
});
test("report API blocks foreign origins and provides no permissive CORS", async () => {
  const response = await report(request("/api/report", "POST", reportForm(), { Origin: "https://evil.example" }));
  assert.equal(response.status,403); assert.equal(response.headers.get("access-control-allow-origin"),null);
  assert.equal(calls.length,0);
  assert.equal((await report(request("/api/report", "OPTIONS"))).status,405);
});
test("valid report is delivered using a mock, disables mentions and strips URL secrets", async () => {
  const form = reportForm(); form.set("title", "@everyone Preview issue"); form.append("screenshot",new File([png],"../../fake.svg",{type:"image/png"}));
  const response = await report(request("/api/report","POST",form)); assert.equal(response.status,200);
  const outbound = calls.find(c => c.url.hostname === "discord.com")!;
  assert.ok(outbound); const payload=JSON.parse(outbound.body.get("payload_json"));
  assert.deepEqual(payload.allowed_mentions,{parse:[]});
  assert.equal(payload.embeds[0].fields.find((f:any)=>f.name==="Page").value,"/mobile");
  assert.equal(outbound.body.get("files[0]").name,"screenshot.png");
  assert.ok(!JSON.stringify(payload).includes("private=value"));
});
test("requires report consent and validates fields server-side", async () => {
  const form=reportForm(); form.delete("consent");
  assert.equal((await report(request("/api/report","POST",form))).status,400);
  const invalid=reportForm();invalid.set("description","short");
  assert.equal((await report(request("/api/report","POST",invalid))).status,400);
  const email=reportForm();email.set("email","not an email");
  assert.equal((await report(request("/api/report","POST",email))).status,400);
  assert.equal(calls.filter(c=>c.url.hostname==="discord.com").length,0);
});
test("rejects SVG, mismatched MIME, oversized dimensions and oversized images", async () => {
  await assert.rejects(validateImage(new File(["<svg onload='alert(1)'/>"],"image.png",{type:"image/png"}),1000), (e:any)=>e.status===400);
  await assert.rejects(validateImage(new File([png],"image.jpg",{type:"image/jpeg"}),1000), (e:any)=>e.status===400);
  const large=Buffer.from(png);large.writeUInt32BE(20000,16);
  await assert.rejects(validateImage(new File([large],"image.png",{type:"image/png"}),1000), (e:any)=>e.status===400);
  await assert.rejects(validateImage(new File([png],"image.png",{type:"image/png"}),10), (e:any)=>e.status===413);
  assert.equal((await validateImage(new File([png],"image.png",{type:"image/png"}),1000)).width,1);
});
test("rejects malicious report attachment without forwarding it", async () => {
  const form=reportForm(); form.append("screenshot",new File(["<svg/>"],"evil.svg",{type:"image/svg+xml"}));
  assert.equal((await report(request("/api/report","POST",form))).status,400);
  assert.equal(calls.filter(c=>c.url.hostname==="discord.com").length,0);
});
test("rate limits requests and does not deliver denied reports", async () => {
  denyRate=true; const response=await report(request("/api/report","POST",reportForm()));
  assert.equal(response.status,429); assert.equal(response.headers.get("retry-after"),"120");
  assert.equal(calls.filter(c=>c.url.hostname==="discord.com").length,0);
});
test("fails closed if distributed request protection is not configured", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await report(request("/api/report","POST",reportForm()))).status,503);
  assert.equal(calls.length,0);
});
test("never sends elevated credentials to a missing or mismatched project", async () => {
  delete process.env.SUPABASE_URL;
  assert.equal((await report(request("/api/report","POST",reportForm()))).status,503);
  process.env.SUPABASE_URL="https://different-project.supabase.co";
  assert.equal((await report(request("/api/report","POST",reportForm()))).status,503);
  assert.equal(calls.length,0);
});
test("does not claim report success without delivery and never returns secrets", async () => {
  delete process.env.DISCORD_WEBHOOK_URL;
  assert.equal((await report(request("/api/report","POST",reportForm()))).status,503);
  process.env.DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/123456789/test_only_token";upstreamFails=true;
  const response=await report(request("/api/report","POST",reportForm()));
  assert.equal(response.status,500);assert.ok(!(await response.text()).includes("PRIVATE_WEBHOOK_SECRET"));
});
test("hashes passwords with independent salts and verifies the full password", async () => {
  const other=await hashPassword(PASSWORD);
  assert.notEqual(other,passwordHash);assert.ok(!other.includes(PASSWORD));
  assert.ok(await verifyPassword(PASSWORD,passwordHash));
  assert.equal(await verifyPassword("incorrect-password",passwordHash),false);
  await assert.rejects(hashPassword("short"));
});
test("admin API rejects sessionStorage-style flags and forged cookies", async () => {
  const response=await admin(request("/api/admin","GET",undefined,{Cookie:"void_admin_authenticated=true"}));
  assert.equal(response.status,401);
  assert.equal((await admin(request("/api/admin","GET",undefined,{Cookie:"__Host-vw_admin=forged.token"}))).status,401);
  assert.equal(calls.length,0);
});
test("admin API permits a same-origin GET probe without an Origin header", async () => {
  const s=await session(); const headers={"X-Voidwallz-Request":"1","x-vercel-forwarded-for":"198.51.100.7","Sec-Fetch-Site":"same-origin",Cookie:s.cookie};
  const response=await admin(new Request("https://voidwallz.live/api/admin",{headers}));
  assert.equal(response.status,200);assert.equal((await response.json()).csrf,s.csrf);
});
test("login creates only secure HttpOnly Strict cookies and no plaintext credentials", async () => {
  const response=await admin(request("/api/admin?action=login","POST",JSON.stringify({password:PASSWORD}),{"Content-Type":"application/json"}));
  assert.equal(response.status,200);const cookie=response.headers.get("set-cookie")!;
  for(const flag of ["__Host-vw_admin=","HttpOnly","SameSite=Strict","Secure","Max-Age=1800","Path=/"]) assert.ok(cookie.includes(flag));
  assert.ok(!cookie.includes(PASSWORD));assert.ok(!JSON.stringify(await response.json()).includes(PASSWORD));
});
test("wrong credentials are rejected and login has independent IP/account limits", async () => {
  assert.equal((await admin(request("/api/admin?action=login","POST",JSON.stringify({password:"wrong-test-password"}),{"Content-Type":"application/json"}))).status,401);
  const keys=calls.map(c=>{try{return JSON.parse(c.body).p_key;}catch{return undefined;}}).filter(Boolean);
  assert.equal(keys.length,2);assert.ok(keys.some(k=>k==="admin-login:account"));assert.ok(keys.some(k=>k.startsWith("admin-login:")&&k!=="admin-login:account"));
});
test("admin login is rate limited before password verification", async () => {
  denyRate=true;
  assert.equal((await admin(request("/api/admin?action=login","POST",JSON.stringify({password:PASSWORD}),{"Content-Type":"application/json"}))).status,429);
});
test("rejects an expired session and invalidates sessions after a password change", async context => {
  const s=await session();const now=Date.now();const clock=context.mock.method(Date,"now",()=>now+1801*1000);
  await assert.rejects(requireSession(request("/api/admin","GET",undefined,{Cookie:s.cookie})),(e:any)=>e.status===401);clock.mock.restore();
  process.env.ADMIN_PASSWORD_HASH="changed-version";
  await assert.rejects(requireSession(request("/api/admin","GET",undefined,{Cookie:s.cookie})),(e:any)=>e.status===401);
});
test("admin mutations require both a valid signed session and CSRF token", async () => {
  assert.equal((await admin(request("/api/admin?action=publish","POST",packForm()))).status,401);
  const s=await session();
  assert.equal((await admin(request("/api/admin?action=publish","POST",packForm(),{Cookie:s.cookie}))).status,403);
  assert.equal((await admin(request("/api/admin?action=publish","POST",packForm(),{Cookie:s.cookie,"X-CSRF-Token":"forged"}))).status,403);
  assert.equal(calls.length,0);
});
test("publishes validated images through server storage and creates honest metadata", async () => {
  const s=await session();const response=await admin(request("/api/admin?action=publish","POST",packForm(),{Cookie:s.cookie,"X-CSRF-Token":s.csrf}));
  assert.equal(response.status,200);
  const upload=calls.find(c=>c.url.pathname.startsWith("/storage/v1/object/"))!;
  assert.ok(upload.url.pathname.includes("/packs/mobile/pack-mobile-"));assert.ok(upload.url.pathname.endsWith("/01.png"));
  const insert=calls.find(c=>c.url.pathname==="/rest/v1/void_packs")!;
  const metadata=JSON.parse(insert.body);assert.equal(metadata.downloads,0);assert.equal(metadata.items[0].format,"1 × 1 PNG");
});
test("rejects excessive pack file counts and total upload size", async () => {
  const s=await session();const headers={Cookie:s.cookie,"X-CSRF-Token":s.csrf};
  const form=packForm();for(let i=0;i<5;i++)form.append("images",new File([png],`image${i}.png`,{type:"image/png"}));
  assert.equal((await admin(request("/api/admin?action=publish","POST",form,headers))).status,400);
  const large=packForm();large.set("images",new File([new Uint8Array(MAX_PACK_BYTES+1)],"large.png",{type:"image/png"}));
  assert.equal((await admin(request("/api/admin?action=publish","POST",large,headers))).status,413);
  assert.equal(calls.filter(c=>c.url.pathname.startsWith("/storage/")).length,0);
});
test("rejects injection-shaped delete IDs rather than interpolating queries", async () => {
  const s=await session();const response=await admin(request("/api/admin","DELETE",JSON.stringify({id:"pack-' OR 1=1 --"}),{Cookie:s.cookie,"X-CSRF-Token":s.csrf,"Content-Type":"application/json"}));
  assert.equal(response.status,400);assert.equal(calls.filter(c=>c.url.pathname==="/rest/v1/void_packs").length,0);
});
test("logout clears the secure session cookie", async () => {
  const s=await session();const response=await admin(request("/api/admin?action=logout","POST","{}",{Cookie:s.cookie,"X-CSRF-Token":s.csrf,"Content-Type":"application/json"}));
  assert.equal(response.status,200);assert.ok(response.headers.get("set-cookie")?.includes("Max-Age=0"));
});
test("wallpaper titles and image alt text remain escaped in actual card rendering", () => {
  const title='<img src=x onerror=alert(1)>';
  const html=renderToStaticMarkup(React.createElement(WallpaperCard,{wallpaper:{id:"test",title,serial:"T",category:"Wallpaper",format:"PNG",downloads:0,previewUrl:"/wallpapers/tiny/hillside-crt.jpg",tinyUrl:"",originalUrl:"/test.png",device:"mobile"},onOpenModal:()=>{}}));
  assert.ok(html.includes("&lt;img"));assert.ok(!html.includes("<img src=x"));assert.ok(!html.includes('onerror="alert(1)"'));
});
test("production headers enforce HTTPS, restrict scripts/frames and protect crawler files", async () => {
  const config=JSON.parse(await readFile(new URL("../vercel.json",import.meta.url),"utf8"));
  const headers=Object.fromEntries(config.headers.find((entry:any)=>entry.source==="/(.*)").headers.map((header:any)=>[header.key,header.value]));
  assert.match(headers["Strict-Transport-Security"],/max-age=31536000/);assert.equal(headers["X-Content-Type-Options"],"nosniff");
  assert.ok(headers["Content-Security-Policy"].includes("script-src 'self';"));assert.ok(!headers["Content-Security-Policy"].includes("unsafe-eval"));
  assert.ok(headers["Content-Security-Policy"].includes("frame-ancestors 'none'"));
  const rewrite=new RegExp(`^${config.rewrites.find(rule => rule.destination === "/").source}$`);for(const path of ["/sitemap.xml","/robots.txt","/BingSiteAuth.xml","/api/admin"])assert.equal(rewrite.test(path),false);
});
test("production build refuses unapproved browser secrets and privileged Supabase keys", () => {
  const jwt = `${Buffer.from('{}').toString('base64url')}.${Buffer.from('{"role":"service_role"}').toString('base64url')}.signature`;
  for (const [values, expected, forbidden] of [
    [{ VITE_INTERNAL_TEST_SECRET: "security-build-canary" }, "Unapproved browser environment variables", "security-build-canary"],
    [{ VITE_SUPABASE_ANON_KEY: "sb_secret_build_canary_not_a_real_key" }, "server secret", "sb_secret_build_canary_not_a_real_key"],
    [{ VITE_SUPABASE_ANON_KEY: jwt }, "privileged Supabase key", jwt],
  ] as const) {
    const result = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
      cwd: new URL("../", import.meta.url), env: { ...process.env, ...values }, encoding: "utf8",
    });
    const output = result.stdout + result.stderr;
    assert.notEqual(result.status,0); assert.ok(output.includes(expected)); assert.ok(!output.includes(forbidden));
  }
});

test("Vercel metadata and a retired passkey permit builds without entering browser code", async () => {
  const fixture = await realpath(await mkdtemp(join(tmpdir(), "voidwallz-vercel-env-")));
  try {
    await writeFile(join(fixture, "index.html"), '<!doctype html><div id="root"></div><script type="module" src="/main.ts"></script>');
    await writeFile(join(fixture, "main.ts"), `document.getElementById("root").textContent = JSON.stringify({
      all: import.meta.env,
      publicUrl: import.meta.env.VITE_SUPABASE_URL,
      publicKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      deployment: import.meta.env.VITE_VERCEL_GIT_REPO_ID,
      unknownMetadata: import.meta.env.VITE_VERCEL_TEST_SECRET,
      retiredPasskey: import.meta.env.VITE_ADMIN_PASSKEY,
      serverSecret: import.meta.env.ADMIN_SESSION_SECRET,
    });`);
    const result = spawnSync(process.execPath, ["--input-type=module"], {
      cwd: new URL("../", import.meta.url), encoding: "utf8",
      input: `import { build } from "vite"; await build({
        configFile: ${JSON.stringify(fileURLToPath(new URL("../vite.config.ts", import.meta.url)))},
        root: ${JSON.stringify(fixture)}, publicDir: false, logLevel: "silent",
        build: { outDir: ${JSON.stringify(join(fixture, "dist"))}, emptyOutDir: true },
      });`,
      env: {
        ...process.env,
        VITE_SUPABASE_URL: "https://public-gallery-canary.supabase.co",
        VITE_SUPABASE_ANON_KEY: "sb_publishable_public_gallery_canary",
        VITE_VERCEL_ENV: "production",
        VITE_VERCEL_GIT_REPO_ID: "vercel-repo-metadata-canary",
        VITE_VERCEL_GIT_PULL_REQUEST_ID: "vercel-pr-metadata-canary",
        VITE_VERCEL_URL: "deployment-preview-canary.vercel.app",
        VITE_VERCEL_TEST_SECRET: "metadata-namespace-private-canary",
        VITE_ADMIN_PASSKEY: "retired-browser-password-build-canary",
        ADMIN_SESSION_SECRET: "private-session-build-canary-at-least-32-chars",
      },
    });
    assert.equal(result.status, 0, `Build with Vercel-provided metadata must succeed. ${result.stderr.slice(0, 1400)}`);
    const assets = await readdir(join(fixture, "dist/assets"));
    const javascript = (await Promise.all(assets.filter(file => file.endsWith(".js")).map(file => readFile(join(fixture, "dist/assets", file), "utf8")))).join("\n");
    assert.ok(javascript.includes("https://public-gallery-canary.supabase.co"));
    assert.ok(javascript.includes("sb_publishable_public_gallery_canary"));
    for (const value of ["vercel-repo-metadata-canary", "vercel-pr-metadata-canary", "deployment-preview-canary.vercel.app", "metadata-namespace-private-canary", "retired-browser-password-build-canary", "private-session-build-canary-at-least-32-chars"]) {
      assert.equal(javascript.includes(value), false, "Non-public settings must not enter browser JavaScript.");
      assert.equal((result.stdout + result.stderr).includes(value), false, "Non-public values must not be logged during builds.");
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
