import { apiRequest } from '../../../shared/services/apiClient';
export async function submitReport(form: FormData) {
  return apiRequest(
    '/api/report',
    { method: 'POST', body: form },
    (value): value is { success: true } =>
      Boolean(value && typeof value === 'object' && 'success' in value && value.success === true),
  );
}
