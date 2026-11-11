import MotionGraphic from "./MotionGraphic";
import React, { ReactNode, useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useVisualEffects } from "../hooks/useVisualEffects";

const LEGAL_TABS = [
  { slug: "privacy", label: "Privacy Policy", title: "Privacy Policy", path: "/privacy", Content: PrivacyPolicy },
  { slug: "terms", label: "Terms of Service", title: "Terms of Service", path: "/terms", Content: TermsOfService },
  { slug: "license", label: "License", title: "Personal Use License", path: "/license", Content: License },
  { slug: "cookies", label: "Cookie Policy", title: "Cookie & Storage Policy", path: "/cookies", Content: CookiePolicy },
  { slug: "refunds", label: "Refund Policy", title: "Refund & Digital Goods Policy", path: "/refunds", Content: RefundPolicy },
  { slug: "dmca", label: "DMCA & Copyright", title: "DMCA & Copyright Policy", path: "/dmca", Content: DMCAPolicy },
] as const;

export const isLegalPath = (path: string) => LEGAL_TABS.some(tab => tab.path === path);

/** One mounted reading workspace for every policy, including browser back/forward. */
export function LegalDocuments({ path }: { path: string }) {
  const document = LEGAL_TABS.find(tab => tab.path === path) ?? LEGAL_TABS[0];
  const { Content } = document;
  return <LegalLayout activeSlug={document.slug}><Content /></LegalLayout>;
}

function LegalLayout({ activeSlug, children }: {
  activeSlug: typeof LEGAL_TABS[number]["slug"];
  children: ReactNode;
}) {
  const { reduceMotion, motionPaused } = useVisualEffects();
  const still = reduceMotion || motionPaused;
  const root = useRef<HTMLElement>(null);
  const readingArea = useRef<HTMLDivElement>(null);
  const previousSlug = useRef(activeSlug);

  useLayoutEffect(() => {
    const changed = previousSlug.current !== activeSlug;
    previousSlug.current = activeSlug;
    if (!changed || !root.current || !readingArea.current) return;

    // Stay in the reading workspace; a deeply scrolled document starts at its
    // first section rather than landing halfway through the next policy.
    const readingTop = readingArea.current.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > readingTop - 108) {
      const workspace = root.current.querySelector(".vw-document-layout");
      const workspaceTop = (workspace?.getBoundingClientRect().top ?? 0) + window.scrollY;
      window.scrollTo({ top: Math.max(0, workspaceTop - 108), behavior: "instant" });
    }
    const activeLink = root.current.querySelector<HTMLAnchorElement>('[aria-current="page"]');
    const nav = activeLink?.parentElement;
    if (nav && activeLink && nav.scrollWidth > nav.clientWidth) {
      const left = activeLink.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
      const right = left + activeLink.offsetWidth;
      if (left < nav.scrollLeft || right > nav.scrollLeft + nav.clientWidth) {
        nav.scrollTo({ left: left - (nav.clientWidth - activeLink.offsetWidth) / 2, behavior: still ? "instant" : "smooth" });
      }
    }
    if (still) return;
    const context = gsap.context(() => {
      gsap.fromTo(".vw-document-content", { opacity: 0.45, y: 8 }, {
        opacity: 1, y: 0, duration: 0.34, ease: "power2.out", clearProps: "opacity,transform",
      });
      gsap.fromTo(".vw-document-title-current, .vw-heading-graphic", { opacity: 0.5 }, {
        opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "opacity",
      });
    }, root);
    return () => context.revert();
  }, [activeSlug, still]);

  const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.pathname === path) return;
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return <section ref={root} className="vw-page vw-document page-shell">
    <header className="vw-page-heading">
      <MotionGraphic variant={activeSlug === "dmca" ? "copyright" : activeSlug} className="vw-heading-graphic" />
      <span className="micro-label">Voidwallz / information</span>
      <h1 className="vw-document-title">{LEGAL_TABS.map(tab => <span key={tab.slug}
        className={tab.slug === activeSlug ? "vw-document-title-current" : "vw-document-title-measure"}
        aria-hidden={tab.slug !== activeSlug || undefined}>
        {tab.title}<span className="vw-period">.</span>
      </span>)}</h1>
      <p className="micro-label">Last updated: September 2026</p>
    </header>
    <div className="vw-document-layout">
      <nav aria-label="Legal documents" className="vw-document-nav">
        {LEGAL_TABS.map(tab => <a key={tab.slug} href={tab.path}
          aria-current={tab.slug === activeSlug ? "page" : undefined}
          onClick={event => handleNavigate(event, tab.path)}>
          {tab.slug === activeSlug && <motion.span aria-hidden="true" className="vw-document-tab-highlight"
            layoutId="legal-active-policy" transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }} />}
          <span className="vw-document-tab-label">{tab.label}</span>
        </a>)}
      </nav>
      <div ref={readingArea} className="vw-document-content">
        <span className="sr-only" role="status">{LEGAL_TABS.find(tab => tab.slug === activeSlug)?.title}</span>
        <div className="vw-document-body">{children}</div>
        <div className="vw-document-contact"><span className="micro-label">Questions about this policy?</span>
          <a className="text-link" href="mailto:voidwallzbusiness@gmail.com">voidwallzbusiness@gmail.com</a>
        </div>
      </div>
    </div>
  </section>;
}

