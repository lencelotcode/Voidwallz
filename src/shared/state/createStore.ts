/** Small synchronous external store. Snapshots stay stable until an update. */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(update: T | ((previous: T) => T)) {
      const next = typeof update === 'function' ? (update as (previous: T) => T)(state) : update;
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
  };
}
