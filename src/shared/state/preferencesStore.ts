import { createStore } from './createStore';
import { readStoredString, writeStoredString } from '../storage/browserStorage';
export type ConsentChoice = 'essential' | 'all' | null;
function readPreferences() {
  const consent = readStoredString('voidwallz_cookie_consent');
  return {
    motionPaused: readStoredString('voidwallz_motion_paused') === 'true',
    consent: consent === 'all' || consent === 'essential' ? (consent as ConsentChoice) : null,
  };
}
export const preferencesStore = createStore(readPreferences());
export function toggleMotion() {
  const previous = preferencesStore.getSnapshot();
  const motionPaused = !previous.motionPaused;
  preferencesStore.set({ ...previous, motionPaused });
  writeStoredString('voidwallz_motion_paused', String(motionPaused));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('voidwallz-motion-changed'));
}
export function saveConsent(consent: Exclude<ConsentChoice, null>) {
  preferencesStore.set((previous) => ({ ...previous, consent }));
  writeStoredString('voidwallz_cookie_consent', consent);
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event) => {
    if (
      event.key === null ||
      ['voidwallz_motion_paused', 'voidwallz_cookie_consent'].includes(event.key)
    )
      preferencesStore.set(readPreferences());
  });
