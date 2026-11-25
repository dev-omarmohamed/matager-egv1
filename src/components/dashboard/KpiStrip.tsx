"use client";

import React from "react";
import { useDash } from "@/lib/useDash";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";

interface KpiTileProps {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
  index: number;
}

const KpiTile: React.FC<KpiTileProps> = ({ title, value, delta, positive, icon, index }) => {
  // Collapse borders to create a single continuous strip
  const marginClasses =
    index === 1
      ? "-ms-px"
      : index === 2
        ? "-mt-px lg:mt-0 lg:-ms-px"
        : index === 3
          ? "-ms-px -mt-px lg:mt-0"
          : "";

  return (
    <div
      className={`glass-panel bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] transition-all duration-200 ease-out p-4 sm:p-5 lg:p-6 min-w-0 flex flex-col justify-between group rounded-none ${marginClasses}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle truncate">
          {title}
        </span>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] transition-colors">
          <i className={`bi ${icon} text-xs`} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl lg:text-xl font-bold font-heading leading-none text-[var(--color-text-primary)] truncate">
            {value}
          </p>
        </div>
        <p
          className={`flex items-center gap-1 text-xs font-bold font-ui ${positive ? "text-[var(--color-status-green)]" : "text-[var(--color-status-red)]"
            }`}
        >
          <i
            className={`bi ${positive ? "bi-arrow-up-right" : "bi-arrow-down-right"} text-[11px]`}
            aria-hidden="true"
          />
          <span>{delta}</span>
        </p>
      </div>
    </div>
  );
};

export const KpiStrip: React.FC = () => {
  const { t } = useDash();
  const { totalRevenue, totalOrders, totalCustomers, averageCartValue } = useStoreOwnerData();
  const hasOrders = totalOrders > 0;

  const tiles = [
    {
      title: t.kpis.revenue.title,
      value: `EGP ${totalRevenue.toLocaleString()}`,
      delta: hasOrders ? t.kpis.revenue.delta : "0%",
      positive: hasOrders,
      icon: "bi-cash-coin",
    },
    {
      title: t.kpis.orders.title,
      value: `${totalOrders}`,
      delta: hasOrders ? t.kpis.orders.delta : "0%",
      positive: hasOrders,
      icon: "bi-bag-check",
    },
    {
      title: t.kpis.customers.title,
      value: `${totalCustomers}`,
      delta: hasOrders ? t.kpis.customers.delta : "0%",
      positive: hasOrders,
      icon: "bi-people",
    },
    {
      title: t.kpis.cartValue.title,
      value: `EGP ${averageCartValue.toLocaleString()}`,
      delta: hasOrders ? t.kpis.cartValue.delta : "0%",
      positive: hasOrders,
      icon: "bi-cart3",
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

      {/* Wrapper handles the outer rounded corners and hides the square inner corners */}
      <div className="rounded-[20px] overflow-hidden w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 w-full">
          {tiles.map((tile, i) => (
            <KpiTile key={tile.icon} {...tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};