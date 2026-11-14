"use client";

import React, { useState } from "react";
import { useLanguage } from "@/i18n";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SystemShowcaseSection } from "@/components/landing/SystemShowcaseSection";
import { ValuePillars } from "@/components/landing/ValuePillars";
import { MultiDeviceExperience } from "@/components/landing/MultiDeviceExperience";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EcosystemGrid } from "@/components/landing/EcosystemGrid";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { IntegrationsGrid } from "@/components/landing/IntegrationsGrid";
import { PricingCalculator, InitialPlanOptions } from "@/components/landing/PricingCalculator";
import { WholesalerCTABanner } from "@/components/landing/WholesalerCTABanner";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AuthModal } from "@/components/auth/AuthModal";
import { DownloadAppModal } from "@/components/modals/DownloadAppModal";
import { WholesaleContactModal } from "@/components/modals/WholesaleContactModal";
import { useDownloadApp } from "@/hooks/useDownloadApp";
import { LiveRegion } from "@/components/common/LiveRegion";
import { LanguageTransitionOverlay } from "@/components/common/LanguageTransitionOverlay";
import { GsapScrollManager } from "@/components/layout/GsapScrollManager";
import { LanguageSwitcher } from "@/i18n";
import { ThemeToggle } from "@/theme";
import { Download, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { t } = useLanguage();

  // Auth modal management
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authRole, setAuthRole] = useState<"owner" | "employee" | "wholesaler">("owner");
  const [initialPlanOptions, setInitialPlanOptions] = useState<InitialPlanOptions | undefined>(
    undefined
  );

  // Contact requests modal (wholesaler or storeowner enterprise > 550)
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactModalMode, setContactModalMode] = useState<"wholesaler" | "storeowners">(
    "wholesaler"
  );

  // App download modal & OS redirect hook
  const { isDownloadModalOpen, handleDownload, closeDownloadModal } = useDownloadApp();

  // Screen-reader live region announcement
  const [announcement, setAnnouncement] = useState("");

  const handleOpenAuth = (
    mode: "signin" | "signup" = "signin",
    role: "owner" | "employee" | "wholesaler" = "owner",
    options?: InitialPlanOptions
  ) => {
    setAuthMode(mode);
    setAuthRole(role);
    setInitialPlanOptions(options);
    setAuthModalOpen(true);
    setAnnouncement(
      mode === "signup"
        ? "Opening Matager merchant signup terminal."
        : "Opening Matager access portal."
    );
  };

  const handleOpenEnterpriseContact = () => {
    setContactModalMode("storeowners");
    setContactModalOpen(true);
  };

  const handleOpenWholesaleContact = () => {
    setContactModalMode("wholesaler");
    setContactModalOpen(true);
  };

  return (
    <GsapScrollManager>
      <div className="min-h-screen w-full bg-[var(--color-canvas)] text-[var(--color-text-primary)] relative overflow-x-hidden selection:bg-[var(--color-accent-violet)]/30 selection:text-white">
        {/* Dynamic Dual-Theme Technical Grid Background across entire page */}
        <div className="landing-grid-bg" aria-hidden="true" />

        {/* Screen-reader live region announcer */}
        <LiveRegion message={announcement} />

        {/* Smooth animated language switching transition overlay */}
        <LanguageTransitionOverlay />

        {/* Persistent Top Navigation Bar (Minimalist) */}
        <LandingHeader onOpenAuth={handleOpenAuth} />

        <main id="top" className="relative pt-24 sm:pt-32">
          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 1: HERO CENTERED STACK
              ══════════════════════════════════════════════════════════════════════ */}
          <section className="relative px-3 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20">
            <div className="max-w-[1240px] mx-auto text-center">
              {/* ─── Controls Pill (Language Switcher & Theme Toggle) Above H1 ─── */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm mb-6 sm:mb-8">
                <LanguageSwitcher />
                <div className="w-[1px] h-4 bg-[var(--color-border)] opacity-60" />
                <ThemeToggle />
              </div>

              {/* ─── Hero Headline (Josefin Sans / El Messiri at 48-54px) ─── */}
              <div className="space-y-4 max-w-[880px] mx-auto">
                <h1 className="font-heading text-[38px] sm:text-[48px] md:text-[54px] font-normal leading-[1.05] text-[var(--color-text-primary)] tracking-tight">
                  {t.hero.brand} — {t.hero.tagline}
                </h1>

                {/* Subhead in muted text, max-width 640px */}
                <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] max-w-[640px] mx-auto pt-2">
                  {t.hero.supporting}
                </p>
              </div>

              {/* ─── Button Row (White Filled Pill + Download App Ghost Action) ─── */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-8 sm:mt-10">
                {/* Primary Filled White Pill Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAuth("signup", "owner")}
                  className="btn-primary-pill text-[15px] py-3 px-6 shadow-sm"
                >
                  <span>{t.hero.primaryCta}</span>
                </button>

                {/* Secondary Download App Action */}
                <button
                  type="button"
                  onClick={(e) => handleDownload(e.currentTarget)}
                  className="btn-ghost-action text-[15px] inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 opacity-70" />
                  <span>{t.hero.secondaryCta}</span>
                </button>
              </div>

              {/* ─── Trust Line in Ash Gray ─── */}
              <div className="mt-8 text-[13px] text-[var(--color-text-muted)] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent-mint)] opacity-80" />
                <span>{t.hero.trustLine}</span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 2: STANDALONE SYSTEM SCREENSHOTS & MODALS SHOWCASE
              (2 Opposite Horizontal Infinite Scrolling Tracks)
              ══════════════════════════════════════════════════════════════════════ */}
          <SystemShowcaseSection />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 3: VALUE PILLARS (4 Carbon Cards Marquee)
              ══════════════════════════════════════════════════════════════════════ */}
          <ValuePillars />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 3.5: MULTI-DEVICE EXPERIENCE (#devices)
              6-Device Layered Stack: TV, Desktop, Laptop, POS, Tablet, Phone
              ══════════════════════════════════════════════════════════════════════ */}
          <MultiDeviceExperience
            onOpenAuth={handleOpenAuth}
            onOpenDownload={() => handleDownload()}
          />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 4: HOW IT WORKS (3 Steps Flow Marquee)
              ══════════════════════════════════════════════════════════════════════ */}
          <HowItWorks />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 5: ECOSYSTEM OVERVIEW (6 Modules Marquee)
              ══════════════════════════════════════════════════════════════════════ */}
          <EcosystemGrid />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 6: TESTIMONIALS (9 User Stories Marquee: Store Owners, Customers, Wholesalers)
              ══════════════════════════════════════════════════════════════════════ */}
          <TestimonialsSection />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 7: INTEGRATIONS LOGO GRID (2 Opposite Horizontal Lines)
              ══════════════════════════════════════════════════════════════════════ */}
          <IntegrationsGrid />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 8: COMMERCIAL VOLUME & PRICING CALCULATOR (5-Stop Snapping Slider)
              ══════════════════════════════════════════════════════════════════════ */}
          <PricingCalculator
            onOpenAuth={handleOpenAuth}
            onOpenEnterpriseContact={handleOpenEnterpriseContact}
          />

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 9: WHOLESALER B2B SUPPLY CTA BANNER (Contact Modal Flow Only)
              ══════════════════════════════════════════════════════════════════════ */}
          <WholesalerCTABanner onOpenContact={handleOpenWholesaleContact} />
        </main>

        {/* ══════════════════════════════════════════════════════════════════════
            FINAL CTA & TERMINAL FOOTER
            ══════════════════════════════════════════════════════════════════════ */}
        <LandingFooter onOpenAuth={handleOpenAuth} onOpenDownload={() => handleDownload()} />

        {/* ══════════════════════════════════════════════════════════════════════
            MODALS
            ══════════════════════════════════════════════════════════════════════ */}
        {/* Unified Authentication Modal (Owner & Staff) */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          initialRole={authRole}
          initialPlanOptions={initialPlanOptions}
          onOpenEnterpriseContact={handleOpenEnterpriseContact}
          onClose={() => setAuthModalOpen(false)}
        />

        {/* Universal App Download Modal */}
        <DownloadAppModal
          isOpen={isDownloadModalOpen}
          onClose={closeDownloadModal}
        />

        {/* Contact Requests Modal (Wholesaler & Storeowner 550+) */}
        <WholesaleContactModal
          isOpen={contactModalOpen}
          mode={contactModalMode}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </GsapScrollManager>
  );
}
