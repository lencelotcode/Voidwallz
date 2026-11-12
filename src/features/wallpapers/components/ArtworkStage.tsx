import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Pause, Play } from 'lucide-react';
import { Wallpaper } from '../../../shared/types/catalogue';
import { useVisualEffects } from '../../../shared/hooks/useVisualEffects';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import MotionGraphic from '../../../shared/motion/MotionGraphic';

export default function ArtworkStage({
  wallpaper,
  mode,
  isOledOptimized = false,
}: {
  wallpaper: Wallpaper;
  mode: string;
  isOledOptimized?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduceMotion, motionPaused, toggleMotion } = useVisualEffects();
  const phone = wallpaper.device === 'mobile';
  const screen = mode === 'screen';
  useLayoutEffect(() => {
    if (reduceMotion || motionPaused) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        '.vw-device-entrance',
        { y: 18, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
      );
    }, ref);
    return () => context.revert();
  }, [wallpaper.id, mode, reduceMotion, motionPaused]);
  return (
    <div
      ref={ref}
      className={`vw-artwork-stage ${phone ? 'is-phone' : 'is-desktop'} ${screen ? 'is-screen' : 'is-art'}`}
    >
      <div className="vw-stage-halo" aria-hidden="true" />
      <MotionGraphic
        variant={screen ? (phone ? 'phone-preview' : 'desktop-preview') : 'artwork'}
        className="vw-stage-graphic"
      />
      <div className="vw-device-entrance">
        <div
          className={`vw-device ${screen ? (phone ? 'vw-phone' : 'vw-monitor') : 'vw-original-art'}`}
        >
          <div className="vw-device-screen">
            <OptimizedImage
              src={wallpaper.previewUrl}
              placeholder={wallpaper.tinyUrl}
              fallbackSrc={wallpaper.fallbackUrl}
              alt={wallpaper.title}
              priority
              containerClassName="vw-device-image"
              className={isOledOptimized ? 'oled-image' : ''}
            />
          </div>
          {screen && !phone && (
            <>
              <span className="vw-monitor-chin" aria-hidden="true">
                VOIDWALLZ
              </span>
              <span className="vw-monitor-stand" aria-hidden="true" />
            </>
          )}
          {screen && phone && (
            <>
              <i className="vw-phone-volume" aria-hidden="true" />
              <i className="vw-phone-power" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        className="icon-button vw-stage-motion"
        disabled={reduceMotion}
        onClick={toggleMotion}
        aria-label={
          reduceMotion
            ? 'Preview animations reduced by device setting'
            : motionPaused
              ? 'Play preview animations'
              : 'Pause preview animations'
        }
        aria-pressed={!motionPaused && !reduceMotion}
      >
        {motionPaused || reduceMotion ? <Play size={13} /> : <Pause size={13} />}
      </button>
      <span className="vw-stage-note micro-label">
        {screen
          ? phone
            ? 'Phone preview · image crops to fit'
            : 'Desktop preview'
          : 'Original composition · uncropped'}
      </span>
    </div>
  );
}
