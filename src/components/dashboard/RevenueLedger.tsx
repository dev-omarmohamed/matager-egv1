"use client";

import React, { useState, useMemo } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

export const RevenueLedger: React.FC = () => {
  const { t, locale, dir } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { orders } = useStoreOwnerData();

  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // Group real orders by Month Year
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; products: number }> = {};

    orders.forEach((ord) => {
      const date = ord.created_at ? new Date(ord.created_at) : new Date();
      const yr = date.getFullYear().toString();
      if (yr !== selectedYear) return;

      const monthName = date.toLocaleString("en-US", { month: "long" });
      const key = `${monthName} ${yr}`;

      if (!map[key]) {
        map[key] = { month: key, revenue: 0, products: 0 };
      }
      map[key].revenue += ord.amount || 0;
      map[key].products += ord.items ? ord.items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
    });

    return Object.values(map);
  }, [orders, selectedYear]);

  const currentTotal = useMemo(() => {
    const sum = monthlyData.reduce((acc, r) => acc + r.revenue, 0);
    return `EGP ${sum.toLocaleString()}`;
  }, [monthlyData]);

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-revenue-ledger"
        className="peer/revenue hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.revenueLedger.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.revenueLedger.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-revenue-ledger"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/revenue:[&_.rev-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.revenueLedger.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] rev-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/revenue:max-h-[380px] bg-[var(--color-surface-elevated)]/20">
        <div className="p-4 sm:p-5 space-y-4">
          {/* Year Switcher Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedYear("2025")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                selectedYear === "2025"
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  : "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              2025
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear("2026")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                selectedYear === "2026"
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  : "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              2026
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-[10px]">
              <thead>
                <tr className="text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 font-medium">{t.revenueLedger.thMonth}</th>
                  <th className="pb-2 font-medium text-center">{t.revenueLedger.thRevenue}</th>
                  <th className="pb-2 font-medium text-center">{t.revenueLedger.thProducts}</th>
                  <th className="pb-2 font-medium text-center">{t.revenueLedger.thGrowth}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.revenueLedger.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {monthlyData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
                      {isRtl ? "لا توجد إيرادات مسجلة بعد" : "No revenue recorded yet"}
                    </td>
                  </tr>
                ) : (
                  monthlyData.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--color-surface-elevated)]/40 transition-colors">
                      <td className="py-2.5 text-[var(--color-text-secondary)] font-ui">{r.month}</td>
                      <td className="py-2.5 text-center font-bold text-[var(--color-status-blue)]">
                        EGP {r.revenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center text-[var(--color-text-secondary)]">
                        {r.products}
                      </td>
                      <td className="py-2.5 text-center font-bold text-[var(--color-text-muted)]">
                        --
                      </td>
                      <td className="py-2.5 text-right rtl:text-left">
                        <StatusPill variant="info">{t.revenueLedger.finalized}</StatusPill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Total */}
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] font-subtitle">
              <span className="text-[var(--color-status-green)] font-bold">{selectedYear} </span>
              {isRtl ? "إجمالي الأرباح" : "Total Earnings"}
            </span>
            <span className="text-base font-bold font-heading text-[var(--color-status-green)]">
              {currentTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
