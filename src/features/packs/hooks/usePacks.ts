import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { packsStore } from '../state/packsStore';
export function usePacks() {
  const state = useSyncExternalStore(
    packsStore.subscribe,
    packsStore.getSnapshot,
    packsStore.getSnapshot,
  );
  useEffect(() => {
    void packsStore.load();
  }, []);
  const desktopPacks = useMemo(
    () => state.data.filter((pack) => pack.device === 'desktop'),
    [state.data],
  );
  const mobilePacks = useMemo(
    () => state.data.filter((pack) => pack.device === 'mobile'),
    [state.data],
  );
  return {
    allPacks: state.data,
    desktopPacks,
    mobilePacks,
    loading: state.status === 'idle' || state.status === 'loading',
    error: state.error,
    reload: packsStore.reload,
  };
}
