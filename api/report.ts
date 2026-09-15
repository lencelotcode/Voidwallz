export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();

    const title = (formData.get("title") as string) || "";
    const email = (formData.get("email") as string) || "";
    const device = (formData.get("device") as string) || "";
    const browser = (formData.get("browser") as string) || "";
    const description = (formData.get("description") as string) || "";
    const userAgent = (formData.get("userAgent") as string) || "";
    const viewport = (formData.get("viewport") as string) || "";
    const currentRoute = (formData.get("currentRoute") as string) || "";
    const screenshot = formData.get("screenshot") as File | null;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL is not set.");
      // We still return success to frontend to test UI if webhook is missing
      return new Response(
        JSON.stringify({ success: true, warning: "Webhook not configured" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const hasScreenshot = screenshot && screenshot.size > 0;
    const screenshotFilename = hasScreenshot
      ? screenshot.name || "screenshot.png"
      : undefined;

    const basePayload: any = {
      content: "🚨 **New VoidWallz Anomaly Report**",
      embeds: [
        {
          title: title || "Untitled Report",
          description: description || "No description provided.",
          color: 0xff3344,
          fields: [
            { name: "Device", value: device || "Unknown", inline: true },
            { name: "Browser", value: browser || "Unknown", inline: true },
            { name: "Viewport", value: viewport || "Unknown", inline: true },
            {
              name: "Current Route",
              value: currentRoute || "Unknown",
              inline: false,
            },
            {
              name: "User Agent",
              value: userAgent || "Unknown",
              inline: false,
            },
            { name: "Email", value: email || "Not provided", inline: false },
          ],
          timestamp: new Date().toISOString(),
          ...(hasScreenshot && screenshotFilename
            ? { image: { url: `attachment://${screenshotFilename}` } }
            : {}),
        },
      ],
      ...(hasScreenshot && screenshotFilename
        ? {
            attachments: [
              {
                id: 0,
                filename: screenshotFilename,
                description: "Anomaly Screenshot",
              },
            ],
          }
        : {}),
    };

    const buildFormData = (p: any) => {
      const discordFormData = new FormData();
      discordFormData.append("payload_json", JSON.stringify(p));
      if (hasScreenshot && screenshot) {
        discordFormData.append("files[0]", screenshot, screenshotFilename);
      }
      return discordFormData;
    };

    // First try payload without thread_name (compatible with regular text channels)
    // If it's a forum channel, Discord returns 400 requiring thread_name.
    // Or if thread_name is included, Discord returns 400 on standard text channels.
    // We handle both dynamically:
    const forumPayload = {
      ...basePayload,
      thread_name: title ? `Anomaly: ${title}` : "New Anomaly Report",
    };

    // Attempt standard text channel first (most common)
    let discordResponse = await fetch(webhookUrl, {
      method: "POST",
      body: buildFormData(basePayload),
    });

    // If rejected with 400 because it's a forum channel requiring a thread
    if (!discordResponse.ok && discordResponse.status === 400) {
      const errorBody = await discordResponse.text();
      if (
        errorBody.includes("thread_name") ||
        errorBody.includes("forum") ||
        errorBody.includes("thread")
      ) {
        console.warn("Discord channel is forum channel, retrying with thread_name...");
        discordResponse = await fetch(webhookUrl, {
          method: "POST",
          body: buildFormData(forumPayload),
        });
      } else {
        console.error("Discord API error:", discordResponse.status, errorBody);
        throw new Error(`Discord API error: ${errorBody}`);
      }
    }

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error("Discord API error:", discordResponse.status, errorText);
      throw new Error(`Discord API error: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
