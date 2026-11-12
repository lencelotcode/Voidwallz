import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link2,
  LoaderCircle,
  Monitor,
  Smartphone,
  X,
} from 'lucide-react';
import { Wallpaper } from '../../../shared/types/catalogue';
import { useWallpapers } from '../hooks/useWallpapers';
import { useWallpaperStats } from '../hooks/useWallpaperStats';
import { useDialog } from '../../../shared/hooks/useDialog';
import { changeWallpaper, wallpaperUrl } from '../../../app/routing/wallpaperNavigation';
import { downloadWallpaperAsPng } from '../../downloads/services/downloadWallpaper';
import ArtworkStage from './ArtworkStage';

export default function WallpaperPreview({
  selectedWp,
  onClose,
  isOledOptimized = false,
}: {
  selectedWp: Wallpaper | null;
  onClose: () => void;
  isOledOptimized?: boolean;
}) {
  const [mode, setMode] = useState<'screen' | 'art'>('screen');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState('');
  const ref = useDialog(Boolean(selectedWp), onClose);
  const { desktopWallpapers, mobileWallpapers } = useWallpapers();
  const { toggleFavorite, isFavorite, recordDownload } = useWallpaperStats();
  const items = selectedWp?.device === 'desktop' ? desktopWallpapers : mobileWallpapers;
  const index = items.findIndex((item) => item.id === selectedWp?.id);
  const move = (direction: number) => {
    const next = items[index + direction];
    if (next && status !== 'loading') changeWallpaper(next);
  };
  useEffect(() => {
    setMode('screen');
    setStatus('idle');
    setShareStatus('');
  }, [selectedWp?.id]);
  useEffect(() => {
    if (!selectedWp) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [selectedWp?.id, items, status]);
  if (!selectedWp) return null;
  const saved = isFavorite(selectedWp.id);
  const download = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const ok = await downloadWallpaperAsPng(
        selectedWp.originalUrl || selectedWp.previewUrl,
        selectedWp.title,
        selectedWp.previewUrl,
      );
      if (!ok) throw new Error('Download failed');
      recordDownload(selectedWp.id);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${wallpaperUrl(selectedWp)}`);
      setShareStatus('Link copied.');
    } catch {
      setShareStatus("Couldn't copy the link. You can copy the page address instead.");
    }
  };
  return createPortal(
    <div
      ref={ref}
      className="vw-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallpaper-detail-title"
      tabIndex={-1}
    >
      <div className="vw-dialog-backdrop" onClick={onClose} />
      <div
        className={`vw-dialog-panel vw-detail-panel ${selectedWp.device === 'mobile' ? 'vw-phone-panel' : ''}`}
      >
        <div className="vw-dialog-heading">
          <span className="micro-label">Voidwallz / wallpaper preview</span>
          <button
            type="button"
            className="icon-button"
            data-autofocus
            aria-label="Close wallpaper preview"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <div className="vw-detail-layout">
          <div className="vw-detail-visual">
            <div className="vw-detail-tools">
              <div className="segmented-control" role="group" aria-label="Wallpaper preview style">
                <button
                  type="button"
                  aria-pressed={mode === 'screen'}
                  onClick={() => setMode('screen')}
                >
                  Screen preview
                </button>
                <button type="button" aria-pressed={mode === 'art'} onClick={() => setMode('art')}>
                  Full artwork
                </button>
              </div>
              <span className="micro-label">
                {selectedWp.device === 'desktop' ? <Monitor size={15} /> : <Smartphone size={15} />}
                {selectedWp.device === 'desktop' ? 'Desktop' : 'Phone'}
              </span>
            </div>
            <ArtworkStage wallpaper={selectedWp} mode={mode} isOledOptimized={isOledOptimized} />
            <div className="vw-detail-pagination">
              <button
                className="text-link"
                type="button"
                disabled={index <= 0 || status === 'loading'}
                onClick={() => move(-1)}
              >
                <ChevronLeft size={17} />
                Previous
              </button>
              <span className="micro-label">
                {index >= 0
                  ? `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`
                  : 'Selected wallpaper'}
              </span>
              <button
                className="text-link"
                type="button"
                disabled={index >= items.length - 1 || status === 'loading'}
                onClick={() => move(1)}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <div className="vw-detail-info">
            <h2 id="wallpaper-detail-title">{selectedWp.title}</h2>
            <p className="vw-detail-intro">
              Preview the artwork, then download the original image for your screen.
            </p>
            <dl className="vw-spec-list">
              {selectedWp.serial && (
                <div>
                  <dt>Catalog ID</dt>
                  <dd>{selectedWp.serial}</dd>
                </div>
              )}
              <div>
                <dt>Category</dt>
                <dd>{selectedWp.category}</dd>
              </div>
              <div>
                <dt>File</dt>
                <dd>{selectedWp.format || 'Original image'}</dd>
              </div>
              <div>
                <dt>Screen</dt>
                <dd>{selectedWp.device === 'desktop' ? 'Desktop / laptop' : 'Phone'}</dd>
              </div>
            </dl>
            <div className="vw-detail-actions">
              <button
                className="outline-button"
                type="button"
                aria-pressed={saved}
                onClick={() => toggleFavorite(selectedWp.id)}
              >
                <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved to collection' : 'Save wallpaper'}
              </button>
              <button className="outline-button" type="button" onClick={copy}>
                <Link2 size={17} />
                Copy image link
              </button>
            </div>
            <div className="vw-download-block">
              <button
                className="btn btn--primary vw-button"
                type="button"
                onClick={download}
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? 'Preparing image…'
                  : status === 'success'
                    ? 'Download again'
                    : 'Download original'}
                {status === 'loading' ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : status === 'success' ? (
                  <Check size={20} />
                ) : (
                  <ArrowDownToLine size={20} />
                )}
              </button>
              <p
                className={status === 'error' ? 'vw-form-error' : 'vw-action-status'}
                role="status"
              >
                {status === 'error'
                  ? 'Download failed. Please try again.'
                  : shareStatus ||
                    (status === 'success'
                      ? 'Download complete.'
                      : 'Original image. Personal use — see the licence.')}
              </p>
              <a className="text-link" href="/license">
                Read image licence <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
