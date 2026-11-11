import { useEffect, useRef, useState } from "react";
import PageIllustration, { GraphicVariant } from "./PageIllustrations";

function useVisibleLoop() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "60px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

/** Context-specific illustrations pause when their owning section is off screen. */
export default function MotionGraphic({ variant, className = "" }: { variant: GraphicVariant; className?: string }) {
  const { ref, visible } = useVisibleLoop();
  return <div ref={ref} className={`vw-motion-graphic ${className}`} data-graphic={variant} data-running={visible} aria-hidden="true">
    <svg viewBox="0 0 300 300" fill="none" focusable="false" className="semantic-illustration"><PageIllustration variant={variant} /></svg>
  </div>;
}

export function KineticRibbon() {
  const { ref, visible } = useVisibleLoop();
  return <div ref={ref} data-running={visible} className="vw-kinetic-ribbon" aria-hidden="true"><div>{[0,1].map(i => <span key={i}>CHANGE YOUR VIEW <b>↗</b> DESKTOP & PHONE <b>✳</b> VOIDWALLZ <b>↗</b> </span>)}</div></div>;
}
