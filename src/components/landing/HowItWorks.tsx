"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Database, Split, Gauge } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

export const HowItWorks: React.FC = () => {
  const { t, dir } = useLanguage();

  const steps = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: Database,
      accent: "var(--color-accent-violet)",
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: Split,
      accent: "var(--color-accent-mint)",
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: Gauge,
      accent: "var(--color-accent-violet)",
    },
  ];

  return (
    <section id="how-it-works" dir={dir} className="w-full py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header (No Badges) */}
        <div className="text-center max-w-[720px] mx-auto mb-14 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
            {t.howItWorks.heading}
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-[620px] mx-auto">
            {t.howItWorks.subhead}
          </p>
        </div>
      </div>

      {/* ─── 3-STEP FLOW SINGLE-ROW INFINITE MARQUEE ─── */}
      <Marquee
        speed={30}
        direction="right"
        gap={24}
        pauseOnHover={true}
        ariaLabel={t.howItWorks.heading}
      >
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              dir={dir}
              className="carbon-card w-[320px] sm:w-[380px] h-[300px] p-6 sm:p-7 relative flex flex-col justify-between shrink-0 text-start"
            >
              <div>
                {/* Step Index & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[32px] font-bold text-[var(--color-text-muted)] opacity-60 tabular-nums">
                    {step.num}
                  </span>
                  <div
                    className="w-10 h-10 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center"
                  >
                    <Icon className="w-5 h-5" style={{ color: step.accent }} />
                  </div>
                </div>

                <h3 className="text-[18px] sm:text-[20px] font-medium text-[var(--color-text-primary)] mb-2.5">
                  {step.title}
                </h3>

                <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span className="micro-label">pipeline_stage_{idx + 1}</span>
                <span className="text-[var(--color-accent-blue)] font-medium">Ready</span>
              </div>
            </div>
          );
        })}
      </Marquee>
    </section>
  );
};
