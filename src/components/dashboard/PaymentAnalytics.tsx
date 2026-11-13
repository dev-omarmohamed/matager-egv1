"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const PaymentAnalytics: React.FC = () => {
  const { t } = useDashboardLanguage();
  const [activePage, setActivePage] = useState<number>(1);

  const transactions = [
    {
      id: "TXN-99283471",
      method: "Visa •••• 4242",
      date: "29 Apr, 14:20",
      amount: "+1,200.00",
      isPositive: true,
      status: t.paymentAnalytics.captured,
      variant: "success" as const,
    },
    {
      id: "TXN-88210394",
      method: "Digital Wallet",
      date: "28 Apr, 09:15",
      amount: "-450.00",
      isPositive: false,
      status: t.paymentAnalytics.refunded,
      variant: "danger" as const,
    },
    {
      id: "TXN-77382910",
      method: "Mada •••• 1088",
      date: "27 Apr, 18:40",
      amount: "+890.00",
      isPositive: true,
      status: t.paymentAnalytics.captured,
      variant: "success" as const,
    },
  ];

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

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/payment:max-h-[380px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-4">
          {/* 3 Stat Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-white/5 rounded-xl border border-[var(--color-border-subtle)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] font-subtitle mb-0.5">
                {t.paymentAnalytics.volumeLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                {t.paymentAnalytics.volumeValue}{" "}
                <span className="text-[10px] text-[var(--color-text-muted)] font-normal font-ui">
                  {t.paymentAnalytics.volumeUnit}
                </span>
              </p>
            </div>

            <div className="p-3 bg-[var(--color-status-green-bg)] rounded-xl border border-[var(--color-status-green-border)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-status-green)] font-subtitle mb-0.5">
                {t.paymentAnalytics.successfulLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-status-green)]">
                {t.paymentAnalytics.successfulValue}
              </p>
            </div>

            <div className="p-3 bg-[var(--color-status-red-bg)] rounded-xl border border-[var(--color-status-red-border)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-status-red)] font-subtitle mb-0.5">
                {t.paymentAnalytics.refundsLabel}
              </p>
              <p className="text-sm font-bold font-heading text-[var(--color-status-red)]">
                {t.paymentAnalytics.refundsValue}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
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
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 text-[var(--color-text-muted)]">{txn.id}</td>
                    <td className="py-2.5 text-[var(--color-text-primary)] font-ui">{txn.method}</td>
                    <td className="py-2.5 text-[var(--color-text-muted)]">{txn.date}</td>
                    <td
                      className={`py-2.5 text-right rtl:text-left font-bold ${
                        txn.isPositive
                          ? "text-[var(--color-status-green)]"
                          : "text-[var(--color-status-red)]"
                      }`}
                    >
                      {txn.amount}
                    </td>
                    <td className="py-2.5 text-right rtl:text-left">
                      <StatusPill variant={txn.variant}>{txn.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border-subtle)]">
            <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
              {t.paymentAnalytics.paginationText}
            </p>
            <div className="flex gap-1.5 items-center">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setActivePage(1)}
                className="w-6 h-6 rounded bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="bi bi-chevron-left text-[9px] rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setActivePage(1)}
                className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                  activePage === 1
                    ? "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm"
                    : "bg-white/5 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setActivePage(2)}
                className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                  activePage === 2
                    ? "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm"
                    : "bg-white/5 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                }`}
              >
                2
              </button>
              <button
                type="button"
                disabled={activePage === 2}
                onClick={() => setActivePage(2)}
                className="w-6 h-6 rounded bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="bi bi-chevron-right text-[9px] rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