/* =========================================================================
   1. PRIVACY POLICY
   ========================================================================= */
export function PrivacyPolicy() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">1. Commitment to Minimalist Privacy</h2>
        <p>
          Voidwallz ("we", "us", or "our") operates under a foundational principle of <strong>Zero Invasive Tracking</strong>. We believe that elevating your digital workspace should never come at the cost of your personal privacy. We do not engage in behavioral profiling, sell personal data to data brokers, or deploy third-party advertising tracking networks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">2. What Information We Process</h2>
        <p>We strictly limit data processing to what is technically necessary to render digital artworks smoothly on your device:</p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-white/70">
          <li><strong>Client-Side Preferences (Local Storage):</strong> Your preferred display atmosphere (Standard, Pure OLED, CRT, Noir), audio sound-effects mute status, and list of bookmarked wallpaper IDs are stored entirely inside your browser’s local storage. This data never leaves your device.</li>
          <li><strong>Aggregated Download & Appreciation Counters:</strong> When you like or download an artwork, an anonymous numerical counter is updated in our database to help curate community favorites. No IP addresses or personal identifiers are stored alongside counters.</li>
          <li><strong>Diagnostic Anomaly Reports (Optional):</strong> If you deliberately submit a report via our Anomaly Terminal, we collect the description and optional screenshot provided, alongside technical telemetry (browser name, screen dimensions) solely to diagnose rendering bugs.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">3. Legal Basis for Processing (GDPR & International Frameworks)</h2>
        <p>Under the European General Data Protection Regulation (GDPR) and equivalent global privacy laws, we process information on the following legal bases:</p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs text-white/70">
          <li><strong>Legitimate Interest:</strong> Ensuring system stability, security, and serving optimized 8K and 4K media assets according to your screen resolution.</li>
          <li><strong>Consent:</strong> Storing non-essential diagnostic feedback or direct inquiries submitted through our forms.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">4. Third-Party Infrastructure & CDNs</h2>
        <p>
          To deliver high-bandwidth lossless PNG and AVIF assets with zero latency, digital media files are distributed through trusted infrastructure partners (including Supabase Cloud Storage and CDN edge nodes). These providers process requests in strict compliance with standard ISO/SOC2 security protocols solely for content delivery.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">5. Your Legal Rights (GDPR / CCPA / CPRA)</h2>
        <p>Regardless of your geographic jurisdiction, Voidwallz affords you comprehensive privacy rights:</p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs text-white/70">
          <li><strong>Right to Erasure:</strong> Clear your browser cookies or cache at any time to instantly purge all stored preferences and bookmarks.</li>
          <li><strong>Right to Non-Discrimination:</strong> We will never degrade service quality or restrict access because you choose not to share data.</li>
          <li><strong>Do Not Track / Global Privacy Control:</strong> Our systems inherently honor Do Not Track (DNT) and GPC header signals by refusing all commercial trackers.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">6. Privacy Inquiries</h2>
        <p>
          If you have questions about this privacy statement or wish to exercise statutory data rights, transmit an inquiry to our Data Protection Liaison at <a href="mailto:voidwallzbusiness@gmail.com" className="text-white underline">voidwallzbusiness@gmail.com</a>.
        </p>
      </section>
    </>
  );
}

/* =========================================================================
   2. TERMS OF SERVICE
   ========================================================================= */
