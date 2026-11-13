"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const InventoryPanel: React.FC = () => {
  const { t } = useDashboardLanguage();
  const [productSearch, setProductSearch] = useState("");

  const products = [
    {
      id: "p1",
      name: "Nike Air Max 270",
      sku: "SKU: NK-270-BLK",
      category: "Footwear",
      stockText: "84 in Stock",
      statusVariant: "success" as const,
      price: "4,200",
      currency: "EGP",
      image: "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/pysqd15onjaeugu8mh4l/AIR+MAX+270.png",
    },
    {
      id: "p2",
      name: "Essential Oversized Tee",
      sku: "SKU: AP-TS-001",
      category: "Apparel",
      stockText: "04 Remaining",
      statusVariant: "pending" as const,
      price: "850",
      currency: "EGP",
      icon: "bi-tag",
    },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      {/* 3 Pure-CSS Sub-tab Checkboxes */}
      <input type="checkbox" id="toggle-capacity" className="peer/capacity hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-live" className="peer/live hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-settings" className="peer/settings hidden" aria-hidden="true" />

      {/* Main Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.inventory.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <label
            htmlFor="toggle-capacity"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/capacity:[&_.cap-chevron]:rotate-180"
          >
            <span>{t.inventory.tabCapacity}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] cap-chevron text-[10px]" />
          </label>

          <label
            htmlFor="toggle-live"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/live:[&_.live-chevron]:rotate-180"
          >
            <span>{t.inventory.tabLive}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] live-chevron text-[10px]" />
          </label>

          <label
            htmlFor="toggle-settings"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/settings:[&_.set-chevron]:rotate-180"
          >
            <span>{t.inventory.tabSettings}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] set-chevron text-[10px]" />
          </label>
        </div>
      </div>

      {/* 1. CAPACITY & HEALTH DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/capacity:max-h-[300px] bg-white/[0.01] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                {t.inventory.capacity.title}
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold font-heading text-[var(--color-text-primary)]">
                  {t.inventory.capacity.total}
                </span>
                <StatusPill variant="info">{t.inventory.capacity.badge}</StatusPill>
              </div>
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="text-[var(--color-text-muted)] font-subtitle">
                  {t.inventory.capacity.usageLabel}
                </span>
                <span className="text-[var(--color-status-blue)] font-bold">
                  {t.inventory.capacity.usageValue}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] h-full w-[50%] rounded-full" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded-lg text-[10px] font-bold font-ui hover:opacity-95 transition-all shadow-sm"
              >
                {t.inventory.capacity.addNew}
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-[10px] font-bold font-ui transition-all"
              >
                {t.inventory.capacity.upgrade}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-5 rtl:md:pl-0 rtl:md:pr-5">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
              {t.inventory.capacity.healthAlerts}
            </p>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-text-secondary)]">{t.inventory.capacity.draftProducts}</span>
              <span className="font-bold text-[var(--color-text-primary)]">12</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-status-amber)]">{t.inventory.capacity.lowStockAlert}</span>
              <span className="font-bold text-[var(--color-status-amber)]">08</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-status-red)]">{t.inventory.capacity.depletedStock}</span>
              <span className="font-bold text-[var(--color-status-red)]">03</span>
            </div>
            <button
              type="button"
              className="w-full mt-2 py-1.5 border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-[10px] font-bold font-ui transition-all text-center"
            >
              {t.inventory.capacity.manageFull}
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE PRODUCTS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/live:max-h-[350px] bg-white/[0.01] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t.inventory.liveList.searchPlaceholder}
                className="w-full bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
              />
            </div>
            <button
              type="button"
              className="px-3 py-1.5 bg-white/5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-[10px] font-bold font-ui transition-colors"
            >
              {t.inventory.liveList.filterBtn}
            </button>
          </div>

          <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-[10px]">
              <thead>
                <tr className="text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 font-medium">{t.inventory.liveList.thProduct}</th>
                  <th className="pb-2 font-medium">{t.inventory.liveList.thCategory}</th>
                  <th className="pb-2 font-medium">{t.inventory.liveList.thStatus}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.inventory.liveList.thPrice}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.inventory.liveList.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded bg-white/5 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0">
                            <i className="bi bi-tag text-xs" />
                          </div>
                        )}
                        <div>
                          <p className="text-[var(--color-text-primary)] font-bold">{p.name}</p>
                          <p className="text-[9px] text-[var(--color-text-muted)]">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-[var(--color-text-secondary)] font-ui">{p.category}</td>
                    <td className="py-2.5">
                      <StatusPill variant={p.statusVariant}>{p.stockText}</StatusPill>
                    </td>
                    <td className="py-2.5 text-right rtl:text-left font-bold text-[var(--color-text-primary)]">
                      {p.price}{" "}
                      <span className="text-[9px] text-[var(--color-text-muted)] font-normal font-ui">
                        {p.currency}
                      </span>
                    </td>
                    <td className="py-2.5 text-right rtl:text-left space-x-1 rtl:space-x-reverse">
                      <button
                        type="button"
                        className="w-6 h-6 inline-flex items-center justify-center rounded bg-white/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary-light)] text-[var(--color-text-muted)] transition-colors"
                      >
                        <i className="bi bi-pencil text-[9px]" />
                      </button>
                      <button
                        type="button"
                        className="w-6 h-6 inline-flex items-center justify-center rounded bg-white/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-status-red)] hover:text-[var(--color-status-red)] text-[var(--color-text-muted)] transition-colors"
                      >
                        <i className="bi bi-trash text-[9px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. STOCK SETTINGS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/settings:max-h-[300px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)]/40 pb-2.5">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                {t.inventory.settings.showOutOfStock}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.inventory.settings.showOutOfStockDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-primary-dark)]" />
            </label>
          </div>

          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)]/40 pb-2.5">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                {t.inventory.settings.hideDepleted}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.inventory.settings.hideDepletedDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-primary-dark)]" />
            </label>
          </div>

          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)]/40 pb-2.5">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                {t.inventory.settings.autoRestock}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.inventory.settings.autoRestockDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-primary-dark)]" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                {t.inventory.settings.restockQty}
              </span>
              <input
                type="number"
                defaultValue={50}
                className="w-16 bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-md py-1 px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-light)]"
              />
            </div>
            <button
              type="button"
              className="px-4 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] hover:opacity-95 text-white rounded-lg text-xs font-bold font-ui transition-all shadow-sm"
            >
              {t.inventory.settings.saveBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
