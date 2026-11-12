import DownloadFeedback from "./components/DownloadFeedback";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import React, { lazy, Suspense, startTransition, useEffect, useState, useRef } from "react";
import { KineticRibbon } from "./components/MotionGraphic";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import ScreenStatement from "./components/ScreenStatement";
import Gallery from "./components/Gallery";
import LatestUploads from "./components/LatestUploads";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import RoutePending from "./components/RoutePending";
import WallpaperModal from "./components/WallpaperModal";
import { Wallpaper, VoidPack } from "./types";
import { useWallpapers } from "./hooks/useWallpapers";
import { VisualEffectsProvider } from "./hooks/useVisualEffects";
import CookieConsent from "./components/CookieConsent";
import NotFoundPage from "./components/NotFoundPage";
import { useDialogCount } from "./lib/dialogState";
import { setPageMeta } from "./lib/seo";
import { STATIC_META, wallpaperMeta } from "./lib/pageMetadata";
import { closeWallpaper, collectionLocation, openWallpaper, WALLPAPER_ROUTE_PATTERN } from "./lib/wallpaperNavigation";
import { LegalDocuments, isLegalPath } from "./components/LegalPages";
import { navigateSiteLink, siteLink } from "./lib/siteNavigation";
import { rememberIntro, shouldShowIntro } from "./lib/intro";

const loadPacks = () => import("./components/VoidPacks");
const loadReport = () => import("./components/ReportPage");
const loadUpdates = () => import("./components/UpdatesPage");
const VoidPacks = lazy(loadPacks);
const PackModal = lazy(() => import("./components/PackModal"));
const ReportPage = lazy(loadReport);
const UpdatesPage = lazy(loadUpdates);
const AdminPackUpload = lazy(() => import("./components/AdminPackUpload"));

function preloadPage(event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement> | React.PointerEvent<HTMLElement>) {
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
  if (!anchor || anchor.origin !== window.location.origin) return;
  const load = ({ "/packs": loadPacks, "/report": loadReport, "/updates": loadUpdates })[anchor.pathname.replace(/\/+$/, "")];
  if (load) void load().catch(() => { /* The page boundary handles a failed navigation import. */ });
}

const KNOWN_PATHS = [
  "/",
  "/packs",
  "/desktop",
  "/mobile",
  "/updates",
  "/privacy",
  "/terms",
  "/license",
  "/cookies",
  "/refunds",
  "/dmca",
  "/report",
  "/admin",
];

export const navigateToWallpaper = openWallpaper;

