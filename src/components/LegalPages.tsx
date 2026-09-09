import { ArrowLeft, Shield, FileText, Lock, Cookie, RotateCcw, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  activeSlug: "privacy" | "terms" | "license" | "cookies" | "refunds" | "dmca";
  lastUpdated: string;
  children: ReactNode;
}

const LEGAL_TABS = [
  { slug: "privacy", label: "Privacy Policy", icon: Lock, path: "/privacy" },
  { slug: "terms", label: "Terms of Service", icon: FileText, path: "/terms" },
  { slug: "license", label: "License", icon: Shield, path: "/license" },
  { slug: "cookies", label: "Cookie Policy", icon: Cookie, path: "/cookies" },
  { slug: "refunds", label: "Refund Policy", icon: RotateCcw, path: "/refunds" },
  { slug: "dmca", label: "DMCA & Copyright", icon: AlertTriangle, path: "/dmca" },
];

const LegalLayout = ({
  title,
  activeSlug,
  children,
  lastUpdated,
}: LegalLayoutProps) => {
  const handleNavigate = (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-void-black text-void-light pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-32 px-4 sm:px-6 md:px-10 relative z-[70]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Top Back Nav */}
        <button
          onClick={() => handleNavigate("/")}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mb-8 sm:mb-12 hover-trigger cursor-pointer"
        >
          <ArrowLeft size={14} />
          Return to Terminal
        </button>

        {/* Header Block */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
            <span>Voidwallz Compliance & Legal Portal</span>
            <span>//</span>
            <span>Document {activeSlug.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic tracking-tighter mb-3 text-white">
            {title}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
            Last Reviewed & Enforced: {lastUpdated}
          </p>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4 mb-10 border-b border-white/5">
          {LEGAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.slug === activeSlug;
            return (
              <button
                key={tab.slug}
                onClick={() => handleNavigate(tab.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Document Content Stream */}
        <div className="space-y-12 text-sm leading-relaxed opacity-85 text-white/80 font-sans">
          {children}
        </div>

        {/* Bottom Operator & Contact Sign-off */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            <span className="block text-white font-semibold">Operator: Voidwallz Digital Design Collective</span>
            <span>Registered Digital Presence // Worldwide Electronic Services</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="block">Business & Legal: <a href="mailto:voidwallzbusiness@gmail.com" className="text-white hover:underline">voidwallzbusiness@gmail.com</a></span>
            <span>DMCA & Support: <a href="mailto:voidwallzbusiness@gmail.com" className="text-white hover:underline">voidwallzbusiness@gmail.com</a></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================================
   1. PRIVACY POLICY
   ========================================================================= */
export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" activeSlug="privacy" lastUpdated="September 2026">
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
    </LegalLayout>
  );
}

/* =========================================================================
   2. TERMS OF SERVICE
   ========================================================================= */
export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" activeSlug="terms" lastUpdated="September 2026">
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
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/80 leading-relaxed">
          THE PLATFORM AND ALL DIGITAL ASSETS ARE PROVIDED STRICTLY ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR FREEDOM FROM INTERRUPTIONS OR ERRORS.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall Voidwallz, its directors, employees, or contributors be liable for any indirect, punitive, incidental, or consequential damages resulting from your access to or inability to access the Platform.
        </p>
      </section>
    </LegalLayout>
  );
}

/* =========================================================================
   3. LICENSE AGREEMENT
   ========================================================================= */
export function License() {
  return (
    <LegalLayout title="Personal Use License" activeSlug="license" lastUpdated="September 2026">
      <section className="space-y-3">
        <h2 className="text-white text-xl font-serif italic">Grant of License</h2>
        <p>
          Every master wallpaper asset downloaded from Voidwallz is licensed to you under a non-exclusive, non-transferable, revocable <strong>Personal Digital Display License</strong>.
        </p>

        <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-6 font-mono text-xs mt-6 space-y-6">
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
    </LegalLayout>
  );
}

/* =========================================================================
   4. COOKIE POLICY
   ========================================================================= */
export function CookiePolicy() {
  return (
    <LegalLayout title="Cookie & Storage Policy" activeSlug="cookies" lastUpdated="September 2026">
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
    </LegalLayout>
  );
}

/* =========================================================================
   5. REFUND & DIGITAL GOODS POLICY
   ========================================================================= */
export function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Digital Goods Policy" activeSlug="refunds" lastUpdated="September 2026">
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
    </LegalLayout>
  );
}

/* =========================================================================
   6. DMCA & COPYRIGHT TAKEDOWN POLICY
   ========================================================================= */
export function DMCAPolicy() {
  return (
    <LegalLayout title="DMCA & Copyright Policy" activeSlug="dmca" lastUpdated="September 2026">
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-xs space-y-3 text-white/80">
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
        <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/15 font-mono text-xs text-white/90">
          <p className="font-bold text-white">DMCA Compliance Agent // Voidwallz Legal</p>
          <p>Electronic Mail: <a href="mailto:voidwallzbusiness@gmail.com" className="text-white underline">voidwallzbusiness@gmail.com</a></p>
          <p className="text-white/40 mt-2 text-[10px]">Turnaround Commitment: We review and action verified takedown notices within 24 to 48 business hours.</p>
        </div>
      </section>
    </LegalLayout>
  );
}
