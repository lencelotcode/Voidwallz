import { assertOrigin, clientKey, errorResponse, HttpError, json, logSecurity, readForm, readJson, textField } from "../server/security";
import { rateLimit, serverDatabase } from "../server/database";
import { clearSessionCookie, createSession, requireSession, verifyPassword } from "../server/adminSession";
import { MAX_PACK_BYTES, validateImage } from "../server/uploads";
export const config = { runtime: "edge" };
const categories = ["Cyber / Synth","Liquid / Fluid","Dark / Geometry","Space / OLED","Noir / Chroma","Minimal / Abstract","Texture / Film"];

export default async function handler(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    if (!["GET","POST","DELETE"].includes(req.method)) return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST, DELETE" });
    assertOrigin(req);
    const client = await clientKey(req);
    const action = new URL(req.url).searchParams.get("action");
    if (req.method === "POST" && action === "login") {
      await rateLimit(`admin-login:${client}`, 5, 120);
      await rateLimit("admin-login:account", 15, 40);
      const data = await readJson(req);
      if (typeof data.password !== "string" || data.password.length < 1 || data.password.length > 256) throw new HttpError(400, "Invalid credentials.");
      const password = data.password;
      const hash = process.env.ADMIN_PASSWORD_HASH;
      if (!hash) throw new HttpError(503, "Admin authentication is not configured.");
      if (!(await verifyPassword(password, hash))) { logSecurity("admin_login_failed", { requestId, client }); throw new HttpError(401, "Incorrect studio credentials."); }
      const session = await createSession();
      logSecurity("admin_login_succeeded", { requestId, client });
      return json({ csrf: session.csrf }, 200, { "Set-Cookie": session.cookie });
    }
    const session = await requireSession(req, req.method !== "GET");
    if (req.method === "GET") return json({ csrf: session.csrf, expiresAt: session.exp });
    await rateLimit(`admin-write:${client}`, 10, 30);
    if (action === "logout" && req.method === "POST") return json({ success: true }, 200, { "Set-Cookie": clearSessionCookie() });
    if (req.method === "DELETE") {
      const data = await readJson(req);
      const id = textField(data.id, "pack ID", 1, 200);
      if (!/^pack-[A-Za-z0-9_-]+$/.test(id)) throw new HttpError(400, "Invalid pack ID.");
      const db = serverDatabase();
      const { error } = await db.from("void_packs").delete().eq("id", id);
      if (error) throw new HttpError(502, "The pack could not be deleted.");
      logSecurity("admin_pack_deleted", { requestId, client });
      // Keep storage objects rather than trusting caller-supplied delete paths.
      return json({ success: true });
    }
    if (req.method !== "POST" || action !== "publish") throw new HttpError(400, "Unknown studio action.");
    const form = await readForm(req, MAX_PACK_BYTES + 20_000);
    const title = textField(form.get("title"), "pack title", 3, 100);
    const tagline = textField(form.get("tagline") || "", "description", 0, 240);
    const category = textField(form.get("category"), "category", 1, 50);
    const device = textField(form.get("device"), "device", 1, 10);
    if (!categories.includes(category) || !["desktop","mobile"].includes(device)) throw new HttpError(400, "Invalid category or device.");
    const files = form.getAll("images");
    if (files.length < 1 || files.length > 5 || files.some(f => !(f instanceof File))) throw new HttpError(400, "Choose one to five images.");
    if ((files as File[]).reduce((sum,f) => sum + f.size, 0) > MAX_PACK_BYTES) throw new HttpError(413, "Keep the combined image size below 3 MB.");
    const images = await Promise.all((files as File[]).map(f => validateImage(f, MAX_PACK_BYTES)));
    const id = `pack-${device}-${crypto.randomUUID()}`;
    const db = serverDatabase(); const paths: string[] = []; const items = [];
    try {
      for (const [i,image] of images.entries()) {
        const path = `packs/${device}/${id}/${String(i+1).padStart(2,"0")}.${image.ext}`;
        const { error } = await db.storage.from("wallpapers").upload(path, image.bytes, { contentType: image.mime, upsert: false, cacheControl: "3600" });
        if (error) throw new Error("Upload failed");
        paths.push(path);
        const url = db.storage.from("wallpapers").getPublicUrl(path).data.publicUrl;
        items.push({ id: `${id}-${i+1}`, title: `${title} Part ${i+1}`, serial: `VP-${i+1}`, category,
          format: `${image.width} × ${image.height} ${image.ext.toUpperCase()}`, downloads: 0, likes: 0,
          previewUrl: url, tinyUrl: url, originalUrl: url, device });
      }
      const { error } = await db.from("void_packs").insert({ id, title, tagline, category, device,
        serial: id, format: "Original images", downloads: 0, featured_image: items[0].previewUrl, items, created_at: new Date().toISOString() });
      if (error) throw new Error("Publishing failed");
    } catch {
      if (paths.length) await db.storage.from("wallpapers").remove(paths);
      throw new HttpError(502, "Publishing failed. Please try again.");
    }
    logSecurity("admin_pack_published", { requestId, client });
    return json({ success: true, id });
  } catch (error) { return errorResponse(error, requestId); }
}
