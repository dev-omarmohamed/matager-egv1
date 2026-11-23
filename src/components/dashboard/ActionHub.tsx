"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

export const ActionHub: React.FC = () => {
  const { t } = useDashboardLanguage();
  const { orders, storeConfig } = useStoreOwnerData();

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const refundRequestsCount = orders.filter((o) => o.status === "Cancelled").length;
  const stuckCartsCount = 0; // Normalized strictly to 0 when empty

  const currentDomain = storeConfig?.subdomain || t.actionHub.domainValue;

  return (
    <div className="glass-panel p-5 rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-4">
          {t.actionHub.title}
        </h3>

        {/* Horizontal Snap-Scroll Actions Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {/* Pending Orders Card */}
          <div className="flex-shrink-0 snap-start bg-[var(--color-status-amber-bg)] border border-[var(--color-status-amber-border)] p-3 rounded-xl flex items-center gap-3 min-w-[210px] hover:-translate-y-[1px] transition-transform">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <i className="bi bi-clock-history text-[var(--color-status-amber)] text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                {pendingOrdersCount} {t.actionHub.pendingOrders}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.actionHub.pendingDesc}
              </p>
            </div>
          </div>

          {/* Stuck Carts Card */}
          <div className="flex-shrink-0 snap-start bg-[var(--color-status-blue-bg)] border border-[var(--color-status-blue-border)] p-3 rounded-xl flex items-center gap-3 min-w-[210px] hover:-translate-y-[1px] transition-transform">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <i className="bi bi-cart-x text-[var(--color-status-blue)] text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                {stuckCartsCount} {t.actionHub.stuckCarts}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.actionHub.stuckDesc}
              </p>
            </div>
          </div>

          {/* Refund Requests Card */}
          <div className="flex-shrink-0 snap-start bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] p-3 rounded-xl flex items-center gap-3 min-w-[210px] hover:-translate-y-[1px] transition-transform">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <i className="bi bi-arrow-return-left text-[var(--color-status-red)] text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                {refundRequestsCount} {t.actionHub.refundRequests}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.actionHub.refundDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stable Domain Row */}
      <div className="mt-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary-light)]">
            <i className="bi bi-globe2 text-base" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-0.5">
              {t.actionHub.defaultDomain}
            </p>
            <p className="text-xs text-[var(--color-text-primary)] select-all font-mono">
              {currentDomain}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-[10px] font-bold font-ui shadow-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          {t.actionHub.requestDomain}
        </button>
      </div>
    </div>
  );
};
