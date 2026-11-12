import { apiRequest } from '../../../shared/services/apiClient';
const validSession = (value: unknown): value is { csrf: string } =>
  Boolean(
    value &&
    typeof value === 'object' &&
    'csrf' in value &&
    typeof value.csrf === 'string' &&
    /^[A-Za-z0-9_-]{43}$/.test(value.csrf),
  );
export function checkAdminSession(signal?: AbortSignal) {
  return apiRequest('/api/admin', { signal }, validSession);
}
export function signIn(password: string) {
  return apiRequest(
    '/api/admin?action=login',
    {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    },
    validSession,
  );
}
export function adminMutation(action: 'logout' | 'publish', body: BodyInit, csrf: string) {
  return apiRequest(
    `/api/admin?action=${action}`,
    {
      method: 'POST',
      body,
      headers: {
        'X-CSRF-Token': csrf,
        ...(action === 'logout' ? { 'Content-Type': 'application/json' } : {}),
      },
    },
    (value): value is { success: true } =>
      Boolean(value && typeof value === 'object' && 'success' in value && value.success === true),
  );
}
