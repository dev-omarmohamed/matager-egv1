"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Mail, ArrowRight } from "lucide-react";

interface WholesalerCTABannerProps {
  onOpenContact: () => void;
}

export const WholesalerCTABanner: React.FC<WholesalerCTABannerProps> = ({ onOpenContact }) => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section className="relative px-4 sm:px-6 py-12 sm:py-16 max-w-[1240px] mx-auto" dir={dir}>
      <div className="relative rounded-[28px] overflow-hidden border border-[var(--color-glass-card-border)] bg-[var(--color-glass-card-bg)] shadow-[var(--shadow-glass-card)] p-8 sm:p-12 transition-all duration-300 hover:border-[var(--color-primary-light)]/40">
        {/* Ambient subtle glow */}
        <div
          className="absolute -top-24 end-0 w-96 h-96 pointer-events-none blur-3xl opacity-20 bg-[var(--gradient-primary)]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left rtl:lg:text-right">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-[var(--color-text-primary)] tracking-tight">
              {isAr ? "هل أنت تاجر جملة أو مصنّع؟" : "Are You a Wholesaler or Manufacturer?"}
            </h2>

            <p className="text-sm sm:text-base font-subtitle text-[var(--color-text-secondary)] leading-relaxed">
              {isAr
                ? "زوّد آلاف متاجر التجزئة المعتمدة على متاجر مباشرة بشرائح أسعار مرنة وطلبات تجارية موثقة."
                : "Supply thousands of verified Matager retail stores directly with tiered pricing and direct trade inquiries."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-check2-circle text-[var(--color-primary-light)] text-sm" />
                {isAr ? "وصول حصري لتجار التجزئة المعتمدين" : "Category-Gated Buyer Exposure"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <i className="bi bi-check2-circle text-[var(--color-primary-light)] text-sm" />
                {isAr ? "شرائح أسعار متدرجة حسب كميات التوريد" : "Dynamic Tiered Discount Ladders"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <i className="bi bi-check2-circle text-[var(--color-primary-light)] text-sm" />
                {isAr ? "طلبات تجارية واستفسارات موثقة ومباشرة" : "Direct Verified Inquiries"}
              </span>
            </div>
          </div>

          {/* Single Contact Us Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenContact}
              className="btn-primary-pill text-[13px] sm:text-[14px] font-ui py-1.5 sm:py-2 px-3.5 sm:px-5"
            >
              <Mail className="w-4 h-4" />
              <span>{isAr ? "تواصل معنا" : "Contact us"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

