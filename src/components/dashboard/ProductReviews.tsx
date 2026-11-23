"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { MessageSquare } from "lucide-react";

export const ProductReviews: React.FC = () => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");

  const reviews: Array<{
    id: string;
    product: string;
    author: string;
    rating: string;
    comment: string;
    status: string;
    image?: string;
  }> = [];

  const filtered = reviews.filter(
    (r) =>
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-product-reviews"
        className="peer/rev hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
              {t.productReviews.title}
            </h3>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              {t.productReviews.subtitle}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            0
          </span>
        </div>

        <label
          htmlFor="toggle-product-reviews"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/rev:[&_.rev-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.productReviews.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] rev-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/rev:max-h-[300px] bg-[var(--color-surface-elevated)]/20">
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-[var(--color-text-muted)]" />
              <span className="font-bold text-[var(--color-text-primary)]">
                {isAr ? "لا توجد تقييمات بعد" : "No product reviews yet"}
              </span>
              <span className="text-[10px]">
                {isAr
                  ? "آراء وتقييمات العملاء لمنتجاتك ستظهر هنا فور إرسالها."
                  : "Customer ratings and reviews on your storefront items will appear here."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
