/** The supplied artwork, framed in SVG viewports without redrawing the logo. */
export default function BrandLogo({ variant = "lockup", className = "" }: { variant?: "lockup" | "mark"; className?: string }) {
  return <span className={`vw-brand-logo ${variant === "mark" ? "is-mark" : "is-lockup"} ${className}`} aria-hidden="true">
    <span className="vw-brand-logo-mark"><svg viewBox="104 193 325 297" focusable="false"><image href="/brand/voidwallz-logo.png" width="2048" height="682" /></svg><span className="vw-brand-logo-glint" /></span>
    {variant === "lockup" && <svg className="vw-brand-logo-name" viewBox="470 245 1480 204" focusable="false"><image href="/brand/voidwallz-logo.png" width="2048" height="682" /></svg>}
  </span>;
}

export function BrandStamp() {
  return <span className="vw-brand-stamp" aria-hidden="true">
    <svg viewBox="0 0 220 220" fill="none" className="vw-brand-stamp-orbit" focusable="false"><circle cx="110" cy="110" r="99" stroke="currentColor" strokeOpacity=".18" /><circle className="vw-brand-stamp-ring" cx="110" cy="110" r="90" stroke="currentColor" strokeDasharray="3 13" /><path d="M110 2v18m0 180v18M2 110h18m180 0h18" stroke="currentColor" strokeOpacity=".5" /><circle cx="110" cy="20" r="5" fill="currentColor" /></svg>
    <BrandLogo variant="mark" />
    <svg viewBox="0 0 220 220" fill="none" className="vw-brand-stamp-corners" focusable="false"><path d="M23 62V23h39m96 0h39v39m0 96v39h-39M62 197H23v-39" stroke="currentColor" /></svg>
  </span>;
}
