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
  return (
    <div className={`${surface} p-4 sm:p-5 lg:p-6 min-w-0 flex flex-col justify-between group`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`${eyebrow} truncate`}>{title}</span>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] transition-colors">
          <i className={`bi ${icon} text-xs`} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading leading-none text-[var(--color-text-primary)] truncate">
            {value}
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs font-bold font-ui text-[var(--color-status-green)]">
            <i className="bi bi-arrow-up-right text-[11px]" aria-hidden="true" />
            <span>{delta}</span>
          </p>
        </div>

        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="w-14 h-8 sm:w-20 sm:h-9 shrink-0 text-[var(--color-status-green)] opacity-85 transition-opacity group-hover:opacity-100"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
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
