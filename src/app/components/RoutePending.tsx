import { useEffect, useState } from 'react';

/** A delayed, in-content hint for a genuinely slow page module, without an intro replay. */
export default function RoutePending() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="route-pending page-shell" aria-busy="true" aria-label="Loading page">
      {visible && (
        <div className="route-pending-hint" role="status">
          <span className="route-pending-track" aria-hidden="true">
            <span />
          </span>
          <span className="micro-label">Opening page…</span>
        </div>
      )}
    </section>
  );
}
