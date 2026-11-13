"use client";

import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useDashboardLanguage } from "@/lib/i18n";
import { Wholesaler } from "@/lib/wholesalers";

interface WholesalerKpiStripProps {
  wholesaler: Wholesaler | null;
  inquiriesCount?: number;
}

export const WholesalerKpiStrip: React.FC<WholesalerKpiStripProps> = ({
  wholesaler,
  inquiriesCount = 8,
}) => {
  const { t } = useDashboardLanguage();

  const products = Object.values(wholesaler?.products || {});
  const catalogSize = products.length;
  const lowStockCount = products.filter((p) => p.stock < 200).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Catalog Size */}
      <KpiCard
        title={t.wholesaler.kpiCatalogSize}
        value={`${catalogSize} SKUs`}
        delta="+14.5%"
        isPositive={true}
        icon="bi-box-seam"
        sparklinePoints="0,25 20,20 40,22 60,15 80,10 100,5"
      />

      {/* 2. Avg. Order Value */}
      <KpiCard
        title={t.wholesaler.kpiAvgOrderValue}
        value="12,850 EGP"
        delta="+8.2%"
        isPositive={true}
        icon="bi-cash-coin"
        sparklinePoints="0,28 20,24 40,19 60,22 80,14 100,6"
      />

      {/* 3. Inquiries This Month */}
      <KpiCard
        title={t.wholesaler.kpiInquiries}
        value={`${inquiriesCount}`}
        delta="+28.0%"
        isPositive={true}
        icon="bi-chat-left-dots"
        sparklinePoints="0,30 20,26 40,20 60,18 80,12 100,4"
      />

      {/* 4. Low-Stock SKUs */}
      <KpiCard
        title={t.wholesaler.kpiLowStock}
        value={`${lowStockCount} SKUs`}
        delta={lowStockCount > 0 ? "Attention" : "Healthy"}
        isPositive={lowStockCount === 0}
        icon="bi-exclamation-triangle"
        sparklinePoints="0,10 20,15 40,12 60,20 80,25 100,28"
      />
    </div>
  );
};

