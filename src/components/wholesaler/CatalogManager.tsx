"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  Wholesaler,
  WholesalerProduct,
  saveWholesalerProduct,
} from "@/lib/wholesalers";
import { STORE_CATEGORIES, StoreCategory, CATEGORY_LABELS } from "@/lib/categories";

interface CatalogManagerProps {
  wholesaler: Wholesaler | null;
  onRefresh: () => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  wholesaler,
  onRefresh,
}) => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const products = Object.values(wholesaler?.products || {});

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameAr && p.nameAr.includes(search));
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleStatus = async (product: WholesalerProduct) => {
    if (!wholesaler) return;
    setUpdatingId(product.id);
    try {
      const nextStatus = product.status === "active" ? "paused" : "active";
      await saveWholesalerProduct(wholesaler.id, {
        ...product,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      onRefresh();
    } catch (err) {
      console.warn("Failed to toggle product status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200">
      {/* Header Strip */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
            <i className="bi bi-grid-3x3" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
              {t.wholesaler.catalogTitle}
            </h3>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              Live trade catalog published to verified matching retailers.
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={t.wholesaler.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 flex flex-wrap items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
          }`}
        >
          All Categories ({products.length})
        </button>
        {STORE_CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                selectedCategory === cat
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
              }`}
            >
              <span>{CATEGORY_LABELS[cat][isAr ? "ar" : "en"]}</span>
              <span className="opacity-60 text-[9px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-[10px] uppercase font-bold tracking-wider">
              <th className="py-3 px-4">SKU & Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Base Price</th>
              <th className="py-3 px-4">MOQ</th>
              <th className="py-3 px-4">Tier Ladder & Best Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                  No products found matching criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const prodName = isAr && product.nameAr ? product.nameAr : product.name;
                const bestTier = product.tiers && product.tiers.length > 0
                  ? product.tiers[product.tiers.length - 1]
                  : null;

                const rowToggleId = `edit-row-${product.id}`;

                return (
                  <React.Fragment key={product.id}>
                    {/* Pure-CSS Row Collapsible Checkbox */}
                    <tr className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                      {/* SKU & Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--color-text-primary)]">
                          {prodName}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-ui tracking-wide">
                          {product.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <StatusPill variant="neutral">
                          {CATEGORY_LABELS[product.category]?.[isAr ? "ar" : "en"] || product.category}
                        </StatusPill>
                      </td>

                      {/* Base Price */}
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                        {product.basePrice} EGP
                        <span className="block text-[10px] text-[var(--color-text-muted)] font-normal">
                          MSRP: {product.msrp} EGP
                        </span>
                      </td>

                      {/* MOQ */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          {product.moq} {product.unit}s
                        </span>
                      </td>

                      {/* Tier ladder & Cheapest Tier Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {product.tiers.map((tier, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border-subtle)]"
                            >
                              ≥{tier.minQty}: {tier.price}
                            </span>
                          ))}
                          {bestTier && (
                            <StatusPill variant="success" className="ms-1">
                              Best: {bestTier.price} EGP
                            </StatusPill>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold ${
                            product.stock < 100
                              ? "text-[var(--color-status-amber)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusPill variant={product.status === "active" ? "success" : "pending"}>
                          {product.status === "active" ? t.wholesaler.active : t.wholesaler.paused}
                        </StatusPill>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          disabled={updatingId === product.id}
                          className="px-2.5 py-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                        >
                          {product.status === "active" ? t.wholesaler.paused : t.wholesaler.active}
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

