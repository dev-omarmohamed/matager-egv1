"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLanguageProvider } from "@/lib/i18n";
import { useDash } from "@/lib/useDash";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { DashboardModalProvider } from "@/components/dashboard/DashboardModalContext";
import { TopNav } from "@/components/dashboard/TopNav";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { InventoryPanel } from "@/components/dashboard/InventoryPanel";
import { WholesalerPanel } from "@/components/dashboard/WholesalerPanel";
import { Discounts } from "@/components/dashboard/Discounts";
import { FinancePanel } from "@/components/dashboard/FinancePanel";
import { CustomersPanel } from "@/components/dashboard/CustomersPanel";
import { StorefrontConfig } from "@/components/dashboard/StorefrontConfig";
import { PosNodeManager } from "@/components/dashboard/PosNodeManager";
import { AdTracking } from "@/components/dashboard/AdTracking";
import { TeamRoster } from "@/components/dashboard/TeamRoster";
import { focusRing, scrollNone } from "@/components/dashboard/ui/styles";

type SectionId = "overview" | "orders" | "catalog" | "finance" | "customers" | "store";
const SECTION_IDS: SectionId[] = ["overview", "orders", "catalog", "finance", "customers", "store"];

const readHash = (): SectionId => {
  const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "") as SectionId;
  return SECTION_IDS.includes(h) ? h : "overview";
};

