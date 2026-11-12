import BrandLogo from '../../shared/components/BrandLogo';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useVisualEffects } from '../../shared/hooks/useVisualEffects';
import { gsap } from 'gsap';

export default function IntroLoader({
  ready = true,
  onComplete,
}: {
  ready?: boolean;
  onComplete: () => void;
}) {
  const { reduceMotion } = useVisualEffects();
  const [introComplete, setIntroComplete] = useState(false);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const skipRef = useRef<HTMLButtonElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        '.void-loader-wordmark',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
      );
      gsap.fromTo(
        '.void-loader-emblem',
        { scale: 0.9 },
        { scale: 1, duration: 0.7, ease: 'power3.out' },
      );
    }, markRef);
    return () => context.revert();
  }, [reduceMotion]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    const minimum = window.setTimeout(() => setIntroComplete(true), reduceMotion ? 100 : 800);
    // A slow connection must never trap visitors behind the introduction.
    const maximum = window.setTimeout(finish, reduceMotion ? 1200 : 2400);
    return () => {
      window.clearTimeout(minimum);
      window.clearTimeout(maximum);
    };
  }, [finish, reduceMotion]);

  useEffect(() => {
    if (ready && introComplete) finish();
  }, [ready, introComplete, finish]);

  useEffect(() => {
    // Keep this independent of the body locks used by wallpaper/account dialogs.
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    skipRef.current?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        skipRef.current?.focus({ preventScroll: true });
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [finish]);

  return (
    <motion.div
      className="void-loader"
      role="dialog"
      aria-modal="true"
      aria-label="Loading Voidwallz"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="void-loader-top micro-label">
        <span>Voidwallz®</span>
        <span>Loading the collection</span>
      </div>
      <div className="void-loader-center" ref={markRef}>
        <div className="void-loader-emblem" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="void-loader-orbit" fill="none">
            <circle
              cx="100"
              cy="100"
              r="83"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="0.75"
            />
            <circle
              className="void-loader-arc"
              cx="100"
              cy="100"
              r="83"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="80 442"
              strokeLinecap="round"
            />
            <path
              d="M100 8v9m0 166v9M8 100h9m166 0h9"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1"
            />
          </svg>
          <BrandLogo variant="mark" className="vw-loader-brand" />
        </div>
        <div className="void-loader-wordmark" aria-hidden="true">
          voidwallz<span>®</span>
        </div>
        <p className="void-loader-tagline">Wallpapers for desktop and phone.</p>
        <div className="void-loader-status" role="status" aria-live="polite">
          <span className="status-dot" />
          <span>{ready ? 'Your next view awaits' : 'Finding your next view'}</span>
        </div>
        <div className="void-loader-line" aria-hidden="true">
          <span />
        </div>
      </div>
      <div className="void-loader-bottom">
        <span className="micro-label">Wallpaper beyond reality</span>
        <button ref={skipRef} type="button" className="void-loader-skip" onClick={finish}>
          Skip intro <ArrowUpRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
