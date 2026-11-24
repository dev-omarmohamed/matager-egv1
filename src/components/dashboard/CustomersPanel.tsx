"use client";

import React, { useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDash } from "@/lib/useDash";
import { Panel, PanelTabs, TabPane } from "./ui/Panel";
import { EmptyState } from "./ui/EmptyState";
import { eyebrow, divider, btnGhost } from "./ui/styles";

type Tab = "overview" | "reviews";

/** Customer base + product reviews in one card. */
export const CustomersPanel: React.FC = () => {
  const { t, tr } = useDash();
  const { totalCustomers } = useStoreOwnerData();
  const [tab, setTab] = useState<Tab>("overview");

  const reviews: unknown[] = []; // wire to real reviews when the data source exists
  const growth = totalCustomers > 0 ? "+0.0% MoM" : "0% MoM";

  return (
    <Panel title={t.customerBase.title} subtitle={t.customerBase.subtitle} icon="bi-people" collapsible={false}>
      <PanelTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: tr("Customers", "العملاء"), icon: "bi-person-lines-fill" },
          { id: "reviews", label: t.productReviews.title, icon: "bi-chat-square-text", badge: reviews.length },
        ]}
      />

      <TabPane id={tab} className="p-3 sm:p-4">
        {tab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className={eyebrow}>{t.customerBase.totalLabel}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading leading-none text-[var(--color-text-primary)]">{totalCustomers}</span>
                <StatusPill variant="info">{t.customerBase.allTime}</StatusPill>
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{growth}</p>
              <button type="button" className={`${btnGhost} mt-3`}>{t.customerBase.viewAnalytics}</button>
            </div>

            <div className={`pt-4 md:pt-0 border-t md:border-t-0 md:border-s ${divider} md:ps-4`}>
              <div className="flex items-center justify-between">
                <p className={eyebrow}>{t.customerBase.monthlyTitle}</p>
                <span className="text-[11px] font-bold text-[var(--color-primary-light)]">{t.customerBase.currentMonth}</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-base font-bold font-heading text-[var(--color-text-primary)]">
                  0 {tr("New customers", "عملاء جدد")}
                </span>
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">0%</span>
              </div>
              <div className={`mt-2 h-2 rounded-full overflow-hidden bg-[var(--color-surface-elevated)] border ${divider}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] transition-[width] duration-500"
                  style={{ width: totalCustomers > 0 ? "10%" : "0%" }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-[var(--color-text-muted)]">
                {totalCustomers === 0 ? tr("No customer data yet", "لا توجد بيانات عملاء بعد") : "+0% vs last month"}
              </p>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border ${divider}`}>
            <EmptyState
              icon="bi-chat-square-text"
              title={tr("No product reviews yet", "لا توجد تقييمات بعد")}
              desc={tr(
                "Customer ratings and reviews on your storefront items will appear here.",
                "آراء وتقييمات العملاء لمنتجاتك ستظهر هنا فور إرسالها."
              )}
            />
          </div>
        )}
      </TabPane>
    </Panel>
  );
};
