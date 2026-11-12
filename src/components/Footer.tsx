import BrandLogo, { BrandStamp } from "./BrandLogo";
import { useVisualEffects } from "../hooks/useVisualEffects";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { navigateSiteLink } from "../lib/siteNavigation";

const groups = [
  { title: "Collection", links: [["Desktop", "/desktop"], ["Phone", "/mobile"], ["Wallpaper packs", "/packs"], ["Updates", "/updates"]] },
  { title: "Stay connected", links: [["Instagram", "https://www.instagram.com/voidwallz/"], ["X / Twitter", "https://x.com/voidwallz"], ["Discord", "https://discord.gg/xhWGaPp8H2"], ["Contact", "mailto:voidwallzbusiness@gmail.com"]] },
  { title: "Information", links: [["Image licence", "/license"], ["Report an issue", "/report"], ["Copyright", "/dmca"]] },
];
export default function Footer() {
  const { motionPaused, reduceMotion } = useVisualEffects();
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    navigateSiteLink(event, motionPaused || reduceMotion);
  };
  return (
    <footer className="vw-footer closing">
      <div className="page-shell">
        <div className="vw-footer-top"><h2>A new view<br />starts here.</h2><a href="/#gallery" className="btn btn--primary vw-button" onClick={(event) => navigate(event)}>Find a wallpaper <ArrowUpRight size={22} /></a></div>
        <div className="vw-footer-directory"><div className="vw-footer-identity"><a href="/" className="vw-footer-logo-link" aria-label="Voidwallz home" onClick={(event) => navigate(event)}><BrandLogo variant="mark" /></a><p>Independent wallpapers for<br />desktop and phone.</p></div>{groups.map((group) => <div className="vw-footer-group" key={group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <a key={href} href={href} onClick={(event) => navigate(event)} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{label}{href.startsWith("http") && <ArrowUpRight size={12} />}</a>)}</div>)}</div>
        <a className="vw-footer-wordmark vw-footer-signature" href="/" aria-label="Voidwallz home — back to top" onClick={(event) => navigate(event)}>
          <span className="vw-footer-letters" aria-hidden="true">{Array.from("VOIDWALLZ").map((letter, index) => <span className="vw-footer-letter" key={index} style={{ "--letter": index } as React.CSSProperties}><span>{letter}</span><span className="vw-footer-letter-echo">{letter}</span></span>)}</span><BrandStamp />
        </a>
        <div className="vw-footer-legal"><span>© {new Date().getFullYear()} Voidwallz</span><div>{[["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Refunds", "/refunds"]].map(([label, href]) => <a key={href} href={href} onClick={(event) => navigate(event)}>{label}</a>)}</div></div>
      </div>
    </footer>
  );
}