export function TermsOfService() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">1. Agreement to Terms</h2>
        <p>
          By accessing or using Voidwallz ("the Platform"), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service. If you do not agree to these terms in their entirety, you must cease using the Platform immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">2. Permitted Use & Eligibility</h2>
        <p>
          The Platform and its curated master assets are provided for individuals aged 13 years and older. You agree to use the Platform in compliance with all applicable local, national, and international laws and regulations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">3. Intellectual Property Rights</h2>
        <p>
          All trademarks, brand names, visual interfaces, interactive components, audio synthesizers, and original artwork compilations are the proprietary intellectual property of Voidwallz and its contributing artist collective, protected by copyright, trademark, and unfair competition laws.
        </p>
        <p>
          Wallpapers downloaded from the Platform are licensed—not sold—under our explicit <strong>Personal Use License</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">4. Prohibited Activities</h2>
        <p>You agree not to engage in any of the following unauthorized behaviors:</p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs text-white/70">
          <li>Automated web-scraping, bulk crawling, or data extraction without express prior written consent.</li>
          <li>Reselling, sublicensing, or distributing original or modified master files on digital marketplaces or stock image platforms.</li>
          <li>Minting, bundling, or commercializing any Voidwallz assets into non-fungible tokens (NFTs) or algorithmic generative training sets.</li>
          <li>Attempting to probe, scan, breach, or circumvent any platform security barriers or storage buckets.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">5. Warranty Disclaimer</h2>
        <div className="vw-document-panel">
          THE PLATFORM AND ALL DIGITAL ASSETS ARE PROVIDED STRICTLY ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR FREEDOM FROM INTERRUPTIONS OR ERRORS.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall Voidwallz, its directors, employees, or contributors be liable for any indirect, punitive, incidental, or consequential damages resulting from your access to or inability to access the Platform.
        </p>
      </section>
    </>
  );
}

/* =========================================================================
   3. LICENSE AGREEMENT
   ========================================================================= */
export function License() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">Grant of License</h2>
        <p>
          Every master wallpaper asset downloaded from Voidwallz is licensed to you under a non-exclusive, non-transferable, revocable <strong>Personal Digital Display License</strong>.
        </p>

        <div className="vw-document-panel vw-license-rules">
          <div>
            <h3 className="text-emerald-400 uppercase tracking-widest text-[10px] font-bold mb-3 flex items-center gap-1.5">
              <span>✓</span> Authorized Personal Uses:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>Setting as background wallpaper on your personal desktop, monitor, laptop, tablet, or smartphone.</li>
              <li>Cropping, rotating, or applying personalized color adjustments strictly for your personal hardware screen fit.</li>
              <li>Displaying in personal workspace desk setups featured in non-monetized personal social media photographs.</li>
            </ul>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-red-400 uppercase tracking-widest text-[10px] font-bold mb-3 flex items-center gap-1.5">
              <span>✗</span> Prohibited Commercial Uses:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>Reselling, bundling, or redistributing artwork files as standalone or packaged wallpapers.</li>
              <li>Incorporating assets into commercial software, SaaS applications, website themes, video game textures, or physical merchandise.</li>
              <li>Claiming primary authorship or copyright ownership over any downloaded artwork or composition.</li>
              <li>Uploading assets into public cloud drives or torrent indices for mass redistribution.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3 mt-8">
        <h2 className="text-white text-xl font-serif italic">Commercial & Studio Inquiries</h2>
        <p>
          For studio installations, brand licensing, or commercial distribution inquiries, contact our team at <a href="mailto:voidwallzbusiness@gmail.com" className="text-white underline">voidwallzbusiness@gmail.com</a>.
        </p>
      </section>
    </>
  );
}

/* =========================================================================
   4. COOKIE POLICY
   ========================================================================= */
export function CookiePolicy() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">1. What Technologies We Use</h2>
        <p>
          Voidwallz utilizes standard client-side browser storage (specifically <code>localStorage</code> and transient <code>sessionStorage</code>) to maintain your preferences across page transitions. We do not use third-party cross-site advertising cookies or tracking pixels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">2. Storage Keys & Categories</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border border-white/10 rounded-lg overflow-hidden">
            <thead className="bg-white/5 border-b border-white/10 text-[9px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="p-3">Key / Token</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr>
                <td className="p-3 font-bold text-white">voidwallz_cookie_consent</td>
                <td className="p-3">localStorage</td>
                <td className="p-3 text-emerald-400">Strictly Necessary</td>
                <td className="p-3">Stores your consent acknowledgment so the banner is not displayed repeatedly.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">void_favs</td>
                <td className="p-3">localStorage</td>
                <td className="p-3 text-blue-400">Functional</td>
                <td className="p-3">Saves the IDs of artworks you have bookmarked with the heart button.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">void_sound_enabled</td>
                <td className="p-3">localStorage</td>
                <td className="p-3 text-blue-400">Functional</td>
                <td className="p-3">Remembers your acoustic Web Audio synthesizer toggle (sound on/muted).</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">void_admin_authenticated</td>
                <td className="p-3">sessionStorage</td>
                <td className="p-3 text-emerald-400">Security</td>
                <td className="p-3">Transient authentication token cleared automatically upon closing your browser.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">3. Managing and Clearing Cookies</h2>
        <p>
          You have full autonomy over client storage. You may delete all stored data at any time through your browser's Developer Tools or Privacy Settings ("Clear Browsing Data" / "Site Data"). Doing so will reset your atmosphere and favorites back to factory defaults without affecting platform access.
        </p>
      </section>
    </>
  );
}

