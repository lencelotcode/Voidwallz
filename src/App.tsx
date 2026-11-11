import DownloadFeedback from "./components/DownloadFeedback";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { KineticRibbon } from "./components/MotionGraphic";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import ScreenStatement from "./components/ScreenStatement";
import Gallery from "./components/Gallery";
import LatestUploads from "./components/LatestUploads";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import WallpaperModal from "./components/WallpaperModal";
import AuthModal from "./components/AuthModal";
import { Wallpaper, VoidPack } from "./types";
import { useWallpapers } from "./hooks/useWallpapers";
import { VisualEffectsProvider } from "./hooks/useVisualEffects";
import CookieConsent from "./components/CookieConsent";
import NotFoundPage from "./components/NotFoundPage";
import { useDialogCount } from "./lib/dialogState";
import { setPageMeta, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "./lib/seo";
import { closeWallpaper, collectionLocation, openWallpaper, WALLPAPER_ROUTE_PATTERN } from "./lib/wallpaperNavigation";
import { LegalDocuments, isLegalPath } from "./components/LegalPages";

const VoidPacks = lazy(() => import("./components/VoidPacks"));
const PackModal = lazy(() => import("./components/PackModal"));
const ReportPage = lazy(() => import("./components/ReportPage"));
const UpdatesPage = lazy(() => import("./components/UpdatesPage"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const AdminPackUpload = lazy(() => import("./components/AdminPackUpload"));

const KNOWN_PATHS = [
  "/",
  "/packs",
  "/desktop",
  "/mobile",
  "/updates",
  "/login",
  "/signup",
  "/trial",
  "/privacy",
  "/terms",
  "/license",
  "/cookies",
  "/refunds",
  "/dmca",
  "/report",
  "/admin",
];

const STATIC_META: Record<string, { title: string; description: string }> = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  "/packs": { title: "Wallpaper Packs | Voidwallz", description: "Browse coordinated wallpaper collections for desktop and phone. Preview each image and download the full pack or a single image." },
  "/desktop": { title: "Desktop Wallpapers | Voidwallz", description: "Browse, save and download wallpapers for desktop and laptop screens. Preview the artwork before you download." },
  "/mobile": { title: "Phone Wallpapers | Voidwallz", description: "Browse portrait wallpapers for your phone. Preview the artwork and download the original image." },
  "/updates": { title: "Journal & Updates | Voidwallz", description: "A record of features, experiments and visual changes at Voidwallz." },
  "/login": { title: "Sign In | Voidwallz", description: "Sign in to your Voidwallz account." },
  "/signup": { title: "Create an Account | Voidwallz", description: "Create your Voidwallz account and explore the wallpaper collection." },
  "/trial": { title: "Create an Account | Voidwallz", description: "Join Voidwallz and explore the wallpaper collection." },
  "/report": { title: "Report an Issue | Voidwallz", description: "Tell us about a problem with Voidwallz so we can help fix it." },
  "/privacy": { title: "Privacy Policy | Voidwallz", description: "How Voidwallz handles your information." },
  "/terms": { title: "Terms of Service | Voidwallz", description: "Terms for using Voidwallz and its wallpaper collection." },
  "/license": { title: "Image Licence | Voidwallz", description: "Personal use terms for Voidwallz wallpapers." },
  "/cookies": { title: "Cookie & Storage Policy | Voidwallz", description: "How Voidwallz uses cookies and local device storage." },
  "/refunds": { title: "Refund Policy | Voidwallz", description: "Voidwallz refund and digital goods policy." },
  "/dmca": { title: "Copyright Policy | Voidwallz", description: "Copyright information and contact details for Voidwallz." },
  "/admin": { title: "Publishing Studio | Voidwallz", description: "Voidwallz pack publishing tools." },
};

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
    setPageMeta({
      title: `${selectedWp.title} — ${selectedWp.device === "desktop" ? "Desktop" : "Phone"} Wallpaper | Voidwallz`,
      description: `${selectedWp.title} — a ${selectedWp.device === "desktop" ? "desktop" : "phone"} wallpaper by Voidwallz. Preview the artwork and download the original image.`,
      image: selectedWp.previewUrl,
      url: window.location.href,
    });
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
  const [showLoader, setShowLoader] = useState(true);
  const { loading: wallpapersLoading } = useWallpapers();
  const [hash, setHash] = useState(() => collectionLocation().hash);
  const [path, setPath] = useState(() => collectionLocation().pathname);
  const lastPath = useRef(window.location.pathname);
  const [atmosphereMode, setAtmosphereMode] = useState<"standard" | "oled" | "crt" | "noir">("standard");
  const [ambientImage, setAmbientImage] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<VoidPack | null>(null);

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
      setHash(contentLocation.hash);
      setPath(contentLocation.pathname);
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

    if (path === "/login") {
      return (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthPage initialMode="signin" />
        </motion.div>
      );
    }

    if (path === "/signup" || path === "/trial") {
      return (
        <motion.div
          key="signup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthPage initialMode="signup" />
        </motion.div>
      );
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
      <AuthModal />

      <Navbar
        isOledOptimized={isOledOptimized}
        setIsOledOptimized={setIsOledOptimized}
        atmosphereMode={atmosphereMode}
        setAtmosphereMode={setAtmosphereMode}
      />
      <main id="main-content" tabIndex={-1} ><Suspense fallback={<div className="route-pending page-shell" role="status"><span className="micro-label">Finding your next view…</span></div>}><AnimatePresence mode="wait">{renderContent()}</AnimatePresence></Suspense></main>
      <Footer />
      <CookieConsent />
      <DownloadFeedback />
    </div>
    </VisualEffectsProvider>
  );
}
