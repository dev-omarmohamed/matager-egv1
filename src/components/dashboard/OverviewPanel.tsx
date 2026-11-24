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
  tone: Tone;
  icon: string;
  count: number;
  label: string;
  desc: string;
}> = ({ tone, icon, count, label, desc }) => (
  <div className={`min-w-0 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${TONES[tone].box}`}>
    <div className="flex items-center justify-between gap-1">
      <span className="text-lg sm:text-xl font-bold font-heading leading-none text-[var(--color-text-primary)]">{count}</span>
      <i className={`bi ${icon} text-base leading-none ${TONES[tone].text}`} aria-hidden="true" />
    </div>
    <p className="mt-1.5 text-[11px] font-bold font-heading leading-tight text-[var(--color-text-primary)] line-clamp-2 sm:truncate">
      {stripLeadingNumber(label)}
    </p>
    <p className="hidden sm:block text-[10px] font-subtitle text-[var(--color-text-muted)] truncate">{desc}</p>
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
  <div className={`flex items-center justify-between gap-2 py-1 text-xs ${last ? "" : `border-b ${divider}`}`}>
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
        <div className="p-3 sm:p-4">
          <h3 className={`${eyebrow} mb-2.5`}>{t.actionHub.title}</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ActionTile tone="amber" icon="bi-clock-history" count={pendingOrdersCount} label={t.actionHub.pendingOrders} desc={t.actionHub.pendingDesc} />
            <ActionTile tone="blue" icon="bi-cart-x" count={stuckCartsCount} label={t.actionHub.stuckCarts} desc={t.actionHub.stuckDesc} />
            <ActionTile tone="red" icon="bi-arrow-return-left" count={refundRequestsCount} label={t.actionHub.refundRequests} desc={t.actionHub.refundDesc} />
          </div>
        </div>

        <div className={`p-3 sm:p-4 border-t lg:border-t-0 lg:border-s ${divider} flex flex-col justify-center`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={eyebrow}>{t.plan.currentPlan}</span>
              <StatusPill variant="info">{subscription?.status || t.plan.statusActive}</StatusPill>
            </div>
            <span dir="ltr" className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{endsDate}</span>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3">
            <h4 className="text-base sm:text-lg font-bold font-heading text-[var(--color-text-primary)] truncate">{planName}</h4>
            <button type="button" className={btnGhost}>{t.plan.upgradeButton}</button>
          </div>

          <div
            className={`mt-2 h-1.5 w-full rounded-full overflow-hidden bg-[var(--color-surface-elevated)] border ${divider}`}
            role="progressbar"
            aria-valuenow={usagePct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-status-green)] transition-[width] duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-subtitle text-[var(--color-text-secondary)]">
            {usageCount} / {maxCapacity} {tr("products connected", "منتج متصل")} ({usagePct}%)
          </p>
        </div>
      </div>

      {/* Row 2: domain */}
      <div className={`px-3 py-2.5 sm:px-4 border-t ${divider} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <i className="bi bi-globe2 text-base text-[var(--color-primary-light)] shrink-0" aria-hidden="true" />
          <div className="min-w-0 leading-tight">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">{t.actionHub.defaultDomain}</p>
            <p dir="ltr" className="text-xs font-medium text-[var(--color-text-primary)] select-all truncate text-start">{currentDomain}</p>
          </div>
        </div>
        <button type="button" className={btnPrimary}>{t.actionHub.requestDomain}</button>
      </div>

      {/* Row 3: live visitors toggle */}
      <button
        type="button"
        onClick={() => setLiveOpen((v) => !v)}
        aria-expanded={liveOpen}
        className={`w-full px-3 py-2.5 sm:px-4 border-t ${divider} flex items-center justify-between gap-3 text-start ${focusRing}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--color-status-green)] animate-pulse" />
          <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] truncate">{t.liveVisitors.title}</span>
          <span className="hidden sm:inline text-[10px] font-subtitle px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            {t.liveVisitors.badge}
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-bold font-ui text-[var(--color-status-green)]">0 {t.liveVisitors.onlineNow}</span>
          <i className={`bi bi-chevron-down text-[10px] text-[var(--color-text-secondary)] transition-transform duration-300 ${liveOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>

      <Collapse open={liveOpen}>
        <div className={`px-3 pb-3 pt-3 sm:px-4 space-y-3 border-t ${divider}`}>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <Stat tone="green" label={t.liveVisitors.liveNow} value="0" pulse />
            <Stat tone="blue" label={t.liveVisitors.views5m} value="0" />
            <Stat tone="purple" label={t.liveVisitors.avgTime} value="0:00" />
            <Stat tone="amber" label={t.liveVisitors.bounce} value="0%" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8">
            <div className="min-w-0">
              <p className={`${eyebrow} mb-1`}>{t.liveVisitors.trafficSources}</p>
              <BreakdownRow dot={TONES.green.bg} label={t.liveVisitors.organic} value="62%" />
              <BreakdownRow dot={TONES.blue.bg} label={t.liveVisitors.direct} value="24%" />
              <BreakdownRow dot={TONES.purple.bg} label={t.liveVisitors.social} value="14%" last />
            </div>
            <div className="min-w-0">
              <p className={`${eyebrow} mb-1`}>{t.liveVisitors.devices}</p>
              <BreakdownRow icon="bi-phone" iconClass="text-[var(--color-primary-light)]" label={t.liveVisitors.mobile} value="68%" />
              <BreakdownRow icon="bi-laptop" iconClass={TONES.blue.text} label={t.liveVisitors.desktop} value="26%" />
              <BreakdownRow icon="bi-tablet" iconClass={TONES.purple.text} label={t.liveVisitors.tablet} value="6%" last />
            </div>
          </div>
        </div>
      </Collapse>
    </section>
  );
};
