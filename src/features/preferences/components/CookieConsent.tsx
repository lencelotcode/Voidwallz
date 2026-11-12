import {
  preferencesStore,
  saveConsent,
  type ConsentChoice,
} from '../../../shared/state/preferencesStore';
import { useState, useEffect, useSyncExternalStore } from 'react';
export default function CookieConsent() {
  const { consent } = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getSnapshot,
  );
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (consent) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [consent]);
  const save = (value: Exclude<ConsentChoice, null>) => {
    saveConsent(value);
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <aside
      className="vw-cookie-notice"
      aria-labelledby="cookie-notice-title"
      aria-describedby="cookie-notice-purpose cookie-notice-privacy"
    >
      <div>
        <strong id="cookie-notice-title">Why we use cookies &amp; browser storage.</strong>
        <p id="cookie-notice-purpose">
          We remember your saved wallpapers, display, sound and motion preferences, and your privacy
          choice on this device, so you don’t have to set them again on your next visit.
        </p>
        <p id="cookie-notice-privacy">
          We don’t use advertising cookies or cross-site tracking. A security cookie is used only
          when you sign in to the publishing studio. <a href="/cookies">Read the cookie policy</a>.
        </p>
      </div>
      <div className="vw-cookie-actions">
        <button className="outline-button" type="button" onClick={() => save('essential')}>
          Essential only
        </button>
        <button className="btn btn--primary vw-button" type="button" onClick={() => save('all')}>
          Accept
        </button>
      </div>
    </aside>
  );
}
