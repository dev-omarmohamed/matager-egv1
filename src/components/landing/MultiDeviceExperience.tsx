"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Marquee } from "@/components/ui/Marquee";
import { Layers, Clock, Wifi, Sparkles } from "lucide-react";

interface MultiDeviceExperienceProps {
  onOpenAuth?: (mode?: "signin" | "signup", role?: "owner" | "employee" | "wholesaler") => void;
  onOpenDownload?: () => void;
}

export const MultiDeviceExperience: React.FC<MultiDeviceExperienceProps> = () => {
  const { t, dir } = useLanguage();

  const statChips = [
    { label: t.devices.chips.formFactors, icon: Layers },
    { label: t.devices.chips.renderLatency, icon: Clock },
    { label: t.devices.chips.offlineReady, icon: Wifi },
    { label: t.devices.chips.oneCodebase, icon: Sparkles },
  ];

  return (
    <section
      id="devices"
      aria-labelledby="devices-heading"
      dir={dir}
      className="w-full py-16 sm:py-24 relative overflow-x-clip"
    >
      {/* ─── SECTION-SCOPED DESIGN TOKENS (Zero raw hex colors) ─── */}
      <style jsx>{`
        #devices {
          --device-bezel: color-mix(in srgb, var(--color-surface-elevated) 70%, var(--color-border));
          --device-screen-bg: var(--color-surface);
          --device-border: color-mix(in srgb, var(--color-border) 80%, transparent);
          --device-border-highlight: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
          --device-floor-shadow: color-mix(in srgb, var(--color-canvas) 80%, var(--color-void-black));
          --device-stand: color-mix(in srgb, var(--color-surface-elevated) 85%, var(--color-text-secondary));
          --device-metal-edge: color-mix(in srgb, var(--color-border) 70%, var(--color-text-muted));
        }

        [data-theme="light"] #devices {
          --device-bezel: #1e2024;
          --device-screen-bg: var(--color-ghost-white);
          --device-border: #2d3036;
          --device-border-highlight: rgba(255, 255, 255, 0.15);
          --device-floor-shadow: rgba(0, 0, 0, 0.22);
          --device-stand: #d1d5db;
          --device-metal-edge: #9ca3af;
        }

        [data-theme="dark"] #devices,
        :root:not([data-theme="light"]) #devices {
          --device-bezel: #121316;
          --device-screen-bg: var(--color-surface);
          --device-border: #26282e;
          --device-border-highlight: rgba(255, 255, 255, 0.08);
          --device-floor-shadow: rgba(0, 0, 0, 0.65);
          --device-stand: #2a2d34;
          --device-metal-edge: #3f424b;
        }
      `}</style>

      {/* ─── 01. Heading & Paragraph ─── */}
      <div className="text-center max-w-[780px] mx-auto mb-10 sm:mb-14 px-4 sm:px-6">
        <h2
          id="devices-heading"
          className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15] text-balance"
        >
          {t.devices.heading}
        </h2>

        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-[680px] mx-auto text-balance">
          {t.devices.subtitle}
        </p>
      </div>

      {/* ─── 02. Infinite Scroll Area: Devices from Mobile to TV (Empty Inner Screens) ─── */}
      <div className="w-full relative my-4 sm:my-6 overflow-hidden">
        <Marquee speed={28} direction="left" gap={36} pauseOnHover={true} className="py-2">
          {/* ─────────────────────────────────────────────────────────────
              1. MOBILE PHONE (Portrait, Dynamic Island pill, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* Phone Chassis */}
            <div className="w-[130px] h-[255px] rounded-[24px] p-2 bg-[var(--device-bezel)] border border-[var(--device-border)] shadow-xl relative overflow-hidden flex flex-col shrink-0">
              {/* Dynamic Island Pill */}
              <div className="absolute top-2 inset-x-0 mx-auto w-9 h-2.5 rounded-full bg-[var(--device-bezel)] z-20 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse ms-auto me-1" />
              </div>

              {/* Empty Inner Screen (Placeholder ready for future image) */}
              <div className="w-full h-full rounded-[18px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* Contact Floor Shadow */}
            <div
              className="w-[115px] h-3 rounded-full blur-[3px] pointer-events-none mt-1.5 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. TABLET (Portrait, Metal Edge, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* Tablet Chassis */}
            <div className="w-[200px] h-[265px] rounded-[22px] p-2 bg-[var(--device-bezel)] border border-[var(--device-metal-edge)] shadow-xl relative overflow-hidden flex flex-col shrink-0">
              {/* Empty Inner Screen */}
              <div className="w-full h-full rounded-[16px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* Contact Floor Shadow */}
            <div
              className="w-[180px] h-3 rounded-full blur-[3px] pointer-events-none mt-1.5 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. LAPTOP (Webcam Notch, Base Deck with Thumb Cut-Out, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* Laptop Screen Frame */}
            <div className="w-[330px] h-[208px] rounded-[14px] p-2 bg-[var(--device-bezel)] border border-[var(--device-border)] shadow-xl relative overflow-hidden flex flex-col shrink-0">
              {/* Top Webcam Notch */}
              <div className="absolute top-0 inset-x-0 mx-auto w-12 h-2.5 rounded-b-[4px] bg-[var(--device-bezel)] z-20 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)] opacity-80" />
              </div>

              {/* Empty Inner Screen */}
              <div className="w-full h-full rounded-[9px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* Laptop Base Deck with Thumb Cut-Out */}
            <div className="w-[344px] -ms-[7px] h-[12px] rounded-b-[8px] bg-[var(--device-stand)] border-t border-[var(--device-border)] shadow-md flex items-center justify-center relative shrink-0">
              <div className="w-14 h-1 rounded-b-[4px] bg-[var(--color-border)] opacity-60" />
            </div>

            {/* Contact Floor Shadow */}
            <div
              className="w-[310px] h-3.5 rounded-full blur-[4px] pointer-events-none mt-1 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. DESKTOP PC (Monitor, Slim Neck, Wide Pedestal Base, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* Monitor Screen Frame */}
            <div className="w-[390px] h-[235px] rounded-[16px] p-2.5 bg-[var(--device-bezel)] border border-[var(--device-border)] shadow-xl relative overflow-hidden flex flex-col shrink-0">
              {/* Empty Inner Screen */}
              <div className="w-full h-full rounded-[10px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* Stand Neck */}
            <div className="w-12 h-8 bg-[var(--device-stand)] border-x border-[var(--device-border)] shrink-0" />

            {/* Wide Pedestal Base */}
            <div className="w-44 h-2.5 rounded-full bg-[var(--device-stand)] border border-[var(--device-border)] shadow-md relative shrink-0" />

            {/* Contact Floor Shadow */}
            <div
              className="w-[180px] h-3.5 rounded-full blur-[3px] pointer-events-none mt-1 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. CASHIER POS TERMINAL (Counter Mount, Card Reader, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* Terminal Screen Frame */}
            <div className="w-[260px] h-[200px] rounded-[16px] p-2 bg-[var(--device-bezel)] border border-[var(--device-border)] shadow-xl relative overflow-visible flex flex-col shrink-0">
              {/* Magnetic Card Reader Detail */}
              <div
                className="absolute top-[20%] -end-2.5 w-2.5 h-[55%] rounded-e-md bg-[var(--device-stand)] border-y border-e border-[var(--device-border)] flex flex-col items-center justify-center gap-1 shadow-md"
                aria-hidden="true"
              >
                <span className="w-0.5 h-10 bg-[var(--color-border)] rounded-full" />
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Empty Inner Screen */}
              <div className="w-full h-full rounded-[11px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* Counter Mount Base */}
            <div className="w-20 h-7 bg-[var(--device-stand)] mx-auto rounded-b-lg border-x border-b border-[var(--device-border)] shadow-md relative shrink-0" />

            {/* Contact Floor Shadow */}
            <div
              className="w-[120px] h-3 rounded-full blur-[3px] pointer-events-none mt-1 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              6. TV / LARGE DISPLAY (16:9 Screen, Display Feet, Empty Screen)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-end shrink-0 h-[310px] sm:h-[330px] pb-4 select-none">
            {/* TV Screen Frame */}
            <div className="w-[440px] h-[250px] rounded-[14px] p-2 bg-[var(--device-bezel)] border border-[var(--device-border)] shadow-xl relative overflow-hidden flex flex-col shrink-0">
              {/* Empty Inner Screen */}
              <div className="w-full h-full rounded-[9px] bg-[var(--device-screen-bg)] border border-[var(--device-border-highlight)] overflow-hidden relative" />
            </div>

            {/* TV Display Feet */}
            <div className="flex justify-between w-64 mx-auto shrink-0">
              <div className="w-8 h-2.5 rounded-b-md bg-[var(--device-stand)] border-x border-b border-[var(--device-border)]" />
              <div className="w-8 h-2.5 rounded-b-md bg-[var(--device-stand)] border-x border-b border-[var(--device-border)]" />
            </div>

            {/* Contact Floor Shadow */}
            <div
              className="w-[410px] h-3.5 rounded-full blur-[4px] pointer-events-none mt-1 shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--device-floor-shadow) 0%, transparent 72%)",
              }}
              aria-hidden="true"
            />
          </div>
        </Marquee>
      </div>

      {/* ─── 03. Stat Chips Row Directly Underneath (and nothing else) ─── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-4">
        {statChips.map((chip, i) => {
          const Icon = chip.icon;
          return (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-secondary)] shadow-sm select-none"
            >
              <Icon className="w-3.5 h-3.5 text-[var(--color-accent-blue)] shrink-0" />
              <span className="font-ui font-medium">{chip.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
