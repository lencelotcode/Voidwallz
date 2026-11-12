import MotionGraphic from '../../../shared/motion/MotionGraphic';
import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Layers,
  Cpu,
  Tv,
  Zap,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';

interface UpdateLog {
  version: string;
  codename: string;
  date: string;
  status: 'LATEST' | 'STABLE' | 'ARCHIVED';
  category: 'FEATURE' | 'ENGINE' | 'VISUAL FX' | 'CORE';
  summary: string;
  icon: any;
  highlights: string[];
  specs: { label: string; val: string }[];
  actionLink?: { label: string; path: string };
}

const UPDATES_DATA: UpdateLog[] = [
  {
    version: 'v2.5.0',
    codename: 'OPTICAL PRECISION & KINETIC RADAR',
    date: 'September 2026',
    status: 'LATEST',
    category: 'VISUAL FX',
    icon: Sparkles,
    summary:
      'Integrated shared element spatial morphing, full-bleed master canvas inspection, physics-based magnetic controls, and cybernetic concentric radar shockwaves.',
    highlights: [
      'Shared Element Modal Morph: Seamless layoutId spatial transitions between gallery cards and the detail modal visual stage.',
      'Studio Canvas Mode: Clean full-bleed artwork presentation toggle alongside hardware display mockups.',
      'Magnetic Control Physics: Sub-pixel magnetic spring attraction pulling quick-download, favorite, and share buttons towards the cursor.',
      'Concentric Radar Wavefronts: Expanding neon shockwave rings originating from click coordinates on download and appreciation.',
      'Cybernetic Acoustic Ping: High-tech resonant sonar pulse synthesized via Web Audio API.',
    ],
    specs: [
      { label: 'Display Modes', val: 'Hardware & Full Canvas' },
      { label: 'Spatial Morph', val: 'Framer Motion layoutId' },
      { label: 'Magnetic Pull', val: 'Spring Damped (280/20)' },
      { label: 'Shockwave Waves', val: 'Concentric Dual Wavefronts' },
    ],
    actionLink: { label: 'Experience Gallery', path: '/' },
  },
  {
    version: 'v2.4.1',
    codename: 'TACTILE ACOUSTICS & SPECULAR SHEEN',
    date: 'August 2026',
    status: 'STABLE',
    category: 'ENGINE',
    icon: Zap,
    summary:
      'Synthesized zero-latency Web Audio API ASMR sound engine, dopamine completion chimes, fluid segmented category tabs, and holographic specular glass sheen.',
    highlights: [
      'Tactile ASMR Sound Engine: Real-time Web Audio synthesizer for camera shutter snaps, mechanical switches, glass harmonic pop, and tactile clicks with 0 KB audio files.',
      'Dopamine Download Chime: 3-chord harmonic chime (E5-G#5-B5-E6) triggered on single wallpaper and complete ZIP download completion.',
      'Fluid Segmented Spring Controls: Magnetic layoutId spring pill physics across gallery and pack category bars.',
      'Holographic Glass Sheen: 55° specular light glint sweeps across wallpaper and pack cards on hover.',
      'Unified Studio Navbar: Decluttered top bar into a single luxury atmosphere & audio pill capsule.',
    ],
    specs: [
      { label: 'Audio Latency', val: '0 ms (Web Audio API)' },
      { label: 'External Audio Size', val: '0 KB (Synthesized)' },
      { label: 'Tab Physics', val: 'Spring LayoutId' },
      { label: 'Specular Glint', val: '55° Holographic' },
    ],
    actionLink: { label: 'Explore Gallery', path: '/' },
  },
  {
    version: 'v2.4.0',
    codename: 'CAPSULE STAGING',
    date: 'August 2026',
    status: 'STABLE',
    category: 'FEATURE',
    icon: Layers,
    summary:
      'Deployed Void Packs suite, Admin Pack Studio, and fluid accordion slice physics. Public pack vault locked for final quality assurance.',
    highlights: [
      'Void Packs Gallery: Thematic 5-piece multi-artwork series with locked 60fps accordion slide expansion.',
      'Admin Pack Upload Studio: Integrated secure passkey-authenticated admin studio at /admin.',
      'Mobile Preview Overhaul: Titanium Pro iPhone mockups with dynamic iOS lockscreen clocks and true 9:16 aspect scaling.',
      'QA Staging Status: Pack vault currently locked in staging — public drop releasing very soon!',
    ],
    specs: [
      { label: 'Assets Per Pack', val: '5 Master Files' },
      { label: 'Phone Deck UI', val: 'Portrait Accordion' },
      { label: 'Desktop Suite UI', val: 'Widescreen Slices' },
      { label: 'Vault Status', val: 'Staging (Dropping Soon)' },
    ],
    actionLink: { label: 'Preview Void Packs', path: '/packs' },
  },
  {
    version: 'v2.3.0',
    codename: 'ATMOSPHERE ENGINE',
    date: 'August 2026',
    status: 'STABLE',
    category: 'VISUAL FX',
    icon: Tv,
    summary:
      'Complete visual atmosphere pipeline featuring 4 rendering modes and photorealistic device mockups.',
    highlights: [
      '4-Mode Atmosphere Engine: Standard luxury, Pure OLED (true black), CRT Scanlines, and 35mm Noir Grain.',
      'Studio Display & Titanium Pro Mockups: Realistic camera notch, dynamic island, and specular glass glares.',
      'Adaptive Ambient Glow: Background dynamically illuminates with high-blur color sampling of hovered artworks.',
      'Dual View Mode: Instant switching between Studio Hardware Frame and Clean Full-Art Canvas.',
    ],
    specs: [
      { label: 'FX Modes', val: 'Standard / OLED / CRT / Noir' },
      { label: 'Mockup Types', val: 'Studio Display & Titanium' },
      { label: 'Color Depth', val: '10-bit Simulated' },
      { label: 'Ambient Blur', val: '160px Spatial' },
    ],
  },
  {
    version: 'v2.2.0',
    codename: 'RETINA 8K PIPELINE',
    date: 'August 2026',
    status: 'STABLE',
    category: 'ENGINE',
    icon: Zap,
    summary:
      'Resolution and compression overhaul with direct master blob fetching and portrait-lock algorithms.',
    highlights: [
      'Master Resolution Pipeline: Upgraded fallback and storage CDN assets to pristine 8K (3840px+) and 4K Mobile.',
      'Zero-Latency Master Downloader: Direct fetch and blob triggering with instant extension auto-detection.',
      'Aspect Ratio Optimization: Enforced vertical portrait-crop standards for mobile device formats.',
      'Refactored Metadata HUD: Streamlined wallpaper specs panel with category, release, and live download counters.',
    ],
    specs: [
      { label: 'Desktop Res', val: '8K Ultra (3840x2160+)' },
      { label: 'Mobile Res', val: '4K Retina (1440x2560+)' },
      { label: 'Formats', val: 'AVIF, WEBP, PNG' },
      { label: 'Download Speed', val: 'Direct Blob Buffer' },
    ],
  },
  {
    version: 'v2.1.0',
    codename: 'TYPOGRAPHIC IDENTITY',
    date: 'August 2026',
    status: 'STABLE',
    category: 'VISUAL FX',
    icon: Sparkles,
    summary: 'Integrated custom Google typography and cinematic kinetic loading sequences.',
    highlights: [
      'Curated Typography Engine: Integrated Outfit (Geometric Sans) and Space Mono (Technical HUD) across all components.',
      'Cinematic Welcome Loader: Multi-phase protocol initialization text with giant background countdown numbers and progress glow.',
      'Multi-Ring Spinners: Futuristic dual-opposing rotating kinetic rings for gallery and hero states.',
      'Scrollbar Cleanup: Engineered cross-browser zero-scrollbar utility (.scrollbar-hide) for sleek horizontal navigation.',
    ],
    specs: [
      { label: 'Headings', val: 'Outfit Variable' },
      { label: 'HUD / Code', val: 'Space Mono' },
      { label: 'Accent', val: 'Playfair Display' },
      { label: 'Loader Transitions', val: 'Spatial Scale-In' },
    ],
  },
  {
    version: 'v2.0.0',
    codename: 'VOID GENESIS',
    date: 'July 2026',
    status: 'ARCHIVED',
    category: 'CORE',
    icon: Cpu,
    summary:
      'The architectural foundation of Voidwallz: dark luxury styling, Supabase integration, and spatial mouse physics.',
    highlights: [
      'Supabase Cloud Storage: Distributed CDN bucket architecture for desktop and mobile preview/original assets.',
      "Magnetic Cursor Physics: Sub-pixel cursor tracking with contextual hover states ('VIEW', 'CLOSE', 'PREV', 'NEXT').",
      'Liquid Void Hero: 3D perspective tilt with mouse parallax physics and metallic border glow tokens.',
      'Infinite Grid Architecture: Optimized virtual scrolling with category filters and instant keyword search.',
    ],
    specs: [
      { label: 'Framework', val: 'React 19 + Vite' },
      { label: 'Styling', val: 'Tailwind v4 Engine' },
      { label: 'Animations', val: 'Motion (Framer)' },
      { label: 'Backend', val: 'Supabase Storage' },
    ],
  },
];

