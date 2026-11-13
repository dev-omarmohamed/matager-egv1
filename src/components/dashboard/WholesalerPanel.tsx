"use client";

import React, { useState, useEffect, useId } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  getWholesalers,
  getVisibleWholesalers,
  computeTierPrice,
  createWholesalerInquiry,
  Wholesaler,
  WholesalerProduct,
} from "@/lib/wholesalers";
import { StoreCategory, CATEGORY_LABELS } from "@/lib/categories";
import { rtdb } from "@/lib/firebase";
import { ref as rtdbRef, get as rtdbGet } from "firebase/database";

export interface WholesalerPanelProps {
  storeId?: string;
  className?: string;
}

export const WholesalerPanel: React.FC<WholesalerPanelProps> = ({
  storeId: propStoreId,
  className = "",
}) => {
  const { t, locale, dir } = useDashboardLanguage();
  const searchParams = useSearchParams();
  const effectiveStoreId = propStoreId || searchParams?.get("storeId") || "peacock_store";

  const [loading, setLoading] = useState(true);
  const [storeCategory, setStoreCategory] = useState<StoreCategory>("clothing");
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [visibleWholesalers, setVisibleWholesalers] = useState<Wholesaler[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [inquiryNotes, setInquiryNotes] = useState<Record<string, string>>({});
  const [sentInquiries, setSentInquiries] = useState<Record<string, boolean>>({});
  const [sendingInquiry, setSendingInquiry] = useState<Record<string, boolean>>({});

  const componentId = useId().replace(/:/g, "");

  // 1. Fetch store category and wholesalers
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        // Fetch store category from RTDB or fallback based on storeId
        let cat: StoreCategory = "clothing";
        if (effectiveStoreId === "living_store") {
          cat = "home-appliances";
        }

        if (rtdb) {
          try {
            const snap = await rtdbGet(rtdbRef(rtdb, `stores/${effectiveStoreId}/category`));
            if (snap.exists() && snap.val()) {
              cat = snap.val() as StoreCategory;
            }
          } catch {
            // Keep default
          }
        }

        const all = await getWholesalers();
        if (isMounted) {
          setStoreCategory(cat);
          setWholesalers(all);
          const visible = getVisibleWholesalers(effectiveStoreId, cat, all);
          setVisibleWholesalers(visible);

          // Seed default quantities with MOQ
          const initialQtys: Record<string, number> = {};
          visible.forEach((w) => {
            const prods = Object.values(w.products || {});
            prods.forEach((p) => {
              initialQtys[p.id] = p.moq || 10;
            });
          });
          setQuantities(initialQtys);
        }
      } catch (err) {
        console.warn("WholesalerPanel data loading error:", err);
      } finally {
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 300); // 300ms shimmer skeleton matching KpiCard
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [effectiveStoreId]);

  const handleQtyChange = (productId: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, isNaN(val) ? 1 : val),
    }));
  };

  const handleNoteChange = (productId: string, note: string) => {
    setInquiryNotes((prev) => ({
      ...prev,
      [productId]: note,
    }));
  };

  const handleSendQuote = async (
    wholesalerId: string,
    product: WholesalerProduct
  ) => {
    const qty = quantities[product.id] || product.moq || 1;
    const offeredPrice = computeTierPrice(product, qty);
    const note = inquiryNotes[product.id] || "";

    setSendingInquiry((prev) => ({ ...prev, [product.id]: true }));
    try {
      await createWholesalerInquiry({
        storeId: effectiveStoreId,
        wholesalerId,
        productId: product.id,
        sku: product.sku,
        qty,
        offeredPrice,
        note,
      });
      setSentInquiries((prev) => ({ ...prev, [product.id]: true }));
    } catch (err) {
      console.warn("Failed to submit inquiry:", err);
    } finally {
      setSendingInquiry((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const isAr = locale === "ar";
  const categoryLabel = CATEGORY_LABELS[storeCategory]
    ? isAr
      ? CATEGORY_LABELS[storeCategory].ar
      : CATEGORY_LABELS[storeCategory].en
    : storeCategory;

  return (
    <div
      className={`glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px] ${className}`}
    >
      {/* Pure-CSS Main Panel Collapsible Checkbox */}
      <input
        type="checkbox"
        id={`toggle-wholesaler-${componentId}`}
        defaultChecked={true}
        className="peer/panel hidden"
        aria-hidden="true"
      />

      {/* Main Panel Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
            <i className="bi bi-boxes text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
                {t.wholesaler.panelTitle}
              </h3>
              <StatusPill variant="purple">{categoryLabel}</StatusPill>
            </div>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              {t.wholesaler.panelSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor={`toggle-wholesaler-${componentId}`}
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/panel:[&_.panel-chevron]:rotate-180"
          >
            <span>{t.wholesaler.showSuppliers}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] panel-chevron text-[10px]" />
          </label>
        </div>
      </div>

      {/* Collapsible Content Body */}
      <div className="max-h-0 peer-checked/panel:max-h-[3000px] transition-all duration-500 ease-in-out overflow-hidden">
        {loading ? (
          /* 300ms Shimmer Loading Skeleton */
          <div className="p-5 space-y-4 animate-pulse">
            <div className="h-20 bg-white/10 rounded-xl" />
            <div className="h-40 bg-white/10 rounded-xl" />
          </div>
        ) : visibleWholesalers.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
              <i className="bi bi-slash-circle text-xl" />
            </div>
            <h4 className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
              {t.wholesaler.noWholesalers}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
              Category &quot;{categoryLabel}&quot; has no registered wholesalers in your territory. New suppliers are onboarded weekly.
            </p>
          </div>
        ) : (
          /* Wholesaler Grid & Catalogs */
          <div className="p-4 sm:p-5 space-y-5">
            {visibleWholesalers.map((wholesaler, idx) => {
              const catalogToggleId = `toggle-catalog-${componentId}-${wholesaler.id}`;
              const productsList = Object.values(wholesaler.products || {});
              const displayName = isAr && wholesaler.profile.nameAr ? wholesaler.profile.nameAr : wholesaler.profile.name;
              const displayDesc = isAr && wholesaler.profile.descriptionAr ? wholesaler.profile.descriptionAr : wholesaler.profile.description;

              return (
                <div
                  key={wholesaler.id}
                  className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] overflow-hidden transition-all duration-200"
                >
                  {/* Layer 1: Supplier Summary Bar */}
                  <input
                    type="checkbox"
                    id={catalogToggleId}
                    defaultChecked={idx === 0}
                    className={`peer/catalog_${wholesaler.id} hidden`}
                    aria-hidden="true"
                  />

                  <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-glass-card-bg)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary)] font-bold text-lg shadow-sm">
                        <i className="bi bi-building-check" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
                            {displayName}
                          </h4>
                          <StatusPill variant={wholesaler.profile.status === "active" ? "success" : "pending"}>
                            {wholesaler.profile.status === "active" ? t.wholesaler.active : t.wholesaler.paused}
                          </StatusPill>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 max-w-lg mt-0.5">
                          {displayDesc}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <i className="bi bi-geo-alt text-[10px]" />
                            {wholesaler.profile.city}, {wholesaler.profile.country}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold">
                            <i className="bi bi-shield-check text-[10px] text-[var(--color-status-green)]" />
                            Verified Wholesaler
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Catalog Toggle Button */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="text-right rtl:text-left">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                          {t.wholesaler.minOrder}
                        </span>
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">
                          {wholesaler.profile.minOrderValue.toLocaleString()} {wholesaler.profile.currency}
                        </span>
                      </div>

                      <div className="text-right rtl:text-left">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                          {t.wholesaler.skuCount}
                        </span>
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">
                          {productsList.length} SKUs
                        </span>
                      </div>

                      <label
                        htmlFor={catalogToggleId}
                        className="cursor-pointer select-none px-3.5 py-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-glass-card-bg)] text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>{t.wholesaler.viewCatalog}</span>
                        <i className="bi bi-chevron-down text-[10px] transition-transform duration-300" />
                      </label>
                    </div>
                  </div>

                  {/* Layer 2: Catalog Drawer (Pure-CSS peer toggle) */}
                  <div
                    className={`max-h-0 peer-checked/catalog_${wholesaler.id}:max-h-[2500px] transition-all duration-500 ease-in-out overflow-hidden bg-[var(--color-canvas)]/50`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="overflow-x-auto rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                        <table className="w-full text-left rtl:text-right border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-[10px] uppercase font-bold tracking-wider">
                              <th className="py-3 px-4">Product / SKU</th>
                              <th className="py-3 px-4">Base MSRP</th>
                              <th className="py-3 px-4">{t.wholesaler.moq}</th>
                              <th className="py-3 px-4">{t.wholesaler.tierEditor}</th>
                              <th className="py-3 px-4 min-w-[120px]">Order Qty</th>
                              <th className="py-3 px-4 min-w-[120px]">{t.wholesaler.yourPrice}</th>
                              <th className="py-3 px-4 min-w-[200px]">Action & Quote</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {productsList.map((product) => {
                              const qty = quantities[product.id] || product.moq || 1;
                              const currentTierPrice = computeTierPrice(product, qty);
                              const isSent = sentInquiries[product.id];
                              const isSubmitting = sendingInquiry[product.id];
                              const prodName = isAr && product.nameAr ? product.nameAr : product.name;

                              return (
                                <tr
                                  key={product.id}
                                  className="hover:bg-[var(--color-surface-hover)]/40 transition-colors"
                                >
                                  {/* Product & SKU */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-[var(--color-text-primary)]">
                                      {prodName}
                                    </div>
                                    <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                      {product.sku} • {product.stock} in stock
                                    </div>
                                  </td>

                                  {/* MSRP */}
                                  <td className="py-3.5 px-4 text-[var(--color-text-muted)]">
                                    <span className="line-through">
                                      {product.msrp} EGP
                                    </span>
                                    <span className="block text-[var(--color-text-secondary)] font-medium">
                                      Base: {product.basePrice} EGP
                                    </span>
                                  </td>

                                  {/* MOQ */}
                                  <td className="py-3.5 px-4">
                                    <StatusPill variant="neutral">
                                      {product.moq} {product.unit}s
                                    </StatusPill>
                                  </td>

                                  {/* Volume Tiers Ladder */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex flex-wrap gap-1.5">
                                      {product.tiers.map((t, idx) => {
                                        const isActiveTier = qty >= t.minQty;
                                        return (
                                          <span
                                            key={idx}
                                            className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                              isActiveTier
                                                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-bold"
                                                : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-[var(--color-surface)]"
                                            }`}
                                          >
                                            ≥{t.minQty}: {t.price} EGP
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>

                                  {/* Qty Input */}
                                  <td className="py-3.5 px-4">
                                    <input
                                      type="number"
                                      min={1}
                                      value={qty}
                                      onChange={(e) =>
                                        handleQtyChange(product.id, parseInt(e.target.value, 10))
                                      }
                                      className="w-20 px-2 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                  </td>

                                  {/* Computed Tier Price in Gradient */}
                                  <td className="py-3.5 px-4">
                                    <div className="text-sm font-black bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                                      {currentTierPrice} EGP
                                    </div>
                                    <div className="text-[9px] text-[var(--color-text-muted)]">
                                      Total: {(currentTierPrice * qty).toLocaleString()} EGP
                                    </div>
                                  </td>

                                  {/* Request Quote Inline Form */}
                                  <td className="py-3.5 px-4">
                                    {isSent ? (
                                      <StatusPill variant="success">
                                        <i className="bi bi-check2-circle me-1" />
                                        {t.wholesaler.quoteSent}
                                      </StatusPill>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Note..."
                                          value={inquiryNotes[product.id] || ""}
                                          onChange={(e) => handleNoteChange(product.id, e.target.value)}
                                          className="w-28 px-2 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--input-border-color)] text-[11px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSendQuote(wholesaler.id, product)}
                                          disabled={isSubmitting}
                                          className="px-3 py-1 rounded-lg bg-[var(--gradient-primary)] text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                                        >
                                          {isSubmitting ? "..." : t.wholesaler.requestQuote}
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

