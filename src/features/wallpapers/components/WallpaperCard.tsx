import React, { useState } from 'react';
import { ArrowUpRight, Check, Download, Heart, LoaderCircle } from 'lucide-react';
import { Wallpaper } from '../../../shared/types/catalogue';
import { useWallpaperStats } from '../hooks/useWallpaperStats';
import { downloadWallpaperAsPng } from '../../downloads/services/downloadWallpaper';
import { sound } from '../../../shared/services/soundEffects';
import OptimizedImage from '../../../shared/components/OptimizedImage';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onOpenModal: (wallpaper: Wallpaper) => void;
  isOledOptimized?: boolean;
  index?: number;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  onOpenModal,
  isOledOptimized = false,
  index = 0,
}) => {
  const { toggleFavorite, isFavorite, recordDownload } = useWallpaperStats();
  const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const saved = isFavorite(wallpaper.id);
  const download = async () => {
    if (downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      const downloaded = await downloadWallpaperAsPng(
        wallpaper.originalUrl || wallpaper.previewUrl,
        wallpaper.title,
        wallpaper.previewUrl,
      );
      if (!downloaded) throw new Error('Download unavailable');
      recordDownload(wallpaper.id);
      sound.playSuccess();
      setDownloadState('done');
    } catch {
      setDownloadState('error');
    }
  };
  const open = () => {
    sound.playOpenModal();
    onOpenModal(wallpaper);
  };
  return (
    <article className={`art-card card ${wallpaper.device === 'mobile' ? 'art-card-phone' : ''}`}>
      <div className="art-card-canvas">
        <button
          type="button"
          className="art-card-preview m-zoom"
          onClick={open}
          aria-label={`Preview ${wallpaper.title} wallpaper`}
        >
          <OptimizedImage
            src={wallpaper.previewUrl}
            placeholder={wallpaper.tinyUrl}
            fallbackSrc={wallpaper.fallbackUrl}
            alt={wallpaper.title}
            containerClassName="art-card-image"
            className={isOledOptimized ? 'oled-image' : ''}
          />
          <span className="art-card-preview-label">
            Preview wallpaper <ArrowUpRight size={14} />
          </span>
        </button>
        <span className="art-card-device micro-label">
          {wallpaper.device === 'desktop' ? 'Desktop' : 'Phone'}
        </span>
        <button
          type="button"
          className="art-card-save icon-button"
          onClick={() => {
            sound.playLike();
            toggleFavorite(wallpaper.id);
          }}
          aria-label={`${saved ? 'Remove' : 'Save'} ${wallpaper.title} ${saved ? 'from' : 'to'} favorites`}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="art-card-caption">
        <span className="art-card-number micro-label" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="art-card-info">
          <h3>
            <button type="button" onClick={open}>
              {wallpaper.title}
            </button>
          </h3>
          <p>{wallpaper.category}</p>
        </div>
        <button
          type="button"
          className="icon-button art-card-download"
          onClick={download}
          disabled={downloadState === 'loading'}
          aria-label={
            downloadState === 'loading'
              ? `Downloading ${wallpaper.title}`
              : downloadState === 'done'
                ? `Download ${wallpaper.title} again`
                : `Download ${wallpaper.title}`
          }
        >
          {downloadState === 'loading' ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : downloadState === 'done' ? (
            <Check size={17} />
          ) : (
            <Download size={17} />
          )}
        </button>
      </div>
      <p
        className={`art-card-status ${downloadState === 'error' ? 'text-red-300' : ''}`}
        role="status"
        aria-live="polite"
      >
        {downloadState === 'error'
          ? 'Download failed. Try again or open the preview.'
          : downloadState === 'loading'
            ? 'Preparing your download…'
            : downloadState === 'done'
              ? 'Download complete.'
              : ''}
      </p>
    </article>
  );
};

export default WallpaperCard;
