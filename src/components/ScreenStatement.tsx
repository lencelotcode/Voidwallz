import { useEffect, useRef } from "react";
import { ArrowDownRight } from "lucide-react";
import MotionGraphic from "./MotionGraphic";
import { useVisualEffects } from "../hooks/useVisualEffects";
import wordHighlight from "../vendor/taste/moments/word-highlight/moment.js";
import * as momentLibrary from "../vendor/taste/moments/lib.js";

export default function ScreenStatement() {
  const rootRef = useRef<HTMLElement>(null);
  const { reduceMotion, motionPaused } = useVisualEffects();
  useEffect(() => {
    const root = rootRef.current;
    const text = root?.querySelector<HTMLElement>(".mo-wh__text");
    if (!root || !text) return;
    const original = text.innerHTML;
    const instance = wordHighlight(root, { from: 0.88, to: 0.35 }, { ...momentLibrary, reduced: () => reduceMotion || motionPaused });
    root.dataset.momentsReady = "true";
    return () => {
      instance.destroy?.();
      text.innerHTML = original;
      text.removeAttribute("aria-label");
      root.classList.remove("mo-wh", "is-done");
    };
  }, [reduceMotion, motionPaused]);
  return (
    <section ref={rootRef} className="vw-statement" data-moment="word-highlight" aria-labelledby="statement-title">
      <div className="page-shell container">
        <div className="vw-section-line"><span className="micro-label">The process</span><ArrowDownRight size={28} /></div>
        <div className="vw-statement-title"><h2 id="statement-title">Your wallpaper.<br />Your choice.</h2><MotionGraphic variant="workflow" /></div>
        <p className="mo-wh__text">Find a wallpaper you like. Preview the composition. Save it for later, or download it for the screen in front of you.</p>
        <div className="vw-process"><span><b>01</b> Find a wallpaper</span><span><b>02</b> Preview your screen</span><span><b>03</b> Download the image</span></div>
      </div>
    </section>
  );
}