function WallpaperRouteManager({
  isOledOptimized,
}: {
  isOledOptimized: boolean;
}) {
  const { desktopWallpapers, mobileWallpapers, loading } = useWallpapers();
  const [selectedWp, setSelectedWp] = useState<Wallpaper | null>(null);

  useEffect(() => {
    if (loading) return;
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const match = path.match(WALLPAPER_ROUTE_PATTERN);

      if (match) {
        const device = match[1];
        const rawSlug = match[2];
        let slug: string;
        try {
          slug = decodeURIComponent(rawSlug).toLowerCase().replace(/\s+/g, "-");
        } catch {
          setSelectedWp(null);
          return;
        }

        const allWallpapers =
          device === "desktop" ? desktopWallpapers : mobileWallpapers;

        const wp = allWallpapers.find((w) => {
          const titleSlug = w.title.toLowerCase().replace(/\s+/g, "-");
          return titleSlug === slug;
        });

        if (wp) {
          setSelectedWp(wp);
        } else {
          setSelectedWp(null);
        }
      } else {
        setSelectedWp(null);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("wallpaper-navigate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("wallpaper-navigate", handleUrlChange);
    };
  }, [desktopWallpapers, mobileWallpapers, loading]);

  // Per-wallpaper link-preview metadata for detail routes
  useEffect(() => {
    if (!selectedWp) {
      const meta = STATIC_META[window.location.pathname];
      if (meta) setPageMeta(meta);
      return;
    }
    setPageMeta(wallpaperMeta(selectedWp, window.location.href));
  }, [selectedWp]);

  return (
    <WallpaperModal
      selectedWp={selectedWp}
      onClose={closeWallpaper}
      isOledOptimized={isOledOptimized}
    />
  );
}

export default function App() {
  const openDialogCount = useDialogCount();
  const [showLoader, setShowLoader] = useState(shouldShowIntro);
  const { loading: wallpapersLoading } = useWallpapers();
  const [hash, setHash] = useState(() => collectionLocation().hash);
  const [path, setPath] = useState(() => collectionLocation().pathname);
  const lastPath = useRef(window.location.pathname);
  const [atmosphereMode, setAtmosphereMode] = useState<"standard" | "oled" | "crt" | "noir">("standard");
  const [ambientImage, setAmbientImage] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<VoidPack | null>(null);

  useEffect(() => { if (!showLoader) rememberIntro(); }, [showLoader]);

  const isOledOptimized = atmosphereMode === "oled";
  const setIsOledOptimized = (val: boolean) => {
    setAtmosphereMode(val ? "oled" : "standard");
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const previousPath = lastPath.current;
      const nextPath = window.location.pathname;
      lastPath.current = nextPath;
      // A preview is an overlay: retain the collection, filters, and scroll position.
      const previewReturn = WALLPAPER_ROUTE_PATTERN.test(previousPath);
      const contentLocation = collectionLocation();
      startTransition(() => {
        setHash(contentLocation.hash);
        setPath(contentLocation.pathname);
      });
      if (!previewReturn && !WALLPAPER_ROUTE_PATTERN.test(nextPath) && nextPath !== previousPath && !(isLegalPath(previousPath) && isLegalPath(nextPath)) && !window.location.hash) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    const handleWallpaperNavigation = () => { lastPath.current = window.location.pathname; };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("wallpaper-navigate", handleWallpaperNavigation);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("wallpaper-navigate", handleWallpaperNavigation);
    };
  }, []);

  useEffect(() => {
    if (!hash || ["#desktop", "#phone", "#mobile"].includes(hash)) return;
    let targetId: string;
    try { targetId = decodeURIComponent(hash.slice(1)); } catch { return; }
    const scroll = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      // During the exit animation the previous collection can have the same ID.
      const expectedView = path === "/desktop" ? "desktop" : path === "/mobile" ? "phone" : "all";
      if (targetId === "gallery" && target.getAttribute("data-collection-view") !== expectedView) return false;
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      return true;
    };
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    const frame = requestAnimationFrame(() => { if (!scroll()) observer.observe(document.getElementById("main-content") || document.body, { childList: true, subtree: true }); });
    const timer = window.setTimeout(() => observer.disconnect(), 3000);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); clearTimeout(timer); };
  }, [path, hash]);

  // Per-route document title + link-preview metadata (wallpaper detail
  // routes manage their own meta in WallpaperRouteManager)
  useEffect(() => {
    if (WALLPAPER_ROUTE_PATTERN.test(window.location.pathname)) return;
    const meta = STATIC_META[path] ?? {
      title: "Page Not Found | Voidwallz",
      description: "This coordinate doesn't map to anything in the archive.",
    };
    setPageMeta(meta);
  }, [path]);

  const renderContent = () => {
    if (path === "/packs") {
      return (
        <motion.div
          key="packs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <VoidPacks
            isDedicatedPage={true}
            onOpenPack={setSelectedPack}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    if (path === "/desktop") {
      return (
        <motion.div
          key="desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Gallery
            view="desktop"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    if (path === "/mobile") {
      return (
        <motion.div
          key="mobile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Gallery
            view="phone"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    if (path === "/updates") {
      return (
        <motion.div
          key="updates"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <UpdatesPage />
        </motion.div>
      );
    }

    if (path === "/login" || path === "/signup" || path === "/trial") {
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new Event("popstate"));
      return null;
    }

    if (isLegalPath(path)) {
      return <LegalDocuments path={path} />;
    }

    if (path === "/report") {
      return <ReportPage key="report" />;
    }

    if (path === "/admin") {
      return <AdminPackUpload key="admin" />;
    }

    const isWallpaperRoute = WALLPAPER_ROUTE_PATTERN.test(path);

    // Unknown coordinate → branded 404
    if (!KNOWN_PATHS.includes(path) && !isWallpaperRoute) {
      return <NotFoundPage key="not-found" />;
    }

    if (hash === "#desktop") {
      return (
        <motion.div
          key="desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Gallery
            view="desktop"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    if (hash === "#phone" || hash === "#mobile") {
      return (
        <motion.div
          key="phone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Gallery
            view="phone"
            onOpenModal={navigateToWallpaper}
            isOledOptimized={isOledOptimized}
            onHoverWallpaper={setAmbientImage}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
      >
        <Hero
          onOpenModal={navigateToWallpaper}
          isOledOptimized={isOledOptimized}
          introReady={!showLoader}
        />
        <KineticRibbon />
        <LatestUploads
          onOpenModal={navigateToWallpaper}
          isOledOptimized={isOledOptimized}
          onHoverWallpaper={setAmbientImage}
        />
        <ScreenStatement />
        <Gallery
          onOpenModal={navigateToWallpaper}
          isOledOptimized={isOledOptimized}
          onHoverWallpaper={setAmbientImage}
        />
      </motion.div>
    );
  };

  return (
    <VisualEffectsProvider>
    <AnimatePresence onExitComplete={() => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      const target = dialog?.querySelector<HTMLElement>("button") ?? document.getElementById("main-content");
      target?.focus({ preventScroll: true });
    }}>
      {showLoader && <Loader ready={!wallpapersLoading} onComplete={() => setShowLoader(false)} />}
    </AnimatePresence>
    <div
      inert={showLoader || openDialogCount > 0 || undefined}
      onClick={(event) => {
        if (siteLink(event)) preloadPage(event);
        navigateSiteLink(event, document.documentElement.dataset.motionState === "paused");
      }}
      onPointerOver={preloadPage}
      onFocusCapture={preloadPage}
      onPointerDown={preloadPage}
      className={`void-app min-h-screen overflow-x-clip relative atmosphere-${atmosphereMode} ${isOledOptimized ? "oled-mode" : ""}`}
    >
      <AnimatePresence>
        {ambientImage && !isOledOptimized && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: atmosphereMode === "noir" ? 0.08 : 0.22, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center blur-[160px] scale-125 transition-all duration-700"
            style={{ backgroundImage: `url(${ambientImage})` }}
          />
        )}
      </AnimatePresence>

      {atmosphereMode === "crt" && <div className="crt-scanlines" />}
      {atmosphereMode === "noir" && <div className="noir-vignette" />}



      <WallpaperRouteManager isOledOptimized={isOledOptimized} />
      {selectedPack && <Suspense fallback={<div className="pack-pending" role="status">Preparing your pack… <button type="button" className="text-link" onClick={() => setSelectedPack(null)}>Cancel</button></div>}><PackModal
        selectedPack={selectedPack}
        onClose={() => { setSelectedPack(null); if (window.location.pathname === "/packs" && window.location.hash) { window.history.replaceState(null, "", "/packs"); window.dispatchEvent(new Event("popstate")); } }}
        isOledOptimized={isOledOptimized}
      /></Suspense>}

      <Navbar
        isOledOptimized={isOledOptimized}
        setIsOledOptimized={setIsOledOptimized}
        atmosphereMode={atmosphereMode}
        setAtmosphereMode={setAtmosphereMode}
      />
      <main id="main-content" tabIndex={-1} ><Suspense fallback={<RoutePending />}><AnimatePresence mode="wait">{renderContent()}</AnimatePresence></Suspense></main>
      <Footer />
      <CookieConsent />
      <DownloadFeedback />
    </div>
    </VisualEffectsProvider>
  );
}
