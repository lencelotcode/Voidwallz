type StorageKind = 'local' | 'session';
function storage(kind: StorageKind): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}
/** Storage is optional: private mode, malformed data and quota errors must not break UI. */
export function readStoredString(key: string, fallback = '', kind: StorageKind = 'local') {
  try {
    return storage(kind)?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeStoredString(key: string, value: string, kind: StorageKind = 'local') {
  try {
    const target = storage(kind);
    if (!target) return false;
    target.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function removeStoredValue(key: string, kind: StorageKind = 'local') {
  try {
    storage(kind)?.removeItem(key);
  } catch {
    /* No persistence available. */
  }
}
export function readStoredJson<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const value: unknown = JSON.parse(readStoredString(key, 'null'));
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function writeStoredJson(key: string, value: unknown) {
  try {
    return writeStoredString(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