/* =========================================================================
   5. REFUND & DIGITAL GOODS POLICY
   ========================================================================= */
export function RefundPolicy() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">1. Nature of Free Digital Assets</h2>
        <p>
          All standard wallpapers and curated desktop/phone artworks available on the Voidwallz public gallery are provided completely <strong>free of charge</strong> for non-commercial personal display. Because no monetary consideration is exchanged, standard refund procedures do not apply to complimentary assets.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">2. Paid Suites & Voluntary Patronage</h2>
        <p>
          In the event that you purchase a limited-edition master pack, digital collector suite, or provide voluntary creator contributions:
        </p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-white/70">
          <li><strong>Instant Digital Delivery:</strong> Master digital archives (such as full .ZIP bundles) are delivered instantaneously upon transaction completion. Under digital trade regulations (including EU Consumer Rights Directive), you acknowledge that your statutory right of withdrawal ceases once digital asset delivery begins.</li>
          <li><strong>Defective File Guarantee:</strong> If a downloaded digital archive is corrupted, missing assets, or rendered unreadable on compatible systems, our engineering team will issue a verified replacement master file within 24 hours of notification.</li>
          <li><strong>Satisfaction Review:</strong> If you encounter genuine dissatisfaction with an authorized transaction, contact <a href="mailto:voidwallzbusiness@gmail.com" className="text-white underline">voidwallzbusiness@gmail.com</a> within 14 days of purchase with your transaction identifier for review on a case-by-case basis.</li>
        </ul>
      </section>
    </>
  );
}

/* =========================================================================
   6. DMCA & COPYRIGHT TAKEDOWN POLICY
   ========================================================================= */
export function DMCAPolicy() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">1. Notice and Takedown Protocol (17 U.S.C. § 512)</h2>
        <p>
          Voidwallz deeply respects the intellectual property rights of independent photographers, 3D artists, and digital visual creators. In accordance with the Digital Millennium Copyright Act (DMCA) and international copyright treaties, we maintain an expedited notice-and-takedown procedure for claimed copyright infringement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">2. Submitting a Notice of Claimed Infringement</h2>
        <p>
          If you are a copyright owner or an authorized agent thereof and believe that any content hosted on Voidwallz infringes upon your copyright, please transmit a formal written notice containing the following statutory elements:
        </p>
        <div className="vw-document-panel space-y-3">
          <p>1. <strong>Physical or electronic signature</strong> of a person authorized to act on behalf of the copyright owner.</p>
          <p>2. <strong>Identification of the copyrighted work</strong> claimed to have been infringed (e.g., direct portfolio URL or copyright registration certificate).</p>
          <p>3. <strong>Identification of the infringing material</strong> on Voidwallz (specific wallpaper URL or unique serial identifier like <code>ID: V-142</code>).</p>
          <p>4. <strong>Contact information</strong> including legal name, address, telephone number, and active email address.</p>
          <p>5. <strong>Good faith statement:</strong> "I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</p>
          <p>6. <strong>Accuracy statement:</strong> "I swear, under penalty of perjury, that the information in this notification is accurate, and that I am the copyright owner or authorized to act on behalf of the owner."</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">3. Designated Copyright Agent</h2>
        <p>Please deliver formal copyright notices directly to our designated DMCA Agent:</p>
        <div className="vw-document-panel">
          <p className="font-bold text-white">DMCA Compliance Agent // Voidwallz Legal</p>
          <p>Electronic Mail: <a href="mailto:voidwallzbusiness@gmail.com" className="text-white underline">voidwallzbusiness@gmail.com</a></p>
          <p className="text-white/40 mt-2 text-[10px]">Turnaround Commitment: We review and action verified takedown notices within 24 to 48 business hours.</p>
        </div>
      </section>
    </>
  );
}
