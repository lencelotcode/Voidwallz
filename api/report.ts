export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();

    const title = formData.get('title');
    const email = formData.get('email');
    const device = formData.get('device');
    const browser = formData.get('browser');
    const description = formData.get('description');
    const userAgent = formData.get('userAgent');
    const viewport = formData.get('viewport');
    const currentRoute = formData.get('currentRoute');
    const screenshot = formData.get('screenshot') as File | null;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL is not set.");
      // We still return success to frontend to test UI if webhook is missing
      return new Response(JSON.stringify({ success: true, warning: 'Webhook not configured' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const discordFormData = new FormData();

    const payload = {
      content: "🚨 **New VoidWallz Anomaly Report**",
      embeds: [
        {
          title: title || "Untitled Report",
          description: description || "No description provided.",
          color: 0xffffff,
          fields: [
            { name: "Device", value: device || "Unknown", inline: true },
            { name: "Browser", value: browser || "Unknown", inline: true },
            { name: "Viewport", value: viewport || "Unknown", inline: true },
            { name: "Current Route", value: currentRoute || "Unknown", inline: false },
            { name: "User Agent", value: userAgent || "Unknown", inline: false },
            { name: "Email", value: email || "Not provided", inline: false },
          ],
          timestamp: new Date().toISOString(),
        }
      ]
    };

    discordFormData.append('payload_json', JSON.stringify(payload));

    if (screenshot && screenshot.size > 0) {
      discordFormData.append('file', screenshot);
    }

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: discordFormData,
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
