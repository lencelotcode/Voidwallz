import { useId, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { getDownloadActivity, subscribeDownloads } from '../state/downloadStore';

/** Informative and non-blocking: it never takes focus or delays the file. */
export default function DownloadFeedback() {
  const activity = useSyncExternalStore(subscribeDownloads, getDownloadActivity, () => null);
  const clip = `download-art-${useId().replace(/[^a-z0-9]/gi, '')}`;
  if (!activity) return null;
  const { phase, kind, title, preview, prepared, total } = activity;
  const heading =
    phase === 'ready'
      ? 'Download complete'
      : phase === 'error'
        ? "Couldn't prepare download"
        : phase === 'packing'
          ? 'Creating your ZIP'
          : kind === 'pack'
            ? 'Gathering your collection'
            : 'Preparing your wallpaper';
  const detail =
    phase === 'ready'
      ? 'File prepared and sent to your browser.'
      : phase === 'error'
        ? 'Please try the download again.'
        : kind === 'pack' && total
          ? `${prepared} of ${total} images prepared`
          : 'Getting your PNG ready.';
  return createPortal(
    <aside
      key={`${activity.id}-${phase}`}
      className={`vw-download-notice is-${phase}`}
      aria-label="Download activity"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <svg
        className="vw-download-scene"
        viewBox="0 0 150 112"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clip}>
            <rect x="50" y="12" width="50" height="57" rx="5" />
          </clipPath>
        </defs>
        <path className="download-orbit-line" d="M22 60a53 53 0 0 1 106 0" strokeDasharray="2 7" />
        <g className="download-art-card">
          {kind === 'pack' && (
            <>
              <rect x="43" y="5" width="50" height="57" rx="5" className="download-card-back" />
              <rect x="47" y="9" width="50" height="57" rx="5" className="download-card-back" />
            </>
          )}
          <rect x="49" y="11" width="52" height="59" rx="6" className="download-card-paper" />
          <g clipPath={`url(#${clip})`}>
            <path d="M50 12h50v57H50z" className="download-art-ground" />
            <path d="m51 60 17-21 12 12 9-9 15 19" />
            <circle cx="88" cy="27" r="5" />
            {preview && phase !== 'error' && (
              <image
                href={preview}
                x="50"
                y="12"
                width="50"
                height="57"
                preserveAspectRatio="xMidYMid slice"
              />
            )}
          </g>
        </g>
        <g className="download-direction">
          <path d="M75 62v22m-9-9 9 9 9-9" />
        </g>
        <path className="download-tray" d="M40 84v14h70V84m-70 14h70" />
        {phase === 'ready' && (
          <g className="download-confirm">
            <circle cx="116" cy="77" r="14" />
            <path d="m109 77 5 5 9-10" />
          </g>
        )}
        {phase === 'error' && (
          <g className="download-error">
            <circle cx="116" cy="77" r="14" />
            <path d="M116 70v9m0 5v1" />
          </g>
        )}
      </svg>
      <div className="vw-download-message">
        <span className="vw-download-format">
          VOIDWALLZ / {kind === 'pack' ? 'ZIP PACK' : 'PNG IMAGE'}
        </span>
        <strong>{heading}</strong>
        <span className="vw-download-title">{title}</span>
        <p>{detail}</p>
        {(phase === 'preparing' || phase === 'packing') && (
          <span className="download-working-track" aria-hidden="true">
            <span />
          </span>
        )}
      </div>
    </aside>,
    document.body,
  );
}
