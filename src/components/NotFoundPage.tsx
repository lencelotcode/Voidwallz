export default function NotFoundPage() {
  const returnHome = () => {
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <section className="min-h-[100dvh] bg-void-black text-void-light flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-pulse" />
          Error 404 // Signal Lost
        </span>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic font-light tracking-tighter leading-[1.05] text-white/90 mb-6">
          Lost in the void.
        </h1>

        <p className="text-sm text-white/50 leading-relaxed font-light mb-10">
          This coordinate doesn't map to anything in the archive. The page may
          have been moved, renamed, or never existed at all.
        </p>

        <button
          onClick={returnHome}
          data-cursor="HOME"
          className="px-6 py-3 bg-white text-black font-sans font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-[0.98] transition-all cursor-pointer"
        >
          Return to Base
        </button>

        <span className="mt-12 font-mono text-[10px] uppercase tracking-widest text-white/25">
          ID: V-000 // Uncharted Sector
        </span>
      </div>
    </section>
  );
}
