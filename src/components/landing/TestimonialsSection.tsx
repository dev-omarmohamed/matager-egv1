"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { TESTIMONIALS, TestimonialItem } from "@/data/testimonials.data";
import { Marquee } from "@/components/ui/Marquee";

export const TestimonialsSection: React.FC = () => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      id="testimonials"
      dir={dir}
      aria-label={isAr ? "آراء وتقييمات العملاء" : "Customer Testimonials"}
      className="w-full py-20 sm:py-28 relative text-[var(--color-text-primary)] overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
        {/* Section Header (No Badges) */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
          {isAr ? "ماذا يقول عملاؤنا عنا" : "What our users say about us"}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-[620px] mx-auto leading-relaxed">
          {isAr
            ? "تجار التجزئة، العملاء، وموردو الجملة يشاركون تجاربهم مع منظومة متاجر المتكاملة."
            : "Trusted by retail entrepreneurs, everyday shoppers, and industrial B2B wholesalers across the market."}
        </p>
      </div>

      {/* ─── SINGLE ROW INFINITE MARQUEE ─── */}
      <Marquee
        speed={28}
        direction="left"
        gap={20}
        pauseOnHover={true}
        ariaLabel={isAr ? "شريط آراء العملاء المتتابع" : "Testimonials scrolling carousel"}
      >
        {TESTIMONIALS.map((item: TestimonialItem) => (
          <div
            key={item.id}
            dir={dir}
            className="w-[320px] sm:w-[360px] h-[220px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col justify-between shadow-sm transition-all duration-200 hover:border-white/20 shrink-0 text-start"
          >
            {/* Quote */}
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic line-clamp-4">
              "{isAr ? item.quoteAr : item.quoteEn}"
            </p>

            {/* Author Footer (Plain Text Role, NOT a badge) */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              {/* Initials Avatar */}
              <div className="w-9 h-9 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-accent-blue)] shrink-0">
                {item.initials}
              </div>

              {/* Author Name and Plain-Text Role */}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                  {isAr ? item.nameAr : item.nameEn}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">
                  <span>{isAr ? item.roleLabelAr : item.roleLabelEn}</span>
                  <span className="mx-1.5 opacity-50">•</span>
                  <span>{isAr ? item.companyCityAr : item.companyCityEn}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
};

