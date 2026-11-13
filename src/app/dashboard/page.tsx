"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardLanguageProvider } from "@/lib/i18n";
import { TopNav } from "@/components/dashboard/TopNav";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { ActionHub } from "@/components/dashboard/ActionHub";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { LiveVisitors } from "@/components/dashboard/LiveVisitors";
import { TeamRoster } from "@/components/dashboard/TeamRoster";
import { PosNodeManager } from "@/components/dashboard/PosNodeManager";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { RevenueLedger } from "@/components/dashboard/RevenueLedger";
import { PaymentAnalytics } from "@/components/dashboard/PaymentAnalytics";
import { InventoryPanel } from "@/components/dashboard/InventoryPanel";
import { WholesalerPanel } from "@/components/dashboard/WholesalerPanel";
import { CustomerBase } from "@/components/dashboard/CustomerBase";
import { Discounts } from "@/components/dashboard/Discounts";
import { FinancialLedger } from "@/components/dashboard/FinancialLedger";
import { AdTracking } from "@/components/dashboard/AdTracking";
import { ProductReviews } from "@/components/dashboard/ProductReviews";
import { StorefrontConfig } from "@/components/dashboard/StorefrontConfig";

function DashboardContent() {
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("matager_user_role");
      if (storedRole === "wholesaler") {
        const wid = localStorage.getItem("matager_wholesaler_id") || "wholesaler_clothing_01";
        router.push(`/wholesaler?wholesalerId=${wid}`);
      } else if (storedRole === "cashier") {
        router.push("/cashier");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-ui selection:bg-[var(--color-primary-light)]/30 selection:text-white pb-16 transition-colors duration-200">
      {/* Sticky Top Navbar */}
      <TopNav
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Dashboard Canvas */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Welcome Strip & 4 KPIs */}
        <KpiStrip />

        {/* 2 & 3. Immediate Action Hub + Current Plan Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActionHub />
          </div>
          <div className="lg:col-span-1">
            <PlanCard />
          </div>
        </div>

        {/* 4. Live Visitors Real-Time Telemetry */}
        <LiveVisitors />

        {/* 5. Team Overview & Roster */}
        <TeamRoster />

        {/* 5.5 POS Cashier Terminal Nodes & In-Store Revenue Split */}
        <PosNodeManager />

        {/* 6. Recent Orders (Summary, Latest Order, Stuck Carts + Orders Table) */}
        <RecentOrders externalFilter={globalSearch} />

        {/* 7. Annual Revenue Ledger */}
        <RevenueLedger />

        {/* 8. Payment Analytics & Transactions */}
        <PaymentAnalytics />

        {/* 9. Inventory Management (Capacity, Live Products, Settings) */}
        <InventoryPanel />

        {/* 9.5 Wholesaler Directory & Category-Gated Catalog */}
        <WholesalerPanel />

        {/* 10. Customer Base & Performance */}
        <CustomerBase />

        {/* 11. Store Discounts & Promo Codes */}
        <Discounts />

        {/* 12. Financial Ledger (Funds, Escrow, Expenses) */}
        <FinancialLedger />

        {/* 13. Ad Tracking & Pixel Health */}
        <AdTracking />

        {/* 14. Product Reviews & Customer Feedback */}
        <ProductReviews />

        {/* 15. Storefront Configuration (Domain, Themes, Logistics) */}
        <StorefrontConfig />
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
        <DashboardContent />
      </DashboardLanguageProvider>
    </Suspense>
  );
}