function SectionBar({
  active,
  onChange,
  pendingOrders,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
  pendingOrders: number;
}) {
  const { tr } = useDash();

  const items: { id: SectionId; label: string; icon: string; badge?: number }[] = [
    { id: "overview", label: tr("Overview", "نظرة عامة"), icon: "bi-speedometer2" },
    { id: "orders", label: tr("Orders", "الطلبات"), icon: "bi-bag-check", badge: pendingOrders },
    { id: "catalog", label: tr("Catalog", "الكتالوج"), icon: "bi-box-seam" },
    { id: "finance", label: tr("Finance", "المالية"), icon: "bi-cash-stack" },
    { id: "customers", label: tr("Customers", "العملاء"), icon: "bi-people" },
    { id: "store", label: tr("Store", "المتجر"), icon: "bi-shop" },
  ];

  return (
    <nav
      aria-label={tr("Dashboard sections", "أقسام لوحة التحكم")}
      className="sticky top-14 sm:top-16 z-40 bg-[var(--color-canvas)]/95 backdrop-blur-xl border-b border-[var(--color-border-subtle)] py-2"
    >
      <div className={`max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 overflow-x-auto ${scrollNone}`}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-current={on ? "page" : undefined}
              className={`relative shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold font-ui transition-all duration-200 rounded-full ${focusRing} ${
                on
                  ? "bg-[var(--color-primary-light)] text-white shadow-sm hover:opacity-95"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
              }`}
            >
              <i className={`bi ${it.icon} text-[13px]`} aria-hidden="true" />
              <span>{it.label}</span>
              {!!it.badge && (
                <span className={`min-w-4 h-4 px-1 rounded-full text-[9px] leading-4 text-center font-bold ${
                  on ? "bg-white text-[var(--color-primary-light)]" : "bg-[var(--color-status-amber)] text-white"
                }`}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tr, isRtl } = useDash();
  const urlStoreId = searchParams.get("storeId") || searchParams.get("store");
  const urlUid = searchParams.get("uid") || searchParams.get("userId");
  const cleanUid = useMemo(() => {
    if (urlStoreId) return urlStoreId.replace(/^store_/, "");
    if (urlUid) return urlUid.replace(/^store_/, "");
    return undefined;
  }, [urlStoreId, urlUid]);

  const { orders, subscription } = useStoreOwnerData(cleanUid);
  const [globalSearch, setGlobalSearch] = useState("");
  const [section, setSection] = useState<SectionId>("overview");

  /* Auth / role routing (unchanged behaviour) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (urlStoreId || cleanUid) {
      if (cleanUid) localStorage.setItem("matager_active_user_id", cleanUid);
      if (urlStoreId) {
        localStorage.setItem("matager_current_store_id", urlStoreId);
        localStorage.setItem("matager_active_store_id", urlStoreId);
      }
      return;
    }

    const storedRole = localStorage.getItem("matager_user_role");
    const activeUid = localStorage.getItem("matager_active_user_id");
    const currentStoreId = localStorage.getItem("matager_current_store_id") || localStorage.getItem("matager_active_store_id");

    if (storedRole === "wholesaler") {
      const wid = localStorage.getItem("matager_wholesaler_id") || "wholesaler_clothing_01";
      router.push(`/wholesaler?wholesalerId=${wid}`);
      return;
    }
    if (storedRole === "cashier") {
      router.push("/cashier");
      return;
    }
    if (!activeUid && !storedRole && !currentStoreId) router.push("/?auth=signin");
  }, [router, urlStoreId, cleanUid]);

  /* Section <-> URL hash, so links like /dashboard#orders (and the nav's quick links) work. */
  useEffect(() => {
    setSection(readHash());
    const onHash = () => {
      setSection(readHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const changeSection = useCallback((id: SectionId) => {
    setSection(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const pending = orders.filter((o) => o.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-ui selection:bg-[var(--color-primary-light)]/30 pb-[max(4rem,env(safe-area-inset-bottom))] transition-colors duration-200">
      <TopNav searchValue={globalSearch} onSearchChange={setGlobalSearch} />
      <SectionBar active={section} onChange={changeSection} pendingOrders={pending} />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {subscription?.status === "pending_payment" && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl border border-[var(--color-status-amber)]/30 bg-[var(--color-status-amber-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--color-text-primary)] animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[var(--color-status-amber)]/20 text-[var(--color-status-amber)] flex items-center justify-center shrink-0">
                <i className="bi bi-credit-card text-base" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-[13px] text-[var(--color-status-amber)]">
                  {tr("Subscription Pending Payment", "الاشتراك بانتظار الدفع")}
                </p>
                <p className="text-[var(--color-text-muted)] text-[11px] mt-0.5">
                  {tr(
                    "Your subscription is awaiting payment via Kashier. Complete checkout to unlock all store features.",
                    "اشتراكك بانتظار تأكيد الدفع عبر كاشير. أكمل عملية الدفع لتفعيل كافة مميزات المتجر."
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    try {
                      const raw = localStorage.getItem("matager_pending_subscription");
                      if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed.sessionUrl) {
                          window.location.href = parsed.sessionUrl;
                          return;
                        }
                      }
                    } catch {}
                    window.location.href = `/?auth=signup&step=6`;
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <span>{tr("Complete Payment", "إتمام الدفع")}</span>
                <i className={`bi ${isRtl ? "bi-arrow-left" : "bi-arrow-right"}`} />
              </button>
            </div>
          </div>
        )}

        {/* key => the whole section fades in when the tab changes */}
        <div key={section} className="space-y-3 sm:space-y-5 animate-in fade-in duration-200">
          {section === "overview" && (
            <>
              <KpiStrip />
              <OverviewPanel />
            </>
          )}

          {section === "orders" && <RecentOrders externalFilter={globalSearch} />}

          {section === "catalog" && (
            <>
              <InventoryPanel externalFilter={globalSearch} />
              <Discounts />
              <WholesalerPanel />
            </>
          )}

          {section === "finance" && <FinancePanel />}

          {section === "customers" && <CustomersPanel />}

          {section === "store" && (
            <>
              <StorefrontConfig />
              <PosNodeManager />
              <TeamRoster />
              <AdTracking />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MerchantDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex items-center justify-center text-xs">
          Loading Matager Merchant Dashboard...
        </div>
      }
    >
      <DashboardLanguageProvider>
        <DashboardModalProvider>
          <DashboardContent />
        </DashboardModalProvider>
      </DashboardLanguageProvider>
    </Suspense>
  );
}
