import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { ArrowDown, Heart, Monitor, Search, Smartphone, X } from "lucide-react";
import { Wallpaper } from "../types";
import { useWallpapers } from "../hooks/useWallpapers";
import { useWallpaperStats } from "../hooks/useWallpaperStats";
import WallpaperCard from "./WallpaperCard";

export default function Gallery({ view = "all", onOpenModal, isOledOptimized = false }: {
  view?: "all" | "desktop" | "phone";
  onOpenModal: (wallpaper: Wallpaper) => void;
  isOledOptimized?: boolean;
  onHoverWallpaper?: (url: string | null) => void;
}) {
  const { desktopWallpapers, mobileWallpapers, loading, isUsingFallback, reload } = useWallpapers();
  const { isFavorite } = useWallpaperStats();
  const [device, setDevice] = useState<"all" | "desktop" | "phone">(view);
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query.trim().toLowerCase());
  const [category, setCategory] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const searchId = useId();
  useEffect(() => { setDevice(view); setCategory(""); }, [view]);
  useEffect(() => { setVisibleCount(12); }, [device, search, category, favoritesOnly, sort]);
  const wallpapers = useMemo(() => [...desktopWallpapers, ...mobileWallpapers], [desktopWallpapers, mobileWallpapers]);
  const available = wallpapers.filter((wallpaper) => device === "all" || wallpaper.device === (device === "phone" ? "mobile" : "desktop"));
  const categories = Array.from(new Set(available.map((wallpaper) => wallpaper.category).filter(Boolean))).sort();
  const filtered = available.filter((wallpaper) =>
    (!category || wallpaper.category === category) && (!favoritesOnly || isFavorite(wallpaper.id)) &&
    (!search || `${wallpaper.title} ${wallpaper.category}`.toLowerCase().includes(search))
  ).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) :
    (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0));
  const visible = filtered.slice(0, visibleCount);
  const Heading = view === "all" ? "h2" : "h1";
  const hasFilters = query || category || favoritesOnly;
  const resetFilters = () => { setQuery(""); setCategory(""); setFavoritesOnly(false); };
  return (
    <section id="gallery" data-collection-view={view} className={`collection-section ${view !== "all" ? "dedicated-collection" : ""}`} aria-labelledby="collection-title">
      <div className="page-shell collection-heading">
        <div><p className="micro-label">Collection / Voidwallz</p><Heading id="collection-title">{view === "desktop" ? "Desktop wallpapers" : view === "phone" ? "Phone wallpapers" : "The wallpaper archive"}<em>.</em></Heading></div>
        <p className="collection-description">Search the collection.<br />Keep a view. Change it tomorrow.</p>
      </div>
      <div className="collection-toolbar">
        <div className="page-shell collection-toolbar-inner">
          <div className="collection-toolbar-top">
            {view === "all" ? <div className="segmented-control device-filter" role="group" aria-label="Filter by device">
              {(["all", "desktop", "phone"] as const).map((value) => <button type="button" key={value} aria-pressed={device === value}
                onClick={() => { setDevice(value); setCategory(""); }}>
                {value === "desktop" ? <Monitor size={14} /> : value === "phone" ? <Smartphone size={14} /> : null}
                {value === "all" ? "All wallpapers" : value === "desktop" ? "Desktop" : "Phone"}
              </button>)}
            </div> : <span className="micro-label">{view === "desktop" ? <Monitor size={15} /> : <Smartphone size={15} />} {view === "desktop" ? "Desktop wallpapers" : "Phone wallpapers"}</span>}
            <div className="collection-search">
              <label className="vw-search-label" htmlFor={searchId}>Search wallpapers</label>
              <Search size={16} aria-hidden="true" /><input id={searchId} type="search" placeholder="Name or category" value={query} onChange={(event) => setQuery(event.target.value)} />
              {query && <button type="button" className="icon-button" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
            </div>
          </div>
          <div className="collection-toolbar-bottom">
            <div className="collection-filter-options">
              <label className="vw-field-label" htmlFor={`${searchId}-category`}>Category</label>
              <select id={`${searchId}-category`} className="studio-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All moods</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <button type="button" className="saved-filter" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)}><Heart size={14} fill={favoritesOnly ? "currentColor" : "none"} /> Saved</button>
              {hasFilters && <button type="button" className="clear-filters" onClick={resetFilters}>Clear filters <X size={12} /></button>}
            </div>
            <div className="collection-sort"><span className="micro-label" role="status" aria-live="polite">{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "wallpaper" : "wallpapers"}`}</span>
              <label className="vw-field-label" htmlFor={`${searchId}-sort`}>Sort</label>
              <select id={`${searchId}-sort`} className="studio-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="title">Name: A–Z</option></select>
            </div>
          </div>
        </div>
      </div>
      <div className="page-shell collection-results" aria-busy={loading || query.trim().toLowerCase() !== search}>
        {isUsingFallback && <div className="collection-notice"><p>Showing the featured collection while the full archive reconnects.</p><button type="button" className="text-link" onClick={reload}>Try again</button></div>}
        {loading ? <div className="art-grid" aria-label="Loading wallpapers">{Array.from({ length: 6 }, (_, index) => <div key={index} className="card-skeleton" aria-hidden="true"><div className="animate-shimmer" /><span /></div>)}</div> : filtered.length ? <>
          <div className={`art-grid ${device === "phone" ? "phone-grid" : ""}`}>
            {visible.map((wallpaper, index) => <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={index} onOpenModal={onOpenModal} isOledOptimized={isOledOptimized} />)}
          </div>
          <div className="collection-end"><span className="micro-label">Showing {visible.length} of {filtered.length}</span>
            {visible.length < filtered.length ? <button type="button" className="outline-button" onClick={() => setVisibleCount((count) => count + 12)}>See more wallpapers <ArrowDown size={15} /></button> : <p>End of the collection.</p>}
          </div>
        </> : <div className="collection-empty"><Search size={26} strokeWidth={1} /><h3>{favoritesOnly ? "No saved wallpapers yet." : "No wallpapers found."}</h3><p>{favoritesOnly ? "Tap the heart on a wallpaper to keep it close." : "Try a different name or mood to find your next wallpaper."}</p>{hasFilters && <button type="button" className="outline-button" onClick={resetFilters}>See all wallpapers <ArrowDown size={15} /></button>}</div>}
      </div>
    </section>
  );
}
