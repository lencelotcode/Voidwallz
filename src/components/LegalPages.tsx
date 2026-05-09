import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode } from "react";

const LegalLayout = ({ title, children, lastUpdated }: { title: string; children: ReactNode; lastUpdated: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-void-black text-void-light pt-32 pb-24 px-10 relative z-[70]"
    >
      <div className="max-w-3xl mx-auto">
        <a 
          href="#" 
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mb-16 hover-trigger"
        >
          <ArrowLeft size={14} />
          Return to Void
        </a>
        
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter mb-6">{title}</h1>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-16">Last Updated: {lastUpdated}</p>
        
        <div className="space-y-12 text-sm leading-relaxed opacity-70">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 9, 2026">
      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">1. Information We Collect</h2>
        <p className="mb-4">We collect minimal information necessary to provide you with the best aesthetic experience. This includes:</p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs">
          <li>Usage data (resolution preferences, download history)</li>
          <li>Newsletter subscription email (if provided)</li>
          <li>Technical data (browser type, screen resolution) to optimize our OLED offerings</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">2. Zero Tracking Philosophy</h2>
        <p>We do not use third-party tracking cookies or invasive analytics. The void remains pure. Your aesthetic preferences are your own, and we do not sell your data to advertisers.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">3. Data Storage</h2>
        <p>Emails collected for the drop newsletter are stored securely and never shared. You may choose to unsubscribe and have your data wiped from the void at any time.</p>
      </section>
    </LegalLayout>
  );
}

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 9, 2026">
      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">1. Acceptance of Terms</h2>
        <p>By accessing voidwallz, you agree to these terms. If you do not agree, please exit the void.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">2. Use of Content</h2>
        <p className="mb-4">All wallpapers are provided for personal, non-commercial use on your digital devices. You may not:</p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs">
          <li>Resell or redistribute the files</li>
          <li>Claim the artworks as your own</li>
          <li>Use them in commercial products or templates</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">3. Service Availability</h2>
        <p>We strive to maintain a 99.9% uptime, but the void occasionally shifts. We are not liable for temporary service interruptions or data loss.</p>
      </section>
    </LegalLayout>
  );
}

export function License() {
  return (
    <LegalLayout title="License" lastUpdated="May 9, 2026">
      <section>
        <h2 className="text-white text-xl font-serif italic mb-4">Personal Use License</h2>
        <p className="mb-4">All digital assets downloaded from voidwallz are bound by this Personal Use License.</p>
        
        <div className="bg-white/5 border border-white/10 p-6 font-mono text-xs mt-8">
          <h3 className="text-white mb-4 uppercase tracking-widest text-[10px]">Permitted Usage:</h3>
          <ul className="list-none space-y-2 opacity-80 mb-8">
            <li>✓ Personal digital devices (phones, tablets, laptops, monitors)</li>
            <li>✓ Personal non-monetized social media backgrounds</li>
            <li>✓ Cropping or resizing for personal screens</li>
          </ul>

          <h3 className="text-white mb-4 uppercase tracking-widest text-[10px]">Restricted Usage:</h3>
          <ul className="list-none space-y-2 opacity-80">
            <li>✗ Resale or redistribution of the original or modified files</li>
            <li>✗ Minting as NFTs or other crypto-assets</li>
            <li>✗ Inclusion in applications, themes, templates, or physical products</li>
            <li>✗ Providing the files on a public repository or shared drive</li>
          </ul>
        </div>
      </section>
    </LegalLayout>
  );
}
