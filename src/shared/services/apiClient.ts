import { AppError, isAbortError } from '../errors/AppError';
interface ApiOptions extends RequestInit {
  timeoutMs?: number;
}
/** Same-origin API transport: deadlines, cancellation, JSON validation and safe failures. */
export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
  validate?: (value: unknown) => value is T,
): Promise<T> {
  if (!path.startsWith('/api/') || path.startsWith('//'))
    throw new AppError('Invalid API request.', 'configuration');
  const { timeoutMs = 15_000, signal, ...request } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetch(path, {
      ...request,
      credentials: 'same-origin',
      headers: { 'X-Voidwallz-Request': '1', ...Object.fromEntries(new Headers(request.headers)) },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error.slice(0, 400)
          : 'The request could not be completed. Please try again.';
      throw new AppError(message, 'http', response.status);
    }
    if (!data || typeof data !== 'object' || (validate && !validate(data)))
      throw new AppError(
        'The server returned an unexpected response. Please try again.',
        'response',
      );
    return data as T;
  } catch (error) {
    if (error instanceof AppError || (signal?.aborted && isAbortError(error))) throw error;
    throw new AppError(
      timeout.aborted
        ? 'The request took too long. Please try again.'
        : 'Could not connect. Check your connection and try again.',
      timeout.aborted ? 'timeout' : 'network',
    );
  }
}
