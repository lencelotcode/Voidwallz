import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import DownloadFeedback from '../features/downloads/components/DownloadFeedback';
import CookieConsent from '../features/preferences/components/CookieConsent';
import { useWallpapers } from '../features/wallpapers/hooks/useWallpapers';
import type { WallpaperPack } from '../shared/types/catalogue';
import { useDialogCount } from '../shared/state/dialogStore';
import Footer from './layout/Footer';
import Navbar from './layout/Navbar';
import IntroLoader from './components/IntroLoader';
import RoutePending from './components/RoutePending';
import ErrorBoundary from './components/ErrorBoundary';
import WallpaperRouteManager from './routing/WallpaperRouteManager';
import { useSiteRouter } from './hooks/useSiteRouter';
import { renderRouteContent, preloadPage } from './routes';
import { navigateSiteLink, siteLink } from './routing/siteNavigation';
import { rememberIntro, shouldShowIntro } from './routing/intro';
const PackPreview = lazy(() => import('../features/packs/components/PackPreview'));

export default function App() {
  const openDialogCount = useDialogCount();
  const [showLoader, setShowLoader] = useState(shouldShowIntro);
  const { loading: wallpapersLoading } = useWallpapers();
  const { path, hash } = useSiteRouter();
  const [atmosphereMode, setAtmosphereMode] = useState<'standard' | 'oled' | 'crt' | 'noir'>(
    'standard',
  );
  const [ambientImage, setAmbientImage] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<WallpaperPack | null>(null);

  useEffect(() => {
    if (!showLoader) rememberIntro();
  }, [showLoader]);

  const isOledOptimized = atmosphereMode === 'oled';
  const setIsOledOptimized = (val: boolean) => {
    setAtmosphereMode(val ? 'oled' : 'standard');
  };

  return (
    <>
      <AnimatePresence
        onExitComplete={() => {
          const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
          const target =
            dialog?.querySelector<HTMLElement>('button') ?? document.getElementById('main-content');
          target?.focus({ preventScroll: true });
        }}
      >
        {showLoader && (
          <IntroLoader ready={!wallpapersLoading} onComplete={() => setShowLoader(false)} />
        )}
      </AnimatePresence>
      <div
        inert={showLoader || openDialogCount > 0 || undefined}
        onClick={(event) => {
          if (siteLink(event)) preloadPage(event);
          navigateSiteLink(event, document.documentElement.dataset.motionState === 'paused');
        }}
        onPointerOver={preloadPage}
        onFocusCapture={preloadPage}
        onPointerDown={preloadPage}
        className={`void-app min-h-screen overflow-x-clip relative atmosphere-${atmosphereMode} ${isOledOptimized ? 'oled-mode' : ''}`}
      >
        <AnimatePresence>
          {ambientImage && !isOledOptimized && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: atmosphereMode === 'noir' ? 0.08 : 0.22, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center blur-[160px] scale-125 transition-all duration-700"
              style={{ backgroundImage: `url(${ambientImage})` }}
            />
          )}
        </AnimatePresence>

        {atmosphereMode === 'crt' && <div className="crt-scanlines" />}
        {atmosphereMode === 'noir' && <div className="noir-vignette" />}

        <WallpaperRouteManager isOledOptimized={isOledOptimized} />
        {selectedPack && (
          <Suspense
            fallback={
              <div className="pack-pending" role="status">
                Preparing your pack…{' '}
                <button type="button" className="text-link" onClick={() => setSelectedPack(null)}>
                  Cancel
                </button>
              </div>
            }
          >
            <PackPreview
              selectedPack={selectedPack}
              onClose={() => {
                setSelectedPack(null);
                if (window.location.pathname === '/packs' && window.location.hash) {
                  window.history.replaceState(null, '', '/packs');
                  window.dispatchEvent(new Event('popstate'));
                }
              }}
              isOledOptimized={isOledOptimized}
            />
          </Suspense>
        )}

        <Navbar
          isOledOptimized={isOledOptimized}
          setIsOledOptimized={setIsOledOptimized}
          atmosphereMode={atmosphereMode}
          setAtmosphereMode={setAtmosphereMode}
        />
        <main id="main-content" tabIndex={-1}>
          <ErrorBoundary resetKey={path}>
            <Suspense fallback={<RoutePending />}>
              <AnimatePresence mode="wait">
                {renderRouteContent({
                  path,
                  hash,
                  isOledOptimized,
                  introReady: !showLoader,
                  onOpenPack: setSelectedPack,
                  onHoverWallpaper: setAmbientImage,
                })}
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <CookieConsent />
        <DownloadFeedback />
      </div>
    </>
  );
}
