"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";

export const FinancialLedger: React.FC = () => {
  const { t } = useDashboardLanguage();

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-financial-ledger"
        className="peer/fin hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.financialLedger.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.financialLedger.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-financial-ledger"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/fin:[&_.fin-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.financialLedger.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] fin-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/fin:max-h-[350px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Col 1: Funds Overview */}
          <div className="flex flex-col justify-between space-y-3 md:border-r rtl:md:border-r-0 rtl:md:border-l border-[var(--color-border-subtle)] md:pr-6 rtl:md:pr-0 rtl:md:pl-6">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-1">
                {t.financialLedger.fundsTitle}
              </p>
              <p className="text-2xl font-black font-heading text-[var(--color-status-green)]">
                {t.financialLedger.fundsAmount}
              </p>
              <p className="text-[10px] text-[var(--color-status-green)] font-bold mb-3 font-ui">
                {t.financialLedger.fundsSubtext}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.codLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.codValue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.directTransfersLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.directTransfersValue}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-3 py-2 border border-[var(--color-status-green-border)] text-[var(--color-status-green)] bg-[var(--color-status-green-bg)] hover:bg-[var(--color-status-green)]/20 rounded-lg text-xs font-bold font-ui transition-all"
            >
              {t.financialLedger.requestTransfer}
            </button>
          </div>

          {/* Col 2: Pending Release */}
          <div className="flex flex-col justify-between space-y-3 md:border-r rtl:md:border-r-0 rtl:md:border-l border-[var(--color-border-subtle)] md:pr-6 rtl:md:pr-0 rtl:md:pl-6">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-1">
                {t.financialLedger.pendingTitle}
              </p>
              <p className="text-2xl font-black font-heading text-[var(--color-status-amber)]">
                {t.financialLedger.pendingAmount}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-3 font-subtitle">
                {t.financialLedger.pendingSubtext}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.cardPaymentsLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.cardPaymentsValue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.walletsLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.walletsValue}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-3 py-2 border border-[var(--color-status-amber-border)] text-[var(--color-status-amber)] bg-[var(--color-status-amber-bg)] hover:bg-[var(--color-status-amber)]/20 rounded-lg text-xs font-bold font-ui transition-all"
            >
              {t.financialLedger.viewHeldOrders}
            </button>
          </div>

          {/* Col 3: Platform Expenses */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-1">
                {t.financialLedger.expensesTitle}
              </p>
              <p className="text-2xl font-black font-heading text-[var(--color-status-red)]">
                {t.financialLedger.expensesAmount}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-3 font-subtitle">
                {t.financialLedger.expensesSubtext}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.storeSubLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.storeSubValue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.processingFeesLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.processingFeesValue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-subtitle">
                    {t.financialLedger.addonsLabel}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-bold">
                    {t.financialLedger.addonsValue}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-3 py-2 border border-[var(--color-status-red-border)] text-[var(--color-status-red)] bg-[var(--color-status-red-bg)] hover:bg-[var(--color-status-red)]/20 rounded-lg text-xs font-bold font-ui transition-all"
            >
              {t.financialLedger.viewPlan}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
