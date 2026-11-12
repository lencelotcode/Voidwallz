import { useSyncExternalStore } from 'react';
import { createStore } from '../../shared/state/createStore';
import { collectionLocation } from './wallpaperNavigation';
function readLocation() {
  const collection = collectionLocation();
  return {
    pathname: window.location.pathname,
    hash: window.location.hash,
    collectionPath: collection.pathname,
    collectionHash: collection.hash,
  };
}
const initial =
  typeof window === 'undefined'
    ? { pathname: '/', hash: '', collectionPath: '/', collectionHash: '' }
    : readLocation();
const locationStore = createStore(initial);
if (typeof window !== 'undefined') {
  const sync = () => locationStore.set(readLocation());
  for (const event of ['popstate', 'hashchange', 'wallpaper-navigate'])
    window.addEventListener(event, sync);
}
export function useBrowserLocation() {
  return useSyncExternalStore(
    locationStore.subscribe,
    locationStore.getSnapshot,
    locationStore.getSnapshot,
  );
}
