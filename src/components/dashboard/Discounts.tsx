"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const Discounts: React.FC = () => {
  const { t } = useDashboardLanguage();
  const [activeTab, setActiveTab] = useState<"promo" | "sitewide" | "gift">("promo");
  const [search, setSearch] = useState("");

  const discountCodes = [
    {
      id: "d1",
      code: "SUMMER25",
      discount: "25% Off",
      usage: "347/500",
      expires: "Sep 30, 2026",
      status: t.discounts.activeStatus,
      variant: "success" as const,
    },
    {
      id: "d2",
      code: "SUMMER25",
      discount: "25% Off",
      usage: "347/500",
      expires: "May 1, 2025",
      status: t.discounts.expiredStatus,
      variant: "danger" as const,
    },
  ];

  const filtered = discountCodes.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-store-discounts"
        className="peer/disc hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.discounts.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.discounts.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-store-discounts"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/disc:[&_.disc-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.discounts.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] disc-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/disc:max-h-[350px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-4">
          {/* Search + Create New */}
          <div className="flex justify-between items-center gap-3">
            <div className="relative flex-1 max-w-[220px]">
              <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.discounts.searchPlaceholder}
                className="w-full bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
              />
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] hover:opacity-95 text-white rounded-lg text-xs font-bold font-ui transition-all shadow-sm"
            >
              {t.discounts.createNew}
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-4 border-b border-[var(--color-border-subtle)] pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("promo")}
              className={`font-bold uppercase tracking-wider pb-1 transition-all ${
                activeTab === "promo"
                  ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.discounts.tabPromo}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sitewide")}
              className={`font-bold uppercase tracking-wider pb-1 transition-all ${
                activeTab === "sitewide"
                  ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.discounts.tabSitewide}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gift")}
              className={`font-bold uppercase tracking-wider pb-1 transition-all ${
                activeTab === "gift"
                  ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.discounts.tabGiftCards}
            </button>
          </div>

          {/* Rows List */}
          <div className="max-h-[140px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs border-b border-[var(--color-border-subtle)]/40 pb-2 last:border-b-0 hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors"
              >
                <span className="font-bold text-[var(--color-text-primary)] w-24">
                  {item.code}
                </span>
                <span className="text-[var(--color-text-secondary)] font-ui w-20">
                  {item.discount}
                </span>
                <span className="text-[var(--color-text-muted)] w-20">
                  {item.usage}
                </span>
                <span className="text-[var(--color-text-muted)] font-subtitle w-24">
                  {item.expires}
                </span>
                <span className="w-16 text-right rtl:text-left">
                  <StatusPill variant={item.variant}>{item.status}</StatusPill>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
