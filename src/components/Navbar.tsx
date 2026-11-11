import BrandLogo from "./BrandLogo";
import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LogOut, Menu, Pause, Play, User, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { sound } from "../lib/soundEffects";
import { registerDialog } from "../lib/dialogState";
import { useVisualEffects } from "../hooks/useVisualEffects";
import { useAuth } from "../hooks/useAuth";

export type AtmosphereMode = "standard" | "oled" | "crt" | "noir";
const links = [{ path: "/", label: "Discover" }, { path: "/desktop", label: "Desktop" }, { path: "/mobile", label: "Phone" }, { path: "/packs", label: "Packs" }, { path: "/updates", label: "Journal" }];

export default function Navbar({ isOledOptimized, setIsOledOptimized, atmosphereMode = "standard", setAtmosphereMode }: {
  isOledOptimized?: boolean;
  setIsOledOptimized?: (value: boolean) => void;
  atmosphereMode?: AtmosphereMode;
  setAtmosphereMode?: (value: AtmosphereMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { motionPaused, toggleMotion, reduceMotion } = useVisualEffects();
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const { user, openAuthModal, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mode = atmosphereMode || (isOledOptimized ? "oled" : "standard");
  const setMode = (value: AtmosphereMode) => {
    sound.playSwitch();
    if (setAtmosphereMode) setAtmosphereMode(value);
    else setIsOledOptimized?.(value === "oled");
  };
  useEffect(() => {
    const syncSound = () => setIsMuted(sound.getIsMuted());
    const syncPath = () => { setPath(window.location.pathname); setIsOpen(false); setUserMenuOpen(false); };
    window.addEventListener("voidwallz-sfx-toggled", syncSound);
    window.addEventListener("popstate", syncPath);
    window.addEventListener("wallpaper-navigate", syncPath);
    return () => { window.removeEventListener("voidwallz-sfx-toggled", syncSound); window.removeEventListener("popstate", syncPath); window.removeEventListener("wallpaper-navigate", syncPath); };
  }, []);
  useEffect(() => {
    if (!userMenuOpen) return;
    const outside = (event: MouseEvent) => { if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setUserMenuOpen(false); };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [userMenuOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const releaseDialog = registerDialog();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>("button, a, select")?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key !== "Tab") return;
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); releaseDialog(); requestAnimationFrame(() => menuButtonRef.current?.focus()); };
  }, [isOpen]);
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, destination: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); sound.playTap();
    if (window.location.pathname === destination) window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    window.history.pushState(null, "", destination); window.dispatchEvent(new Event("popstate")); setIsOpen(false);
  };
  const active = (destination: string) => destination === "/" ? path === "/" : path === destination || path.startsWith(`${destination}/`);
  const atmosphereControl = (id: string) => <><label className="sr-only" htmlFor={id}>Visual atmosphere</label><select id={id} className="studio-select atmosphere-select" value={mode} onChange={(event) => setMode(event.target.value as AtmosphereMode)}><option value="standard">Paper</option><option value="oled">OLED pure</option><option value="crt">CRT scan</option><option value="noir">Noir grain</option></select></>;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="studio-header">
      <div className="page-shell studio-nav">
        <a href="/" onClick={(event) => navigate(event, "/")} className="studio-brand" aria-label="Voidwallz home"><BrandLogo /></a>
        <nav aria-label="Main navigation" className="studio-nav-links">{links.map((link) => <a key={link.path} href={link.path} onClick={(event) => navigate(event, link.path)} aria-current={active(link.path) ? "page" : undefined}>{link.label}</a>)}</nav>
        <div className="studio-nav-actions">
          <div className="desktop-atmosphere">{atmosphereControl("desktop-atmosphere")}</div>
          <button type="button" className="icon-button desktop-sound-toggle" onClick={() => sound.toggleMute()} aria-label={isMuted ? "Enable sound effects" : "Mute sound effects"} aria-pressed={!isMuted}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
          <button type="button" className="icon-button motion-toggle" onClick={toggleMotion} disabled={reduceMotion} aria-label={reduceMotion ? "Animations reduced by device setting" : motionPaused ? "Play animations" : "Pause animations"} aria-pressed={!motionPaused && !reduceMotion} title={reduceMotion ? "Reduced motion is enabled on your device" : motionPaused ? "Play animations" : "Pause animations"}>{motionPaused || reduceMotion ? <Play size={16} /> : <Pause size={16} />}</button>
          {!user ? <button type="button" className="nav-signin" onClick={() => openAuthModal("signin")}>Sign in <ArrowUpRight size={13} /></button> : <div className="nav-account" ref={userMenuRef}>
            <button type="button" className="icon-button" aria-label="Account options" aria-expanded={userMenuOpen} aria-controls="account-options" onClick={() => setUserMenuOpen(!userMenuOpen)}><User size={17} /></button>
            {userMenuOpen && <div id="account-options" className="account-popover"><strong>{user.name || "Your account"}</strong><span>{user.email}</span><button type="button" className="text-link" onClick={() => { setUserMenuOpen(false); void signOut(); }}><LogOut size={14} /> Sign out</button></div>}
          </div>}
          <button ref={menuButtonRef} type="button" className="icon-button mobile-menu-button" aria-label="Open navigation menu" aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen(true)}><Menu size={21} /></button>
        </div>
      </div>
    </header>
    {createPortal(<AnimatePresence>{isOpen && <motion.div id="mobile-navigation" ref={drawerRef} role="dialog" aria-modal="true" aria-label="Navigation" className="studio-mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="mobile-menu-top"><span className="micro-label">A different perspective</span><button type="button" className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu"><X size={22} /></button></div>
      <nav aria-label="Mobile navigation">{links.map((link, index) => <a key={link.path} href={link.path} onClick={(event) => navigate(event, link.path)} aria-current={active(link.path) ? "page" : undefined}><span className="micro-label">0{index + 1}</span>{link.label}<ArrowUpRight size={24} /></a>)}</nav>
      <div className="mobile-menu-bottom"><div><span className="micro-label">Sound effects</span><button type="button" className="outline-button" onClick={() => sound.toggleMute()} aria-pressed={!isMuted}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}{isMuted ? "Sound off" : "Sound on"}</button></div><div><span className="micro-label">Set the atmosphere</span>{atmosphereControl("mobile-atmosphere")}</div>{!user && <><button type="button" className="outline-button" onClick={() => { setIsOpen(false); openAuthModal("signup"); }}>Create an account <ArrowUpRight size={15} /></button><button type="button" className="text-link" onClick={() => { setIsOpen(false); openAuthModal("signin"); }}>Already a member? Sign in <ArrowUpRight size={15} /></button></>}</div>
    </motion.div>}</AnimatePresence>, document.body)}
  </>;
}
