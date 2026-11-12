import { useEffect, useSyncExternalStore } from 'react';
import { catalogueStore } from '../state/catalogueStore';
export function useWallpapers() {
  const state = useSyncExternalStore(
    catalogueStore.subscribe,
    catalogueStore.getSnapshot,
    catalogueStore.getSnapshot,
  );
  useEffect(() => {
    void catalogueStore.load();
  }, []);
  return {
    desktopWallpapers: state.data.desktop,
    mobileWallpapers: state.data.mobile,
    loading: state.status === 'idle' || state.status === 'loading',
    error: state.error ?? state.data.notice,
    isUsingFallback: state.data.isUsingFallback,
    reload: catalogueStore.reload,
  };
}
