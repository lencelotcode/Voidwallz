import { deliverReport } from './reportDelivery';
import { createEndpoint } from '../../http/createEndpoint';
import { HttpError, json, logSecurity, readForm, textField } from '../../http/security';
import { rateLimit } from '../../http/rateLimit';
import { MAX_REPORT_IMAGE, validateImage } from '../../validation/images';

export default createEndpoint(['POST'], async (req, { requestId, client }) => {
  await rateLimit(`report:${client}`, 3, 200);
  const data = await readForm(req, MAX_REPORT_IMAGE + 20_000);
  const title = textField(data.get('title'), 'title', 3, 160);
  const description = textField(data.get('description'), 'description', 10, 3500);
  const email = textField(data.get('email') || '', 'email', 0, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new HttpError(400, 'Invalid email.');
  const device = textField(data.get('device'), 'device', 1, 20);
  const browser = textField(data.get('browser'), 'browser', 1, 20);
  if (
    !['desktop', 'mobile', 'other'].includes(device) ||
    !['chrome', 'safari', 'firefox', 'edge', 'other'].includes(browser)
  )
    throw new HttpError(400, 'Invalid device or browser.');
  if (data.get('consent') !== 'on')
    throw new HttpError(400, 'Consent is required to submit a report.');
  const userAgent = textField(data.get('userAgent') || '', 'browser information', 0, 512);
  const viewport = textField(data.get('viewport') || '', 'viewport', 0, 24);
  if (viewport && !/^\d{1,5}x\d{1,5}$/.test(viewport))
    throw new HttpError(400, 'Invalid viewport.');
  let route = '/report';
  if (data.get('currentRoute')) {
    try {
      route = new URL(textField(data.get('currentRoute'), 'page URL', 1, 2048)).pathname.slice(
        0,
        512,
      );
    } catch {
      throw new HttpError(400, 'Invalid page URL.');
    }
  }
  const screenshot = data.get('screenshot');
  const image =
    screenshot instanceof File && screenshot.size
      ? await validateImage(screenshot, MAX_REPORT_IMAGE)
      : null;
  await deliverReport(
    { title, description, email, device, browser, viewport, route, userAgent, image },
    requestId,
  );
  logSecurity('report_accepted', { requestId, client });
  return json({ success: true, requestId });
});
