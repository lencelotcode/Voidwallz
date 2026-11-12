import { HttpError } from '../../http/security';
import { serverEnv } from '../../config/env';
import type { validateImage } from '../../validation/images';
export interface IssueReport {
  title: string;
  description: string;
  email: string;
  device: string;
  browser: string;
  viewport: string;
  route: string;
  userAgent: string;
  image: Awaited<ReturnType<typeof validateImage>> | null;
}
export async function deliverReport(report: IssueReport, requestId: string) {
  const { title, description, email, device, browser, viewport, route, userAgent, image } = report;
  const webhook = serverEnv().reportWebhookUrl;
  if (!webhook)
    throw new HttpError(503, 'Report delivery is not configured. Please use the contact email.');
  const target = new URL(webhook);
  if (
    target.protocol !== 'https:' ||
    !['discord.com', 'discordapp.com'].includes(target.hostname) ||
    !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(target.pathname)
  )
    throw new HttpError(503, 'Report delivery is not configured.');
  const payload = {
    content: 'New Voidwallz issue report',
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title,
        description,
        color: 0xc8ff00,
        fields: [
          { name: 'Device', value: device, inline: true },
          { name: 'Browser', value: browser, inline: true },
          { name: 'Viewport', value: viewport || 'Not provided', inline: true },
          { name: 'Page', value: route },
          { name: 'Browser information', value: userAgent || 'Not provided' },
          { name: 'Reply email', value: email || 'Not provided' },
          { name: 'Reference', value: requestId },
        ],
        ...(image ? { image: { url: `attachment://screenshot.${image.ext}` } } : {}),
      },
    ],
  };
  async function deliver(forum = false) {
    const form = new FormData();
    form.append(
      'payload_json',
      JSON.stringify({ ...payload, ...(forum ? { thread_name: title.slice(0, 100) } : {}) }),
    );
    if (image)
      form.append(
        'files[0]',
        new Blob([image.bytes], { type: image.mime }),
        `screenshot.${image.ext}`,
      );
    return fetch(target, {
      method: 'POST',
      body: form,
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
  }
  let response = await deliver();
  if (response.status === 400 && /thread_name/.test(await response.text()))
    response = await deliver(true);
  if (!response.ok)
    throw new HttpError(502, 'Report delivery failed. Please try later or use the contact email.');
}
