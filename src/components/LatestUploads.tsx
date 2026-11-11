import { ArrowDown } from "lucide-react";
import { useWallpapers } from "../hooks/useWallpapers";
import { Wallpaper } from "../types";
import WallpaperCard from "./WallpaperCard";

export default function LatestUploads({ onOpenModal, isOledOptimized = false }: {
  onOpenModal: (wallpaper: Wallpaper) => void;
  isOledOptimized?: boolean;
  onHoverWallpaper?: (url: string | null) => void;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();
  const latest = [...desktopWallpapers, ...mobileWallpapers].sort((a, b) =>
    (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0)).slice(0, 3);
  if (loading || !latest.length) return null;
  return (
    <section className="latest-section page-shell vw-latest" aria-labelledby="latest-title">
      <div className="collection-heading">
        <div><p className="micro-label accent-text">Just added</p><h2 id="latest-title">New in the collection<em>.</em></h2></div>
        <a className="text-link" href="#gallery">See all wallpapers <ArrowDown size={14} /></a>
      </div>
      <div className="latest-grid">
        {latest.map((wallpaper, index) => <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={index} onOpenModal={onOpenModal} isOledOptimized={isOledOptimized} />)}
      </div>
    </section>
  );
}
