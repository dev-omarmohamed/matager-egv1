"use client";

import React from "react";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useDashboardLanguage } from "@/lib/i18n";
import { useTheme } from "@/theme/useTheme";
import { StatusPill } from "@/components/ui/StatusPill";
import { Wholesaler } from "@/lib/wholesalers";

interface WholesalerTopNavProps {
  wholesaler: Wholesaler | null;
}

export const WholesalerTopNav: React.FC<WholesalerTopNavProps> = ({ wholesaler }) => {
  const { locale, toggleLocale, t } = useDashboardLanguage();
  const { theme, toggleTheme } = useTheme();

  const isAr = locale === "ar";
  const name = wholesaler
    ? isAr && wholesaler.profile.nameAr
      ? wholesaler.profile.nameAr
      : wholesaler.profile.name
    : "Wholesaler Console";

  const status = wholesaler?.profile.status || "active";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-canvas)]/85 border-b border-[var(--color-border-subtle)] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            aria-label="Matager Home"
          >
            <MatagerLogo size="md" showWordmark={true} />
          </a>

          <span
            className="h-4 w-px bg-[var(--color-border-subtle)] hidden sm:inline-block"
            aria-hidden="true"
          />

          <div className="flex items-center gap-2 text-xs font-heading">
            <span className="text-[var(--color-text-muted)] hidden sm:inline">
              Matager
            </span>
            <i className="bi bi-chevron-right text-[10px] text-[var(--color-text-muted)] rtl:rotate-180 hidden sm:inline" />
            <span className="text-[var(--color-text-secondary)] font-semibold hidden md:inline">
              {t.wholesaler.consoleTitle}
            </span>
            <i className="bi bi-chevron-right text-[10px] text-[var(--color-text-muted)] rtl:rotate-180 hidden md:inline" />
            <span className="text-[var(--color-text-primary)] font-bold max-w-[180px] sm:max-w-[260px] truncate">
              {name}
            </span>
          </div>

          <StatusPill variant={status === "active" ? "success" : "pending"} className="ms-2">
            {status === "active" ? t.wholesaler.active : t.wholesaler.paused}
          </StatusPill>
        </div>

        {/* Right: Actions, Language, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1.5 font-ui"
            aria-label={t.nav.switchLang}
          >
            <i className="bi bi-translate text-xs text-[var(--color-primary-light)]" />
            <span className="text-[11px]">{t.nav.switchLang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center text-xs"
            aria-label={t.nav.switchTheme}
          >
            {theme === "dark" ? (
              <i className="bi bi-sun text-xs text-[var(--color-status-amber)]" />
            ) : (
              <i className="bi bi-moon-stars text-xs text-[var(--color-primary-light)]" />
            )}
          </button>

          {/* Avatar Chip */}
          <div className="flex items-center gap-2 pl-1 rtl:pl-0 rtl:pr-1">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] flex items-center justify-center text-[11px] font-bold text-white shadow-sm font-ui">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-status-green)] border-2 border-[var(--color-canvas)]" />
            </div>
            <div className="hidden xl:flex flex-col leading-none">
              <span className="text-xs font-bold font-ui text-[var(--color-text-primary)]">
                {name}
              </span>
              <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
                Verified Wholesaler
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

