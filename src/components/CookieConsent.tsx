import { useState, useEffect } from "react";
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!localStorage.getItem("voidwallz_cookie_consent")) { const timer = setTimeout(() => setVisible(true), 1200); return () => clearTimeout(timer); } }, []);
  const save = (value: string) => { localStorage.setItem("voidwallz_cookie_consent", value); setVisible(false); };
  if (!visible) return null;
  return <aside className="vw-cookie-notice" aria-label="Privacy preferences"><div><strong>Your privacy preferences.</strong><p>We store your display settings and saved wallpapers on this device. <a href="/cookies">Read the cookie policy</a>.</p></div><div className="vw-cookie-actions"><button className="outline-button" type="button" onClick={() => save("essential")}>Essential only</button><button className="btn btn--primary vw-button" type="button" onClick={() => save("all")}>Accept</button></div></aside>;
}
