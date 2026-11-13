"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const RevenueLedger: React.FC = () => {
  const { t } = useDashboardLanguage();
  const [selectedYear, setSelectedYear] = useState<"2025" | "2026">("2026");

  const rows2026 = [
    {
      month: "March 2026",
      revenue: "$14,250.00",
      products: 142,
      growth: "+8.4% ↑",
      growthPositive: true,
      status: t.revenueLedger.finalized,
    },
    {
      month: "February 2026",
      revenue: "$12,100.50",
      products: 128,
      growth: "+5.2% ↑",
      growthPositive: true,
      status: t.revenueLedger.finalized,
    },
    {
      month: "January 2026",
      revenue: "$11,400.00",
      products: 110,
      growth: "--",
      growthPositive: null,
      status: t.revenueLedger.finalized,
    },
  ];

  const rows2025 = [
    {
      month: "December 2025",
      revenue: "$10,800.00",
      products: 95,
      growth: "+11.2% ↑",
      growthPositive: true,
      status: t.revenueLedger.finalized,
    },
    {
      month: "November 2025",
      revenue: "$9,750.00",
      products: 88,
      growth: "+4.1% ↑",
      growthPositive: true,
      status: t.revenueLedger.finalized,
    },
  ];

  const currentRows = selectedYear === "2026" ? rows2026 : rows2025;
  const currentTotal = selectedYear === "2026" ? "$37,750.50" : "$20,550.00";

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

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/revenue:max-h-[380px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-4">
          {/* Year Switcher Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedYear("2025")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                selectedYear === "2025"
                  ? "bg-white/10 text-white border border-white/20"
                  : "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.revenueLedger.btn2025}
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear("2026")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                selectedYear === "2026"
                  ? "bg-white/10 text-white border border-white/20"
                  : "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.revenueLedger.btn2026}
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
                {currentRows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 text-[var(--color-text-secondary)] font-ui">{r.month}</td>
                    <td className="py-2.5 text-center font-bold text-[var(--color-status-blue)]">
                      {r.revenue}
                    </td>
                    <td className="py-2.5 text-center text-[var(--color-text-secondary)]">
                      {r.products}
                    </td>
                    <td
                      className={`py-2.5 text-center font-bold ${
                        r.growthPositive
                          ? "text-[var(--color-status-green)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {r.growth}
                    </td>
                    <td className="py-2.5 text-right rtl:text-left">
                      <StatusPill variant="info">{r.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Total */}
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] font-subtitle">
              <span className="text-[var(--color-status-green)] font-bold">{selectedYear}</span>
              -Total Earnings
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
