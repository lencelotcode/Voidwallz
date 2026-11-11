import { useEffect, useRef, useState } from "react";

/** Original sign-in scene: a profile and access key moving toward an open door. */
export default function AccountArtwork() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="vw-login-illustration" data-graphic="account-access" data-running={visible} aria-hidden="true">
    <svg viewBox="0 0 560 440" fill="none" focusable="false">
      <path className="login-ground" d="M28 374h498M80 401h390" />
      <path className="login-connection" d="M155 300h94c56 0 37-78 94-78h57" />
      <g className="login-door-frame"><rect x="337" y="48" width="164" height="326" rx="22" /><rect x="348" y="60" width="141" height="303" rx="12" className="login-door-opening" /><path d="M339 374h164" /></g>
      <g className="login-door-leaf"><path d="M348 61h141v302H348z" /><path d="M369 88h97v249h-97z" className="login-door-inset" /><circle cx="464" cy="221" r="5" className="login-handle" /></g>
      <path className="login-entry-arrow" d="M283 222h110m-22-22 22 22-22 22" />
      <g className="login-profile-card"><rect x="49" y="102" width="225" height="218" rx="20" /><path className="login-card-top" d="M49 146h225" /><circle cx="69" cy="125" r="3" /><circle cx="81" cy="125" r="3" /><circle cx="93" cy="125" r="3" />
        <circle className="login-avatar-ground" cx="105" cy="193" r="29" /><circle cx="105" cy="184" r="10" /><path d="M87 211v-4c0-20 36-20 36 0v4" />
        <path className="login-profile-lines" d="M153 179h90m-90 15h65m-65 15h79" />
        <rect className="login-password-field" x="74" y="240" width="175" height="44" rx="8" /><path d="M86 257v-4c0-9 13-9 13 0v4m-15 0h17v14H84z" />
        {[0,1,2,3,4,5].map(index => <circle key={index} className="login-password-dot" cx={122+index*20} cy="262" r="3.5" style={{ "--dot": index } as any} />)}
      </g>
      <g className="login-access-key"><circle cx="104" cy="337" r="32" /><circle cx="104" cy="337" r="10" /><path d="m126 315 42-42h21v20h-15v14h-16l-17 17" /></g>
      <path className="login-route-spark" d="M305 83v18m-9-9h18M519 292v14m-7-7h14M31 225v12m-6-6h12" />
    </svg>
  </div>;
}
