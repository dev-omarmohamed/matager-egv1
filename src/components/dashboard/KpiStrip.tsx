"use client";

import React from "react";
import { useDash } from "@/lib/useDash";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { surface, eyebrow } from "./ui/styles";

interface KpiTileProps {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
  points: string;
}

const KpiTile: React.FC<KpiTileProps> = ({ title, value, delta, positive, icon, points }) => {
  const tone = positive ? "text-[var(--color-status-green)]" : "text-[var(--color-status-red)]";
  return (
    <div className={`${surface} p-3 sm:p-4 min-w-0`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`${eyebrow} truncate`}>{title}</span>
        <i className={`bi ${icon} text-xs shrink-0 text-[var(--color-text-muted)]`} aria-hidden="true" />
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold font-heading leading-none text-[var(--color-text-primary)] truncate">
            {value}
          </p>
          <p className={`mt-1.5 flex items-center gap-0.5 text-[11px] font-bold font-ui ${tone}`}>
            <i className={`bi ${positive ? "bi-arrow-up-right" : "bi-arrow-down-right"} text-[10px]`} aria-hidden="true" />
            {delta}
          </p>
        </div>

        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          aria-hidden="true"
          className={`w-12 h-7 sm:w-20 sm:h-9 shrink-0 opacity-70 ${tone}`}
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};

export const KpiStrip: React.FC = () => {
  const { t } = useDash();
  const { totalRevenue, totalOrders, totalCustomers, averageCartValue } = useStoreOwnerData();
  const hasOrders = totalOrders > 0;

  const tiles: KpiTileProps[] = [
    {
      title: t.kpis.revenue.title,
      value: `EGP ${totalRevenue.toLocaleString()}`,
      delta: hasOrders ? t.kpis.revenue.delta : "0%",
      positive: hasOrders,
      icon: "bi-cash-coin",
      points: "0,26 15,22 30,24 45,18 60,19 75,12 90,14 100,5",
    },
    {
      title: t.kpis.orders.title,
      value: `${totalOrders}`,
      delta: hasOrders ? t.kpis.orders.delta : "0%",
      positive: hasOrders,
      icon: "bi-bag-check",
      points: "0,24 20,20 40,22 60,15 80,14 100,6",
    },
    {
      title: t.kpis.customers.title,
      value: `${totalCustomers}`,
      delta: hasOrders ? t.kpis.customers.delta : "0%",
      positive: hasOrders,
      icon: "bi-people",
      points: "0,25 20,22 40,18 60,19 80,11 100,7",
    },
    {
      title: t.kpis.cartValue.title,
      value: `EGP ${averageCartValue.toLocaleString()}`,
      delta: hasOrders ? t.kpis.cartValue.delta : "0%",
      positive: hasOrders,
      icon: "bi-cart3",
      points: "0,22 20,24 40,19 60,16 80,12 100,8",
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold font-heading tracking-tight text-[var(--color-text-primary)]">
          {t.welcome.title}
        </h1>
        <p className="text-xs sm:text-sm font-subtitle text-[var(--color-text-secondary)] mt-0.5">
          {t.welcome.subtitle}
        </p>
      </div>

      {/* 2x2 on phones so all four numbers are visible without scrolling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {tiles.map((tile) => (
          <KpiTile key={tile.icon} {...tile} />
        ))}
      </div>
    </section>
  );
};