export default function UpdatesPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const categories = ['ALL', 'FEATURE', 'VISUAL FX', 'ENGINE', 'CORE'];
  const items =
    activeCategory === 'ALL'
      ? UPDATES_DATA
      : UPDATES_DATA.filter((item) => item.category === activeCategory);
  return (
    <section className="vw-page vw-journal page-shell">
      <header className="vw-page-heading">
        <MotionGraphic variant="updates" className="vw-heading-graphic" />
        <h1>
          ALWAYS
          <br />
          IN PROGRESS<span className="vw-period">.</span>
        </h1>
        <p>A record of the features, experiments, and visual changes that shaped Voidwallz.</p>
      </header>
      <div className="vw-section-toolbar">
        <div
          className="segmented-control vw-wrap-controls"
          role="group"
          aria-label="Filter updates"
        >
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={category === activeCategory}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'ALL' ? 'All updates' : category.toLowerCase()}
            </button>
          ))}
        </div>
        <span className="micro-label">{items.length} entries</span>
      </div>
      <div className="vw-update-list">
        {items.map((item) => (
          <article key={item.version} className="vw-update-entry">
            <div className="vw-update-meta">
              <span className="micro-label">{item.date}</span>
              <strong>{item.version}</strong>
              <span className="micro-label">{item.category}</span>
            </div>
            <div className="vw-update-content">
              <h2>{item.codename}</h2>
              <p>{item.summary}</p>
              <ul>
                {item.highlights.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
              {item.actionLink && (
                <a className="text-link" href={item.actionLink.path}>
                  {item.actionLink.label}
                  <ArrowUpRight size={18} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
