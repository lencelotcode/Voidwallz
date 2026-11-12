import { publishPack } from './publishPack';
import { serverEnv } from '../../config/env';
import { createEndpoint } from '../../http/createEndpoint';
import { HttpError, json, logSecurity, readForm, readJson, textField } from '../../http/security';
import { rateLimit } from '../../http/rateLimit';
import { serverDatabase } from '../../infrastructure/database';
import {
  clearSessionCookie,
  createSession,
  requireSession,
  verifyPassword,
} from '../../auth/adminSession';
import { MAX_PACK_BYTES } from '../../validation/images';

export default createEndpoint(['GET', 'POST', 'DELETE'], async (req, { requestId, client }) => {
  const action = new URL(req.url).searchParams.get('action');
  if (req.method === 'POST' && action === 'login') {
    await rateLimit(`admin-login:${client}`, 5, 120);
    await rateLimit('admin-login:account', 15, 40);
    const data = await readJson(req);
    if (typeof data.password !== 'string' || data.password.length < 1 || data.password.length > 256)
      throw new HttpError(400, 'Invalid credentials.');
    const password = data.password;
    const hash = serverEnv().adminPasswordHash;
    if (!hash) throw new HttpError(503, 'Admin authentication is not configured.');
    if (!(await verifyPassword(password, hash))) {
      logSecurity('admin_login_failed', { requestId, client });
      throw new HttpError(401, 'Incorrect studio credentials.');
    }
    const session = await createSession();
    logSecurity('admin_login_succeeded', { requestId, client });
    return json({ csrf: session.csrf }, 200, { 'Set-Cookie': session.cookie });
  }
  const session = await requireSession(req, req.method !== 'GET');
  if (req.method === 'GET') return json({ csrf: session.csrf, expiresAt: session.exp });
  await rateLimit(`admin-write:${client}`, 10, 30);
  if (action === 'logout' && req.method === 'POST')
    return json({ success: true }, 200, { 'Set-Cookie': clearSessionCookie() });
  if (req.method === 'DELETE') {
    const data = await readJson(req);
    const id = textField(data.id, 'pack ID', 1, 200);
    if (!/^pack-[A-Za-z0-9_-]+$/.test(id)) throw new HttpError(400, 'Invalid pack ID.');
    const db = serverDatabase();
    const { error } = await db.from('void_packs').delete().eq('id', id);
    if (error) throw new HttpError(502, 'The pack could not be deleted.');
    logSecurity('admin_pack_deleted', { requestId, client });
    // Keep storage objects rather than trusting caller-supplied delete paths.
    return json({ success: true });
  }
  if (req.method !== 'POST' || action !== 'publish')
    throw new HttpError(400, 'Unknown studio action.');
  const id = await publishPack(await readForm(req, MAX_PACK_BYTES + 20_000), { requestId, client });
  logSecurity('admin_pack_published', { requestId, client });
  return json({ success: true, id });
});
