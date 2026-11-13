"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Marquee } from "@/components/ui/Marquee";
import {
  SHOWCASE_ROW_1_SCREENS,
  SHOWCASE_ROW_2_MODALS,
  ShowcaseSlot,
} from "@/config/system-showcase.config";
import { Layers, Sparkles, Monitor, AppWindow } from "lucide-react";

export const SystemShowcaseSection: React.FC = () => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";

  const renderSlotCard = (slot: ShowcaseSlot, isModalTrack: boolean = false) => {
    const title = isAr ? slot.titleAr : slot.titleEn;
    const category = isAr ? slot.categoryAr : slot.categoryEn;

    return (
      <div
        key={slot.id}
        dir={dir}
        className="w-[340px] sm:w-[440px] md:w-[480px] h-[220px] sm:h-[270px] md:h-[290px] rounded-[16px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:border-[var(--color-border-hover)] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shrink-0 select-none text-start"
      >
        {/* Top Window Chrome Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ms-2 text-[10px] sm:text-[11px] font-semibold text-[var(--color-text-secondary)] truncate max-w-[200px]">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="micro-label text-[9px] sm:text-[10px] text-[var(--color-text-muted)]">
              {slot.tag}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Screen / Modal Image Content Area */}
        <div className="relative flex-1 w-full overflow-hidden bg-slate-50 dark:bg-[#07080b] flex items-center justify-center p-3 sm:p-5">
          {slot.src ? (
            <img
              src={slot.src}
              alt={title}
              decoding="async"
              loading="lazy"
              className="w-full h-full object-cover rounded-[8px]"
            />
          ) : (
            /* Dual-Theme Hardware Wireframe Placeholder */
            <div className="w-full h-full rounded-[10px] border border-dashed border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-3 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#0479E8]/10 text-[#0479E8] dark:text-[#0083FE] flex items-center justify-center">
                    {isModalTrack ? (
                      <AppWindow className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                      {title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)]">
                      {category}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? "جاهز للصورة" : "Image Slot Ready"}</span>
                </div>
              </div>

              {/* Wireframe Mockup Lines */}
              <div className="space-y-2 py-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-9 sm:h-12 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 p-1.5 flex flex-col justify-between">
                    <div className="w-8 h-1.5 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="w-12 h-2 rounded bg-[#0479E8]/40" />
                  </div>
                  <div className="h-9 sm:h-12 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 p-1.5 flex flex-col justify-between">
                    <div className="w-8 h-1.5 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="w-12 h-2 rounded bg-emerald-500/40" />
                  </div>
                  <div className="h-9 sm:h-12 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 p-1.5 flex flex-col justify-between">
                    <div className="w-8 h-1.5 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="w-12 h-2 rounded bg-purple-500/40" />
                  </div>
                </div>

                <div className="w-full h-2 rounded bg-slate-100 dark:bg-white/5" />
              </div>

              {/* Micro telemetry footer */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--color-text-muted)]">
                <span className="micro-label">/public/showcase/{slot.id}.webp</span>
                <span className="tabular-nums">1600 × 1000 PX</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      id="system-showcase"
      dir={dir}
      aria-label={isAr ? "معرض شاشات وتطبيقات المنظومة" : "Matager System Screenshots Gallery"}
      className="w-full py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-10 sm:mb-14 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-3 leading-[1.15]">
          {isAr
            ? "شاشات وتطبيقات المنظومة الموحدة"
            : "One Unified System. Every Screen & Modal."}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-[680px] mx-auto leading-relaxed">
          {isAr
            ? "استكشف تجربة استخدام متكاملة وسلسة تشمل واجهات المتجر، ولوحة تحكم التاجر، ونظام الكاشير السريع، ونوافذ العمليات اللحظية."
            : "Explore an ultra-fluid omnichannel experience spanning customer storefronts, merchant operations, POS checkout, and instant modal workflows."}
        </p>
      </div>

      {/* ─── 2 OPPOSITE HORIZONTAL INFINITE SCROLLING TRACKS ─── */}
      <div className="space-y-5 sm:space-y-6">
        {/* Track 1: System Screens (Moves Left) */}
        <div>
          <Marquee
            speed={30}
            direction="left"
            gap={20}
            pauseOnHover={true}
            ariaLabel="System core screens scrolling gallery"
          >
            {SHOWCASE_ROW_1_SCREENS.map((slot) => renderSlotCard(slot, false))}
          </Marquee>
        </div>

        {/* Track 2: Modals, Drawers & Select Controls (Moves Right - Opposite Direction) */}
        <div>
          <Marquee
            speed={30}
            direction="right"
            gap={20}
            pauseOnHover={true}
            ariaLabel="Modals, drawers and select options scrolling gallery"
          >
            {SHOWCASE_ROW_2_MODALS.map((slot) => renderSlotCard(slot, true))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

