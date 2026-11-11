import { useEffect, useRef } from "react";
import { registerDialog } from "../lib/dialogState";
import { useVisualEffects } from "./useVisualEffects";
import { gsap } from "gsap";

/** Shared focus, scroll, and entrance behaviour for every Voidwallz dialog. */
export function useDialog(open: boolean, onClose: () => void) {
  const { motionPaused, reduceMotion } = useVisualEffects();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !ref.current) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const releaseDialog = registerDialog();
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => (ref.current?.querySelector<HTMLElement>("[data-autofocus], button:not([disabled]), input") || ref.current)?.focus({ preventScroll: true }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const elements = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]');
      if (!elements?.length) { event.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      releaseDialog();
      requestAnimationFrame(() => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
    };
  }, [open]);
  useEffect(() => {
    if (!open || motionPaused || reduceMotion) return;
    const context = gsap.context(() => {
      gsap.fromTo(".vw-dialog-panel", { y: 24, scale: .985, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .5, ease: "power3.out", clearProps: "transform,opacity" });
      gsap.fromTo(".vw-dialog-backdrop", { opacity: 0 }, { opacity: 1, duration: .3 });
    }, ref);
    return () => context.revert();
  }, [open, motionPaused, reduceMotion]);
  return ref;
}
