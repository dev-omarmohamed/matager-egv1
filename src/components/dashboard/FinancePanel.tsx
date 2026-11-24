"use client";

import React, { useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDash } from "@/lib/useDash";
import { Panel, PanelTabs, TabPane } from "./ui/Panel";
import { Stat } from "./ui/Stat";
import { EmptyState } from "./ui/EmptyState";
import { TONES, Tone } from "./ui/tones";
import { btnGhost, divider, eyebrow } from "./ui/styles";

type FinTab = "revenue" | "payments" | "payouts";
const PAGE = 6;

/** Revenue ledger + payment analytics + financial ledger, merged into one tabbed card. */
export const FinancePanel: React.FC = () => {
  const { t, tr, isRtl } = useDash();
  const { orders, totalRevenue, totalOrders } = useStoreOwnerData();

  const thisYear = new Date().getFullYear();
  const [tab, setTab] = useState<FinTab>("revenue");
  const [year, setYear] = useState(String(thisYear));
  const [txnVisible, setTxnVisible] = useState(PAGE);

  /* ── Revenue by month (selected year) ── */
  const monthly = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; products: number }> = {};
    orders.forEach((ord) => {
      const d = ord.created_at ? new Date(ord.created_at) : new Date();
      if (String(d.getFullYear()) !== year) return;
      const key = `${d.toLocaleString(isRtl ? "ar-EG" : "en-US", { month: "long" })} ${year}`;
      map[key] ??= { month: key, revenue: 0, products: 0 };
      map[key].revenue += ord.amount || 0;
      map[key].products += ord.items ? ord.items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
    });
    return Object.values(map);
  }, [orders, year, isRtl]);

  const yearTotal = monthly.reduce((a, r) => a + r.revenue, 0);

  /* ── Payments ── */
  const transactions = orders.map((o) => ({
    id: `TXN-${o.id.replace(/[^0-9A-Z]/gi, "")}`,
    method: tr("Direct Checkout / Cash", "دفع مباشر / نقدي"),
    date: o.created_at ? new Date(o.created_at).toLocaleString() : tr("Just now", "الآن"),
    amount: `+${o.total}`,
    status: o.status,
    variant: o.variant,
  }));
  const successRate = totalOrders > 0 ? "100%" : "0%";

  /* ── Payouts ── */
  const egp = (n: number) => `EGP ${n.toFixed(2)}`;
  const blocks: {
    tone: Tone;
    title: string;
    amount: string;
    sub: string;
    rows: [string, string][];
    cta: string;
  }[] = [
    {
      tone: "green",
      title: t.financialLedger.fundsTitle,
      amount: egp(totalRevenue),
      sub: totalOrders > 0 ? tr("100% available for withdrawal", "١٠٠٪ متاح للسحب") : tr("0.00 EGP available", "٠٫٠٠ ج.م متاح"),
      rows: [
        [t.financialLedger.codLabel, egp(totalRevenue * 0.7)],
        [t.financialLedger.directTransfersLabel, egp(totalRevenue * 0.3)],
      ],
      cta: t.financialLedger.requestTransfer,
    },
    {
      tone: "amber",
      title: t.financialLedger.pendingTitle,
      amount: "EGP 0.00",
      sub: t.financialLedger.pendingSubtext,
      rows: [
        [t.financialLedger.cardPaymentsLabel, "EGP 0.00"],
        [t.financialLedger.walletsLabel, "EGP 0.00"],
      ],
      cta: t.financialLedger.viewHeldOrders,
    },
    {
      tone: "red",
      title: t.financialLedger.expensesTitle,
      amount: "EGP 0.00",
      sub: t.financialLedger.expensesSubtext,
      rows: [
        [t.financialLedger.storeSubLabel, "EGP 0.00"],
        [t.financialLedger.processingFeesLabel, "EGP 0.00"],
        [t.financialLedger.addonsLabel, "EGP 0.00"],
      ],
      cta: t.financialLedger.viewPlan,
    },
  ];

  return (
    <Panel
      title={t.financialLedger.title}
      subtitle={t.financialLedger.subtitle}
      icon="bi-cash-stack"
      collapsible={false}
    >
      {/* Always-visible money summary */}
      <div className={`grid grid-cols-3 gap-2 p-3 sm:p-4 border-b ${divider}`}>
        {blocks.map((b) => (
          <Stat key={b.tone} tone={b.tone} label={b.title} value={<span dir="ltr">{b.amount.replace("EGP ", "")}</span>} hint="EGP" />
        ))}
      </div>

      <PanelTabs<FinTab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "revenue", label: t.revenueLedger.title, icon: "bi-graph-up-arrow" },
          { id: "payments", label: t.paymentAnalytics.title, icon: "bi-credit-card", badge: transactions.length || undefined },
          { id: "payouts", label: tr("Payouts & fees", "التحويلات والرسوم"), icon: "bi-bank" },
        ]}
      />

      <TabPane id={tab} className="p-3 sm:p-4 space-y-3">
        {/* ───────── Revenue ───────── */}
        {tab === "revenue" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                <span className="text-[var(--color-status-green)] font-bold">{year}</span> · {tr("Total Earnings", "إجمالي الأرباح")}
                <b className="block text-lg font-heading text-[var(--color-status-green)] leading-tight">EGP {yearTotal.toLocaleString()}</b>
              </p>
              <div className="flex gap-1.5 shrink-0">
                {[String(thisYear - 1), String(thisYear)].map((y) => (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={year === y}
                    onClick={() => setYear(y)}
                    className={`${btnGhost} ${year === y ? "!border-[var(--color-primary-light)] !text-[var(--color-primary-light)]" : "!text-[var(--color-text-muted)]"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border ${divider} overflow-hidden`}>
              <div className={`hidden sm:grid grid-cols-[1fr_120px_90px_90px_90px] gap-3 px-4 py-2 bg-[var(--color-surface-elevated)] ${eyebrow}`}>
                <span>{t.revenueLedger.thMonth}</span>
                <span>{t.revenueLedger.thRevenue}</span>
                <span>{t.revenueLedger.thProducts}</span>
                <span>{t.revenueLedger.thGrowth}</span>
                <span className="text-end">{t.revenueLedger.thStatus}</span>
              </div>
              {monthly.length === 0 ? (
                <EmptyState icon="bi-graph-up" title={tr("No revenue recorded yet", "لا توجد إيرادات مسجلة بعد")} />
              ) : (
                <ul className={`divide-y ${divider}`}>
                  {monthly.map((r) => (
                    <li
                      key={r.month}
                      className="px-3 sm:px-4 py-2.5 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_90px_90px_90px] items-center gap-x-3 gap-y-0.5"
                    >
                      <span className="text-xs text-[var(--color-text-secondary)] font-ui">{r.month}</span>
                      <span className="text-xs font-bold text-[var(--color-status-blue)] text-end sm:text-start">EGP {r.revenue.toLocaleString()}</span>
                      <span className="text-[11px] text-[var(--color-text-muted)] sm:text-xs sm:text-[var(--color-text-secondary)]">
                        {r.products} {tr("items", "قطعة")}
                      </span>
                      <span className="hidden sm:block text-xs font-bold text-[var(--color-text-muted)]">--</span>
                      <span className="justify-self-end">
                        <StatusPill variant="info">{t.revenueLedger.finalized}</StatusPill>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ───────── Payments ───────── */}
        {tab === "payments" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat label={t.paymentAnalytics.volumeLabel} value={totalRevenue.toLocaleString()} hint="EGP" />
              <Stat tone="green" label={t.paymentAnalytics.successfulLabel} value={successRate} />
              <Stat label={t.paymentAnalytics.refundsLabel} value="0" hint="(0.0%)" />
            </div>

            <div className={`rounded-xl border ${divider} overflow-hidden`}>
              {transactions.length === 0 ? (
                <EmptyState icon="bi-credit-card" title={tr("No payment transactions yet", "لا توجد معاملات دفع بعد")} />
              ) : (
                <ul className={`divide-y ${divider}`}>
                  {transactions.slice(0, txnVisible).map((x, i) => (
                    <li key={`${x.id}-${i}`} className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p dir="ltr" className="text-xs font-mono font-bold text-[var(--color-text-primary)] truncate text-start">{x.id}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {x.method} · {x.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-bold text-[var(--color-status-green)]">{x.amount}</span>
                        <StatusPill variant={x.variant}>{x.status}</StatusPill>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {transactions.length > txnVisible && (
              <button type="button" className={`${btnGhost} w-full`} onClick={() => setTxnVisible((v) => v + PAGE)}>
                {tr("Show more", "عرض المزيد")}
              </button>
            )}
          </>
        )}

        {/* ───────── Payouts & fees ───────── */}
        {tab === "payouts" && (
          <div className="grid gap-3 md:grid-cols-3">
            {blocks.map((b) => (
              <div key={b.tone} className={`rounded-xl border p-3 flex flex-col gap-2 ${TONES[b.tone].box}`}>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider font-subtitle ${TONES[b.tone].text}`}>{b.title}</p>
                  <p dir="ltr" className={`text-xl font-black font-heading text-start ${TONES[b.tone].text}`}>{b.amount}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{b.sub}</p>
                </div>
                <ul className="space-y-1 text-xs flex-1">
                  {b.rows.map(([label, value]) => (
                    <li key={label} className="flex justify-between gap-2">
                      <span className="text-[var(--color-text-muted)] font-subtitle">{label}</span>
                      <span dir="ltr" className="font-bold text-[var(--color-text-primary)]">{value}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className={`${btnGhost} w-full ${TONES[b.tone].text}`}>
                  {b.cta}
                </button>
              </div>
            ))}
          </div>
        )}
      </TabPane>
    </Panel>
  );
};
