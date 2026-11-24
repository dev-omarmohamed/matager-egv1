"use client";

import React, { useState } from "react";
import { useDash } from "@/lib/useDash";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { Collapse } from "./ui/Collapse";
import { Stat } from "./ui/Stat";
import { TONES, Tone } from "./ui/tones";
import { surface, divider, eyebrow, btnPrimary, btnGhost, focusRing } from "./ui/styles";

/* Translation strings still carry a hard-coded number ("14 Pending Orders"); show only the words. */
const stripLeadingNumber = (s: string) => s.replace(/^\s*\d+\s*/, "");

const ActionTile: React.FC<{
  icon: string;
  count: number;
  label: string;
  desc: string;
}> = ({ icon, count, label, desc }) => (
  <div className="min-w-0 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-3 sm:p-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--color-border)] hover:shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xl sm:text-2xl font-bold font-heading leading-none text-[var(--color-text-primary)]">{count}</span>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/20 shrink-0">
        <i className={`bi ${icon} text-sm leading-none`} aria-hidden="true" />
      </span>
    </div>
    <p className="mt-2 text-xs font-bold font-heading leading-tight text-[var(--color-text-primary)] line-clamp-2 sm:truncate">
      {stripLeadingNumber(label)}
    </p>
    <p className="hidden sm:block text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5 truncate">{desc}</p>
  </div>
);

