"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLanguageProvider } from "@/lib/i18n";
import { WholesalerTopNav } from "@/components/wholesaler/WholesalerTopNav";
import { WholesalerKpiStrip } from "@/components/wholesaler/WholesalerKpiStrip";
import { CatalogManager } from "@/components/wholesaler/CatalogManager";
import { AddProductDrawer } from "@/components/wholesaler/AddProductDrawer";
import { InquiryInbox } from "@/components/wholesaler/InquiryInbox";
import { Wholesaler, getWholesalerById, getWholesalerInquiries } from "@/lib/wholesalers";

function WholesalerConsoleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const wholesalerIdParam = searchParams.get("wholesalerId") || "wholesaler_clothing_01";
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null);
  const [inquiriesCount, setInquiriesCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Role Guard Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("matager_user_role");
      if (storedRole === "merchant") {
        router.push("/dashboard");
        return;
      }
    }
  }, [router]);

  const loadWholesaler = async () => {
    try {
      const data = await getWholesalerById(wholesalerIdParam);
      setWholesaler(data);
      const inqs = await getWholesalerInquiries(wholesalerIdParam);
      setInquiriesCount(inqs.length);
    } catch (err) {
      console.warn("Failed to load wholesaler:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWholesaler();
  }, [wholesalerIdParam]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-ui pb-16 transition-colors duration-200">
      {/* Top Navbar */}
      <WholesalerTopNav wholesaler={wholesaler} />

      {/* Main Console Canvas */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. KPI Metric Strip */}
        <WholesalerKpiStrip
          wholesaler={wholesaler}
          inquiriesCount={inquiriesCount}
        />

        {/* 2. Add Product Drawer */}
        <AddProductDrawer
          wholesalerId={wholesalerIdParam}
          onProductAdded={loadWholesaler}
        />

        {/* 3. Catalog Manager */}
        <CatalogManager
          wholesaler={wholesaler}
          onRefresh={loadWholesaler}
        />

        {/* 4. Inquiry Inbox */}
        <InquiryInbox
          wholesalerId={wholesalerIdParam}
          onInquiryUpdated={loadWholesaler}
        />
      </main>
    </div>
  );
}

export default function WholesalerConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex items-center justify-center text-xs">
          Loading Matager Wholesaler Console...
        </div>
      }
    >
      <DashboardLanguageProvider>
        <WholesalerConsoleContent />
      </DashboardLanguageProvider>
    </Suspense>
  );
}

