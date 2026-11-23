"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

export const PaymentAnalytics: React.FC = () => {
  const { t, locale, dir } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { orders, totalRevenue, totalOrders } = useStoreOwnerData();
  const [activePage, setActivePage] = useState<number>(1);

  // Map real transactions from orders
  const transactions = orders.map((ord) => ({
    id: `TXN-${ord.id.replace(/[^0-9A-Z]/gi, "")}`,
    method: "Direct Checkout / Cash",
    date: ord.created_at ? new Date(ord.created_at).toLocaleString() : "Just now",
    amount: `+${ord.total}`,
    isPositive: ord.status !== "Cancelled",
    status: ord.status,
    variant: ord.variant,
  }));

  const successRate = totalOrders > 0 ? "100%" : "0%";

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-payment-analytics"
        className="peer/payment hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.paymentAnalytics.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.paymentAnalytics.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-payment-analytics"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/payment:[&_.pay-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.paymentAnalytics.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] pay-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/payment:max-h-[380px] bg-[var(--color-surface-elevated)]/20">
        <div className="p-4 sm:p-5 space-y-4">
          {/* 3 Stat Tiles (Normalized to 0) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border-subtle)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] font-subtitle mb-0.5">
                {t.paymentAnalytics.volumeLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                {totalRevenue.toLocaleString()}{" "}
                <span className="text-[10px] text-[var(--color-text-muted)] font-normal font-ui">
                  EGP
                </span>
              </p>
            </div>

            <div className="p-3 bg-[var(--color-status-green-bg)] rounded-xl border border-[var(--color-status-green-border)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-status-green)] font-subtitle mb-0.5">
                {t.paymentAnalytics.successfulLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-status-green)]">
                {successRate}
              </p>
            </div>

            <div className="p-3 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border-subtle)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] font-subtitle mb-0.5">
                {t.paymentAnalytics.refundsLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                0 <span className="text-[10px] text-[var(--color-text-muted)] font-normal font-ui">(0.0%)</span>
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-[10px]">
              <thead>
                <tr className="text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 font-medium">{t.paymentAnalytics.thTxnId}</th>
                  <th className="pb-2 font-medium">{t.paymentAnalytics.thMethod}</th>
                  <th className="pb-2 font-medium">{t.paymentAnalytics.thDate}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.paymentAnalytics.thAmount}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.paymentAnalytics.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
                      {isRtl ? "لا توجد معاملات دفع بعد" : "No payment transactions yet"}
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, i) => (
                    <tr key={i} className="hover:bg-[var(--color-surface-elevated)]/40 transition-colors">
                      <td className="py-2.5 font-mono text-[var(--color-text-primary)] font-bold">{txn.id}</td>
                      <td className="py-2.5 text-[var(--color-text-secondary)] font-ui">{txn.method}</td>
                      <td className="py-2.5 text-[var(--color-text-muted)]">{txn.date}</td>
                      <td className="py-2.5 text-right rtl:text-left font-bold text-[var(--color-status-green)]">
                        {txn.amount}
                      </td>
                      <td className="py-2.5 text-right rtl:text-left">
                        <StatusPill variant={txn.variant}>{txn.status}</StatusPill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