const BreakdownRow: React.FC<{
  dot?: string;
  icon?: string;
  iconClass?: string;
  label: string;
  value: string;
  last?: boolean;
}> = ({ dot, icon, iconClass = "", label, value, last }) => (
  <div className={`flex items-center justify-between gap-2 py-1.5 text-xs ${last ? "" : `border-b ${divider}`}`}>
    <span className="flex items-center gap-2 min-w-0 text-[var(--color-text-secondary)]">
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
      {icon && <i className={`bi ${icon} text-xs shrink-0 ${iconClass}`} aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </span>
    <span className="font-bold font-ui text-[var(--color-text-primary)]">{value}</span>
  </div>
);

/** Action hub + current plan + domain + live visitors, in one card. */
export const OverviewPanel: React.FC = () => {
  const { t, tr } = useDash();
  const { orders, storeConfig, subscription, products } = useStoreOwnerData();
  const [liveOpen, setLiveOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const refundRequestsCount = orders.filter((o) => o.status === "Cancelled").length;
  const stuckCartsCount = 0;
  const currentDomain = storeConfig?.subdomain || t.actionHub.domainValue;

  const planName = subscription?.plan_id ? subscription.plan_id.toUpperCase() : t.plan.planName;
  const endsDate = subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : t.plan.endsDate;
  const usageCount = products.length;
  const maxCapacity = 500;
  const usagePct = Math.min(100, Math.round((usageCount / maxCapacity) * 100));

  return (
    <section className={`${surface} overflow-hidden`}>
      {/* Row 1: actions + plan */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="p-4 sm:p-5 lg:p-6">
          <h3 className={`${eyebrow} mb-3`}>{t.actionHub.title}</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            <ActionTile icon="bi-clock-history" count={pendingOrdersCount} label={t.actionHub.pendingOrders} desc={t.actionHub.pendingDesc} />
            <ActionTile icon="bi-cart-x" count={stuckCartsCount} label={t.actionHub.stuckCarts} desc={t.actionHub.stuckDesc} />
            <ActionTile icon="bi-arrow-return-left" count={refundRequestsCount} label={t.actionHub.refundRequests} desc={t.actionHub.refundDesc} />
          </div>
        </div>

        <div className={`p-4 sm:p-5 lg:p-6 border-t lg:border-t-0 lg:border-s ${divider} flex flex-col justify-center`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={eyebrow}>{t.plan.currentPlan}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/20">
                {subscription?.status || t.plan.statusActive}
              </span>
            </div>
            <span dir="ltr" className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{endsDate}</span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <h4 className="text-base sm:text-xl font-bold font-heading text-[var(--color-text-primary)] truncate">{planName}</h4>
            <button type="button" className={btnGhost}>{t.plan.upgradeButton}</button>
          </div>

          <div
            className={`mt-2.5 h-2 w-full rounded-full overflow-hidden bg-[var(--color-surface-elevated)] border ${divider}`}
            role="progressbar"
            aria-valuenow={usagePct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--color-primary-light)] transition-[width] duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-subtitle text-[var(--color-text-secondary)]">
            {usageCount} / {maxCapacity} {tr("products connected", "منتج متصل")} ({usagePct}%)
          </p>
        </div>
      </div>

      {/* Row 2: domain */}
      <div className={`px-4 sm:px-6 py-3.5 border-t ${divider} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] shrink-0">
            <i className="bi bi-globe2 text-base" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">{t.actionHub.defaultDomain}</p>
            <p dir="ltr" className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)] select-all truncate text-start mt-0.5">{currentDomain}</p>
          </div>
        </div>
        <button type="button" className={btnPrimary}>{t.actionHub.requestDomain}</button>
      </div>

      {/* Row 3: live visitors toggle (generous padding & weightless polish) */}
      <button
        type="button"
        onClick={() => setLiveOpen((v) => !v)}
        aria-expanded={liveOpen}
        className={`w-full px-4 sm:px-6 py-3.5 border-t ${divider} flex items-center justify-between gap-3 text-start hover:bg-[var(--color-surface-elevated)]/50 transition-colors ${focusRing}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[var(--color-status-green)] animate-pulse" />
          <span className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)] truncate">{t.liveVisitors.title}</span>
          <span className="inline-flex text-[10px] font-bold font-ui px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]">
            {t.liveVisitors.badge}
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold font-ui text-[var(--color-status-green)] flex items-center gap-1.5">
            <i className="bi bi-broadcast text-xs" />
            <span>0 {t.liveVisitors.onlineNow}</span>
          </span>
          <i className={`bi bi-chevron-down text-xs text-[var(--color-text-secondary)] transition-transform duration-300 ${liveOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>

      <Collapse open={liveOpen}>
        <div className={`px-4 sm:px-6 pb-5 pt-4 space-y-4 border-t ${divider} bg-[var(--color-surface-elevated)]/25`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Stat tone="green" label={t.liveVisitors.liveNow} value="0" pulse />
            <Stat tone="blue" label={t.liveVisitors.views5m} value="0" />
            <Stat tone="purple" label={t.liveVisitors.avgTime} value="0:00" />
            <Stat tone="amber" label={t.liveVisitors.bounce} value="0%" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
            <div className="rounded-xl border border-[var(--color-border-subtle)] p-3.5 sm:p-4 bg-[var(--color-surface)]">
              <p className={`${eyebrow} mb-2`}>{t.liveVisitors.trafficSources}</p>
              <BreakdownRow dot="bg-[var(--color-status-green)]" label={t.liveVisitors.organic} value="62%" />
              <BreakdownRow dot="bg-[var(--color-primary-light)]" label={t.liveVisitors.direct} value="24%" />
              <BreakdownRow dot="bg-[var(--color-status-purple)]" label={t.liveVisitors.social} value="14%" last />
            </div>
            <div className="rounded-xl border border-[var(--color-border-subtle)] p-3.5 sm:p-4 bg-[var(--color-surface)]">
              <p className={`${eyebrow} mb-2`}>{t.liveVisitors.devices}</p>
              <BreakdownRow icon="bi-phone" iconClass="text-[var(--color-primary-light)]" label={t.liveVisitors.mobile} value="68%" />
              <BreakdownRow icon="bi-laptop" iconClass="text-[var(--color-primary-light)]" label={t.liveVisitors.desktop} value="26%" />
              <BreakdownRow icon="bi-tablet" iconClass="text-[var(--color-status-purple)]" label={t.liveVisitors.tablet} value="6%" last />
            </div>
          </div>
        </div>
      </Collapse>
    </section>
  );
};
