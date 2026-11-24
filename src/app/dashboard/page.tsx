"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
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
      className="sticky top-14 sm:top-16 z-40 bg-[var(--color-canvas)]/90 backdrop-blur-xl border-b border-[var(--color-border-subtle)]"
    >
      <div className={`max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto ${scrollNone}`}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-current={on ? "page" : undefined}
              className={`relative shrink-0 flex items-center gap-1.5 px-3 py-3 text-xs font-bold font-ui transition-colors rounded-t-lg ${focusRing} ${
                on ? "text-[var(--color-primary-light)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              <i className={`bi ${it.icon} text-[13px]`} aria-hidden="true" />
              <span>{it.label}</span>
              {!!it.badge && (
                <span className="min-w-4 h-4 px-1 rounded-full text-[9px] leading-4 text-center text-white bg-[var(--color-status-amber)]">
                  {it.badge}
                </span>
              )}
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--color-primary-light)] transition-transform duration-200 ${
                  on ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { orders } = useStoreOwnerData();
  const [globalSearch, setGlobalSearch] = useState("");
  const [section, setSection] = useState<SectionId>("overview");

  /* Auth / role routing (unchanged behaviour) */
  useEffect(() => {
    if (typeof window === "undefined") return;
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
  }, [router]);

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
