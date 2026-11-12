import { assertOrigin, clientKey, errorResponse, HttpError, json, logSecurity, readForm, textField } from "../server/security";
import { rateLimit } from "../server/database";
import { MAX_REPORT_IMAGE, validateImage } from "../server/uploads";
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
    assertOrigin(req);
    const client = await clientKey(req);
    await rateLimit(`report:${client}`, 3, 200);
    const data = await readForm(req, MAX_REPORT_IMAGE + 20_000);
    const title = textField(data.get("title"), "title", 3, 160);
    const description = textField(data.get("description"), "description", 10, 3500);
    const email = textField(data.get("email") || "", "email", 0, 254);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Invalid email.");
    const device = textField(data.get("device"), "device", 1, 20);
    const browser = textField(data.get("browser"), "browser", 1, 20);
    if (!["desktop","mobile","other"].includes(device) || !["chrome","safari","firefox","edge","other"].includes(browser)) throw new HttpError(400, "Invalid device or browser.");
    if (data.get("consent") !== "on") throw new HttpError(400, "Consent is required to submit a report.");
    const userAgent = textField(data.get("userAgent") || "", "browser information", 0, 512);
    const viewport = textField(data.get("viewport") || "", "viewport", 0, 24);
    if (viewport && !/^\d{1,5}x\d{1,5}$/.test(viewport)) throw new HttpError(400, "Invalid viewport.");
    let route = "/report";
    if (data.get("currentRoute")) {
      try { route = new URL(textField(data.get("currentRoute"), "page URL", 1, 2048)).pathname.slice(0,512); }
      catch { throw new HttpError(400, "Invalid page URL."); }
    }
    const screenshot = data.get("screenshot");
    const image = screenshot instanceof File && screenshot.size ? await validateImage(screenshot, MAX_REPORT_IMAGE) : null;
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) throw new HttpError(503, "Report delivery is not configured. Please use the contact email.");
    const target = new URL(webhook);
    if (target.protocol !== "https:" || !["discord.com","discordapp.com"].includes(target.hostname) || !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(target.pathname)) throw new HttpError(503, "Report delivery is not configured.");
    const payload = {
      content: "New Voidwallz issue report", allowed_mentions: { parse: [] },
      embeds: [{ title, description, color: 0xc8ff00,
        fields: [
          { name: "Device", value: device, inline: true }, { name: "Browser", value: browser, inline: true },
          { name: "Viewport", value: viewport || "Not provided", inline: true },
          { name: "Page", value: route }, { name: "Browser information", value: userAgent || "Not provided" },
          { name: "Reply email", value: email || "Not provided" }, { name: "Reference", value: requestId },
        ], ...(image ? { image: { url: `attachment://screenshot.${image.ext}` } } : {}),
      }],
    };
    async function deliver(forum = false) {
      const form = new FormData();
      form.append("payload_json", JSON.stringify({ ...payload, ...(forum ? { thread_name: title.slice(0,100) } : {}) }));
      if (image) form.append("files[0]", new Blob([image.bytes], { type: image.mime }), `screenshot.${image.ext}`);
      return fetch(target, { method: "POST", body: form, redirect: "error", signal: AbortSignal.timeout(8000) });
    }
    let response = await deliver();
    if (response.status === 400 && /thread_name/.test(await response.text())) response = await deliver(true);
    if (!response.ok) throw new HttpError(502, "Report delivery failed. Please try later or use the contact email.");
    logSecurity("report_accepted", { requestId, client });
    return json({ success: true, requestId });
  } catch (error) { return errorResponse(error, requestId); }
}
