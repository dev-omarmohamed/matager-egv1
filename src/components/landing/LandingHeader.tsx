"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";

interface LandingHeaderProps {
  onOpenAuth: (mode?: "signin" | "signup", role?: "owner" | "employee" | "wholesaler") => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenAuth }) => {
  const { t } = useLanguage();
  const { scrollTo } = useSmoothScroll();

  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  // Monitor scroll position
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    if (targetId === "top") {
      scrollTo(0);
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      scrollTo(element, { offset: -90 });
    }
  };

  const isScrolled = mounted && scrolled;

  return (
    <header
      suppressHydrationWarning
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div
        suppressHydrationWarning
        className={`max-w-[1240px] mx-auto px-4 sm:px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "pt-2.5 sm:pt-3" : "pt-4"
        }`}
      >
        <div
          suppressHydrationWarning
          className={`relative rounded-[16px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border ${
            isScrolled
              ? "bg-[var(--color-canvas)]/92 backdrop-blur-xl border-[var(--color-border)] shadow-xl py-2.5 sm:py-3 px-4 sm:px-6"
              : "bg-transparent border-transparent py-2 px-2"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Wordmark */}
            <a
              href="#top"
              onClick={(e) => handleNavClick(e, "#top")}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] rounded-[6px] shrink-0"
              aria-label={t.hero.brand}
            >
              <MatagerLogo size="sm" showWordmark={true} animated={false} />
            </a>

            {/* Right: Auth Actions (Minimalist Header) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Regular Log in button */}
              <button
                type="button"
                onClick={() => onOpenAuth("signin", "owner")}
                className="btn-ghost-action text-[13px] font-ui py-1.5 px-3 sm:px-3.5"
              >
                {t.nav.signIn}
              </button>

              {/* Primary Pill CTA */}
              <button
                type="button"
                onClick={() => onOpenAuth("signup", "owner")}
                className="btn-primary-pill text-[13px] sm:text-[14px] font-ui py-1.5 sm:py-2 px-3.5 sm:px-5"
              >
                <span>{t.nav.getStarted}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
