"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Store, CreditCard, Truck, BarChart3, ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

export const ValuePillars: React.FC = () => {
  const { t, dir } = useLanguage();

  const pillars = [
    {
      icon: Store,
      accent: "var(--color-accent-violet)",
      badgeColor: "rgba(153, 132, 216, 0.15)",
      badgeBorder: "rgba(153, 132, 216, 0.3)",
      title: t.pillars.card1Title,
      description: t.pillars.card1Description,
      metric: t.pillars.card1Metric,
      metricLabel: t.pillars.card1MetricLabel,
    },
    {
      icon: CreditCard,
      accent: "var(--color-accent-mint)",
      badgeColor: "rgba(63, 203, 127, 0.12)",
      badgeBorder: "rgba(63, 203, 127, 0.3)",
      title: t.pillars.card2Title,
      description: t.pillars.card2Description,
      metric: t.pillars.card2Metric,
      metricLabel: t.pillars.card2MetricLabel,
    },
    {
      icon: Truck,
      accent: "var(--color-accent-violet)",
      badgeColor: "rgba(153, 132, 216, 0.15)",
      badgeBorder: "rgba(153, 132, 216, 0.3)",
      title: t.pillars.card3Title,
      description: t.pillars.card3Description,
      metric: t.pillars.card3Metric,
      metricLabel: t.pillars.card3MetricLabel,
    },
    {
      icon: BarChart3,
      accent: "var(--color-accent-mint)",
      badgeColor: "rgba(63, 203, 127, 0.12)",
      badgeBorder: "rgba(63, 203, 127, 0.3)",
      title: t.pillars.card4Title,
      description: t.pillars.card4Description,
      metric: t.pillars.card4Metric,
      metricLabel: t.pillars.card4MetricLabel,
    },
  ];

  return (
    <section id="pillars" dir={dir} className="w-full py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header (No Badges) */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
            {t.pillars.heading}
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-[640px] mx-auto">
            {t.pillars.subhead}
          </p>
        </div>
      </div>

      {/* ─── 4 CARBON CARDS SINGLE-ROW INFINITE MARQUEE ─── */}
      <Marquee
        speed={32}
        direction="left"
        gap={24}
        pauseOnHover={true}
        ariaLabel={t.pillars.heading}
      >
        {pillars.map((pillar, idx) => {
          const IconComponent = pillar.icon;
          return (
            <div
              key={idx}
              dir={dir}
              className="carbon-card w-[340px] sm:w-[420px] h-[320px] p-6 sm:p-8 flex flex-col justify-between group hover:border-[var(--color-border-hover)] transition-all duration-200 shrink-0 text-start"
            >
              <div>
                {/* Top Row: Icon + Metric Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-11 h-11 rounded-[8px] flex items-center justify-center border"
                    style={{
                      backgroundColor: pillar.badgeColor,
                      borderColor: pillar.badgeBorder,
                    }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: pillar.accent }}
                    />
                  </div>

                  <div className="text-end">
                    <div
                      className="text-[20px] font-semibold tracking-tight tabular-nums"
                      style={{ color: pillar.accent }}
                    >
                      {pillar.metric}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {pillar.metricLabel}
                    </div>
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="text-[18px] sm:text-[20px] font-medium text-[var(--color-text-primary)] mb-2.5">
                  {pillar.title}
                </h3>

                {/* Benefit-Driven Description */}
                <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                  {pillar.description}
                </p>
              </div>

              {/* Telemetry Underline with Tabular Micro-Label */}
              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span className="micro-label">core_primitive_{idx + 1}</span>
                <span className="flex items-center gap-1 group-hover:text-[var(--color-text-primary)] transition-colors">
                  <span>Active Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 rtl:rotate-180" />
                </span>
              </div>
            </div>
          );
        })}
      </Marquee>
    </section>
  );
};
