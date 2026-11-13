"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import {
  Users,
  Store,
  Layers,
  FileCheck2,
  Navigation,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

export const EcosystemGrid: React.FC = () => {
  const { t, dir } = useLanguage();

  const modules = [
    {
      title: t.ecosystem.mod1Title,
      desc: t.ecosystem.mod1Desc,
      icon: Users,
      accent: "var(--color-accent-violet)",
    },
    {
      title: t.ecosystem.mod2Title,
      desc: t.ecosystem.mod2Desc,
      icon: Store,
      accent: "var(--color-accent-mint)",
    },
    {
      title: t.ecosystem.mod3Title,
      desc: t.ecosystem.mod3Desc,
      icon: Layers,
      accent: "var(--color-accent-violet)",
    },
    {
      title: t.ecosystem.mod4Title,
      desc: t.ecosystem.mod4Desc,
      icon: FileCheck2,
      accent: "var(--color-accent-mint)",
    },
    {
      title: t.ecosystem.mod5Title,
      desc: t.ecosystem.mod5Desc,
      icon: Navigation,
      accent: "var(--color-accent-violet)",
    },
    {
      title: t.ecosystem.mod6Title,
      desc: t.ecosystem.mod6Desc,
      icon: BrainCircuit,
      accent: "var(--color-accent-mint)",
    },
  ];

  return (
    <section id="ecosystem" dir={dir} className="w-full py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header (No Badges) */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
            {t.ecosystem.heading}
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-[640px] mx-auto">
            {t.ecosystem.subhead}
          </p>
        </div>
      </div>

      {/* ─── 6-MODULE SINGLE-ROW INFINITE MARQUEE ─── */}
      <Marquee
        speed={34}
        direction="left"
        gap={20}
        pauseOnHover={true}
        ariaLabel={t.ecosystem.heading}
      >
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              dir={dir}
              className="carbon-card w-[300px] sm:w-[360px] h-[280px] p-6 flex flex-col justify-between group hover:border-[var(--color-border-hover)] transition-all duration-200 shrink-0 text-start"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center">
                    <Icon className="w-4 h-4" style={{ color: mod.accent }} />
                  </div>
                </div>

                <h3 className="text-[17px] sm:text-[18px] font-medium text-[var(--color-text-primary)] mb-2.5">
                  {mod.title}
                </h3>

                <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span className="micro-label">subsystem_0{idx + 1}</span>
                <span className="flex items-center gap-1 text-[var(--color-accent-mint)]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Online</span>
                </span>
              </div>
            </div>
          );
        })}
      </Marquee>
    </section>
  );
};
