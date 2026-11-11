import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { gsap } from "gsap";
import { useWallpapers } from "../hooks/useWallpapers";
import { Wallpaper } from "../types";
import MotionGraphic from "./MotionGraphic";
import { useVisualEffects } from "../hooks/useVisualEffects";
import OptimizedImage from "./OptimizedImage";
import { sound } from "../lib/soundEffects";

export default function Hero({ onOpenModal, isOledOptimized, introReady = true }: {
  onOpenModal: (wallpaper: Wallpaper) => void;
  isOledOptimized: boolean;
  introReady?: boolean;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();
  const [device, setDevice] = useState<"desktop" | "mobile">(() => window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop");
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { reduceMotion, motionPaused } = useVisualEffects();
  const wallpaper = (device === "desktop" ? desktopWallpapers : mobileWallpapers)[0];

  useLayoutEffect(() => {
    if (!introReady || !rootRef.current || reduceMotion || motionPaused) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .fromTo(".vw-hero-line > span", { yPercent: 105 }, { yPercent: 0, duration: 0.85, stagger: 0.08 }, 0)
          .fromTo(".vw-hero-copy", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.3)
          .fromTo(".vw-specimen", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85 }, 0.15);
      }, rootRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, [introReady, reduceMotion, motionPaused]);

  useLayoutEffect(() => {
    if (loading || !previewRef.current || reduceMotion || motionPaused) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(previewRef.current, { opacity: 0.35, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
      return () => tween.revert();
    });
    return () => media.revert();
  }, [device, loading, reduceMotion, motionPaused]);

  return (
    <section ref={rootRef} className="vw-hero page-shell" aria-labelledby="hero-title" data-enter="gsap">
      <div className="vw-hero-registration"><span className="micro-label"><span className="vw-square" /> Voidwallz / digital collection</span><span className="micro-label">Desktop + phone</span></div>
      <div className="vw-hero-grid">
        <div className="vw-hero-text">
          <h1 id="hero-title" aria-label="Wallpapers for desktop and phone">
            <span className="vw-hero-line"><span>WALLPAPERS</span></span>
            <span className="vw-hero-line"><span>FOR DESKTOP</span></span>
            <span className="vw-hero-line vw-hero-last"><span>& PHONE<span className="vw-period">.</span></span></span>
          </h1>
          <div className="vw-hero-copy"><p>Choose a wallpaper. Preview it on your screen. Download a different view for every day.</p><a className="btn btn--primary vw-button" href="#gallery">Find a wallpaper <ArrowDownRight size={23} /></a></div>
        </div>
        <div className="vw-specimen">
          <div className="vw-specimen-top"><span className="micro-label">Featured wallpaper</span><ArrowUpRight size={20} /></div>
          <div className={`vw-specimen-stage ${device === "mobile" ? "vw-specimen-phone" : ""}`} ref={previewRef}>
            <MotionGraphic variant={device === "mobile" ? "phone-preview" : "desktop-preview"} className="vw-hero-graphic" /><span className="vw-register vw-register-tl" aria-hidden="true" /><span className="vw-register vw-register-br" aria-hidden="true" />
            {loading ? <div className="vw-feature-skeleton" role="status">Loading the collection…</div> : wallpaper ? <button className="vw-wallpaper-display m-zoom" type="button" onClick={() => { sound.playOpenModal(); onOpenModal(wallpaper); }} aria-label={`Preview ${wallpaper.title}`}>
              <OptimizedImage src={wallpaper.previewUrl} placeholder={wallpaper.tinyUrl} fallbackSrc={wallpaper.fallbackUrl} alt={wallpaper.title} priority containerClassName="vw-feature-image" className={isOledOptimized ? "oled-image" : ""} />
              <span className="vw-preview-corner"><ArrowUpRight size={20} /></span>
            </button> : <p className="vw-feature-skeleton">The collection is loading. Find a wallpaper below.</p>}
          </div>
          <div className="vw-specimen-bottom"><div className="vw-specimen-name"><span className="micro-label">Selected view</span><strong>{wallpaper?.title || "A new perspective"}</strong></div><div className="segmented-control" role="group" aria-label="Featured wallpaper device">{(["desktop", "mobile"] as const).map((value) => <button type="button" key={value} aria-pressed={device === value} aria-label={`Show ${value === "desktop" ? "desktop" : "phone"} wallpaper`} onClick={() => { sound.playTap(); setDevice(value); }}>{value === "desktop" ? <Monitor size={17} /> : <Smartphone size={17} />}</button>)}</div></div>
        </div>
      </div>
      <div className="vw-hero-bottom"><span className="micro-label">Independent images. Two screen formats.</span><a className="text-link" href="/packs" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); window.history.pushState(null, "", "/packs"); window.dispatchEvent(new Event("popstate")); }}>View wallpaper packs <ArrowUpRight size={16} /></a></div>
    </section>
  );
}
