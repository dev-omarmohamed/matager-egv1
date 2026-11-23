"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

export const CustomerBase: React.FC = () => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";
  const { totalCustomers } = useStoreOwnerData();

  const formattedCustomers = `${totalCustomers}`;
  const growthText = totalCustomers > 0 ? "+0.0% MoM" : "0% MoM";

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-customer-base"
        className="peer/cust hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.customerBase.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.customerBase.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-customer-base"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/cust:[&_.cust-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.customerBase.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] cust-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/cust:max-h-[250px] bg-[var(--color-surface-elevated)]/20">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Col 1 */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-1.5">
                {t.customerBase.totalLabel}
              </p>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text-primary)] leading-none">
                  {formattedCustomers}
                </span>
                <StatusPill variant="info">{t.customerBase.allTime}</StatusPill>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] font-subtitle">
                {growthText}
              </p>
            </div>
            <button
              type="button"
              className="self-start mt-3 text-xs font-bold text-[var(--color-primary-light)] hover:underline underline-offset-2 transition-all font-ui"
            >
              {t.customerBase.viewAnalytics}
            </button>
          </div>

          {/* Col 2 */}
          <div className="md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-5 rtl:md:pl-0 rtl:md:pr-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                {t.customerBase.monthlyTitle}
              </p>
              <span className="text-[11px] text-[var(--color-primary-light)] font-bold font-ui">
                {t.customerBase.currentMonth}
              </span>
            </div>

            <div className="flex justify-between items-end mb-2">
              <span className="text-base font-bold font-heading text-[var(--color-text-primary)]">
                0 {isAr ? "عملاء جدد" : "New customers"}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-bold font-ui">
                0%
              </span>
            </div>

            <div className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] h-full rounded-full transition-all duration-500"
                style={{ width: totalCustomers > 0 ? "10%" : "0%" }}
              />
            </div>

            <p className="text-xs text-[var(--color-text-muted)] font-bold font-ui">
              {totalCustomers === 0 ? (isAr ? "لا توجد بيانات عملاء بعد" : "No customer data yet") : "+0% vs last month"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
