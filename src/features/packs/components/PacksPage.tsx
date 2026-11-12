import MotionGraphic from '../../../shared/motion/MotionGraphic';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, FolderArchive } from 'lucide-react';
import { WallpaperPack } from '../../../shared/types/catalogue';
import { usePacks } from '../hooks/usePacks';
import OptimizedImage from '../../../shared/components/OptimizedImage';
export default function PacksPage({
  onOpenPack,
  onHoverWallpaper,
  isDedicatedPage = false,
}: {
  onOpenPack: (pack: WallpaperPack) => void;
  onHoverWallpaper?: (url: string | null) => void;
  isDedicatedPage?: boolean;
}) {
  const { allPacks, desktopPacks, mobilePacks, loading, error } = usePacks();
  const [filter, setFilter] = useState('all');
  const handledLink = useRef('');
  useEffect(() => {
    let id = '';
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (!id || handledLink.current === id) return;
    const pack = allPacks.find((item) => item.id === id);
    if (pack) {
      handledLink.current = id;
      onOpenPack(pack);
    }
  }, [allPacks, onOpenPack]);
  const packs = filter === 'desktop' ? desktopPacks : filter === 'mobile' ? mobilePacks : allPacks;
  const Heading = isDedicatedPage ? 'h1' : 'h2';
  return (
    <section id="packs" className={`vw-packs page-shell ${isDedicatedPage ? 'vw-page' : ''}`}>
      <header className="vw-page-heading">
        <MotionGraphic variant="packs" className="vw-heading-graphic" />
        <Heading>
          GOOD THINGS.
          <br />
          IN PACKS<span className="vw-period">.</span>
        </Heading>
        <p>
          Wallpaper collections for a coordinated screen. Open a pack to preview each image, then
          download one or the whole set.
        </p>
      </header>
      <div className="vw-section-toolbar">
        <div className="segmented-control" role="group" aria-label="Filter wallpaper packs">
          {[
            ['all', 'All packs'],
            ['desktop', 'Desktop'],
            ['mobile', 'Phone'],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="micro-label">
          {packs.length} {packs.length === 1 ? 'collection' : 'collections'}
        </span>
      </div>
      {loading && !packs.length ? (
        <p className="vw-empty" role="status">
          Loading the pack collection…
        </p>
      ) : !packs.length ? (
        <div className="vw-empty">
          <FolderArchive size={40} strokeWidth={1} />
          <h2>{error ? "The packs couldn't load." : 'No packs here yet.'}</h2>
          <p>
            {error
              ? 'Please try again later. You can still browse individual wallpapers.'
              : 'New collections will appear here when they are ready. Explore the individual wallpapers in the meantime.'}
          </p>
          <a className="outline-button" href="/#gallery">
            Explore wallpapers <ArrowUpRight size={18} />
          </a>
        </div>
      ) : (
        <div className="vw-pack-grid">
          {packs.map((pack) => (
            <article className="vw-pack-card" id={pack.id} key={pack.id}>
              <button
                className="vw-pack-open"
                type="button"
                onClick={() => onOpenPack(pack)}
                onMouseEnter={() => onHoverWallpaper?.(pack.featuredImage)}
                onMouseLeave={() => onHoverWallpaper?.(null)}
                aria-label={`Preview ${pack.title} pack`}
              >
                <div className={`vw-pack-art ${pack.device === 'mobile' ? 'is-phone' : ''}`}>
                  <OptimizedImage
                    src={pack.featuredImage || pack.items[0]?.previewUrl}
                    alt={pack.title}
                    containerClassName="vw-full-image"
                  />
                  <span className="vw-pack-count micro-label">{pack.items.length} images</span>
                </div>
                <div className="vw-pack-description">
                  <span className="micro-label">
                    {pack.device === 'desktop' ? 'Desktop' : 'Phone'} / {pack.category}
                  </span>
                  <h2>
                    {pack.title}
                    <ArrowUpRight size={24} />
                  </h2>
                  <p>{pack.tagline}</p>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
