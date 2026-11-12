import { createStore } from './createStore';
import { errorMessage } from '../errors/AppError';
export interface ResourceState<T> {
  data: T;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}
/** Shared requests, explicit retry, last-good data, and protection against stale responses. */
export function createAsyncResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  options: {
    initialData: T;
    errorMessage: string;
    fallback?: (previous: T) => T;
  },
) {
  const store = createStore<ResourceState<T>>({
    data: options.initialData,
    status: 'idle',
    error: null,
  });
  let generation = 0;
  let controller: AbortController | undefined;
  let pending: Promise<void> | undefined;
  function load(force = false): Promise<void> {
    if (!force && pending) return pending;
    if (!force && store.getSnapshot().status !== 'idle') return Promise.resolve();
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const current = ++generation;
    store.set((previous) => ({ ...previous, status: 'loading', error: null }));
    pending = Promise.resolve()
      .then(() => loader(signal))
      .then((data) => {
        if (current === generation) store.set({ data, status: 'success', error: null });
      })
      .catch((error) => {
        if (current !== generation) return;
        store.set((previous) => ({
          data: options.fallback?.(previous.data) ?? previous.data,
          status: 'error',
          error: errorMessage(error, options.errorMessage),
        }));
      })
      .finally(() => {
        if (current === generation) pending = undefined;
      });
    return pending;
  }
  return { ...store, load, reload: () => load(true) };
}
