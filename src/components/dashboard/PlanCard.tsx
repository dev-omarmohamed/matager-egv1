"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

export const PlanCard: React.FC = () => {
  const { t } = useDashboardLanguage();
  const { subscription, products } = useStoreOwnerData();

  const planName = subscription?.plan_id ? subscription.plan_id.toUpperCase() : t.plan.planName;
  const endsDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString()
    : t.plan.endsDate;

  const usageCount = products.length;
  const maxCapacity = 500;
  const usagePct = Math.min(100, Math.round((usageCount / maxCapacity) * 100));

  return (
    <div className="glass-panel p-5 rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
            {t.plan.currentPlan}
          </span>
          <StatusPill variant="info">{subscription?.status || t.plan.statusActive}</StatusPill>
        </div>

        {/* Plan Name & Expiry */}
        <div className="flex justify-between items-end mb-2">
          <h4 className="text-lg font-bold font-heading text-[var(--color-text-primary)]">
            {planName}
          </h4>
          <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mb-0.5 font-mono">
            {endsDate}
          </span>
        </div>

        {/* Usage Progress Bar */}
        <div className="w-full h-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-status-green)] rounded-full transition-all duration-500"
            style={{ width: `${usagePct}%` }}
          />
        </div>

        {/* Usage Text */}
        <p className="text-[11px] font-subtitle text-[var(--color-text-secondary)] mt-2">
          {usageCount} / {maxCapacity} products connected ({usagePct}%)
        </p>
      </div>

      {/* Upgrade Plan Ghost Button */}
      <button
        type="button"
        className="w-full mt-5 py-2 px-3 rounded-lg bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] text-[10px] font-bold font-ui text-[var(--color-text-primary)] transition-all text-center"
      >
        {t.plan.upgradeButton}
      </button>
    </div>
  );
};
