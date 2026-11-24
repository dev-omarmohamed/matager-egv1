"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { useDash } from "@/lib/useDash";
import { Panel } from "./ui/Panel";
import { Collapse } from "./ui/Collapse";
import { EmptyState } from "./ui/EmptyState";
import { btnPrimary, btnGhost, divider, eyebrow, focusRing, inputCls } from "./ui/styles";

export interface WholesalerPanelProps {
  storeId?: string;
  className?: string;
}

export const WholesalerPanel: React.FC<WholesalerPanelProps> = ({ storeId: propStoreId, className = "" }) => {
  const { t, tr, isRtl } = useDash();
  const searchParams = useSearchParams();
  const storeId = propStoreId || searchParams?.get("storeId") || "peacock_store";

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<StoreCategory>("clothing");
  const [suppliers, setSuppliers] = useState<Wholesaler[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        let cat: StoreCategory = storeId === "living_store" ? "home-appliances" : "clothing";
        if (rtdb) {
          try {
            const snap = await rtdbGet(rtdbRef(rtdb, `stores/${storeId}/category`));
            if (snap.exists() && snap.val()) cat = snap.val() as StoreCategory;
          } catch {
            /* keep default category */
          }
        }
        const all = await getWholesalers();
        if (!alive) return;
        const visible = getVisibleWholesalers(storeId, cat, all);
        const seed: Record<string, number> = {};
        visible.forEach((w) => Object.values(w.products || {}).forEach((p) => (seed[p.id] = p.moq || 10)));
        setCategory(cat);
        setSuppliers(visible);
        setQty(seed);
        setOpenId(visible[0]?.id ?? null);
      } catch (err) {
        console.warn("WholesalerPanel data loading error:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storeId]);

  const sendQuote = async (wholesalerId: string, product: WholesalerProduct) => {
    const q = qty[product.id] || product.moq || 1;
    setSending((p) => ({ ...p, [product.id]: true }));
    try {
      await createWholesalerInquiry({
        storeId,
        wholesalerId,
        productId: product.id,
        sku: product.sku,
        qty: q,
        offeredPrice: computeTierPrice(product, q),
        note: notes[product.id] || "",
      });
      setSent((p) => ({ ...p, [product.id]: true }));
    } catch (err) {
      console.warn("Failed to submit inquiry:", err);
    } finally {
      setSending((p) => ({ ...p, [product.id]: false }));
    }
  };

  const categoryLabel = CATEGORY_LABELS[category] ? (isRtl ? CATEGORY_LABELS[category].ar : CATEGORY_LABELS[category].en) : category;

  return (
    <Panel
      className={className}
      title={t.wholesaler.panelTitle}
      subtitle={t.wholesaler.panelSubtitle}
      icon="bi-boxes"
      meta={<span className="hidden sm:inline-flex"><StatusPill variant="purple">{categoryLabel}</StatusPill></span>}
      toggleLabel={t.wholesaler.showSuppliers}
      defaultOpen={false}
    >
      {loading ? (
        <div className="p-4 space-y-3 animate-pulse" aria-busy="true">
          <div className="h-16 rounded-xl bg-[var(--color-surface-elevated)]" />
          <div className="h-28 rounded-xl bg-[var(--color-surface-elevated)]" />
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon="bi-slash-circle"
          title={t.wholesaler.noWholesalers}
          desc={tr(
            `Category "${categoryLabel}" has no registered wholesalers in your territory yet.`,
            `لا يوجد موردون مسجلون لفئة "${categoryLabel}" في منطقتك حالياً.`
          )}
        />
      ) : (
        <div className="p-3 sm:p-4 space-y-3">
          {suppliers.map((w) => {
            const open = openId === w.id;
            const products = Object.values(w.products || {});
            const name = isRtl && w.profile.nameAr ? w.profile.nameAr : w.profile.name;
            const desc = isRtl && w.profile.descriptionAr ? w.profile.descriptionAr : w.profile.description;

            return (
              <div key={w.id} className={`rounded-2xl border ${divider} bg-[var(--color-surface)] overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : w.id)}
                  aria-expanded={open}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 text-start ${focusRing}`}
                >
                  <span className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]">
                    <i className="bi bi-building-check text-lg" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] truncate">{name}</span>
                      <StatusPill variant={w.profile.status === "active" ? "success" : "pending"}>
                        {w.profile.status === "active" ? t.wholesaler.active : t.wholesaler.paused}
                      </StatusPill>
                    </span>
                    <span className="block text-[11px] text-[var(--color-text-muted)] truncate">{desc}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[10px] text-[var(--color-text-secondary)]">
                      <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{w.profile.city}, {w.profile.country}</span>
                      <span><i className="bi bi-shield-check me-1 text-[var(--color-status-green)]" aria-hidden="true" />{tr("Verified", "موثّق")}</span>
                      <span>{t.wholesaler.minOrder}: <b>{w.profile.minOrderValue.toLocaleString()} {w.profile.currency}</b></span>
                      <span><b>{products.length}</b> {tr("SKUs", "منتج")}</span>
                    </span>
                  </span>

                  <i className={`bi bi-chevron-down text-xs shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                <Collapse open={open}>
                  <ul className={`divide-y ${divider} border-t ${divider} bg-[var(--color-canvas)]/40`}>
                    {products.map((p) => {
                      const q = qty[p.id] || p.moq || 1;
                      const price = computeTierPrice(p, q);
                      const pName = isRtl && p.nameAr ? p.nameAr : p.name;

                      return (
                        <li key={p.id} className="p-3 sm:p-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.6fr)] lg:items-center">
                          {/* Product */}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{pName}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">
                              <span dir="ltr">{p.sku}</span> · {p.stock} {tr("in stock", "متوفر")}
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                              <span className="line-through text-[var(--color-text-muted)]">{p.msrp}</span> → {p.basePrice} EGP
                              <span className="ms-2"><StatusPill variant="neutral">{t.wholesaler.moq}: {p.moq} {p.unit}</StatusPill></span>
                            </p>
                          </div>

                          {/* Tiers */}
                          <div className="flex flex-wrap gap-1.5">
                            {p.tiers.map((tier, i) => {
                              const active = q >= tier.minQty;
                              return (
                                <span
                                  key={i}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors duration-200 ${
                                    active
                                      ? "border-[var(--color-primary-light)] text-[var(--color-primary-light)] bg-[var(--color-primary-light)]/10 font-bold"
                                      : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                                  }`}
                                >
                                  ≥{tier.minQty}: {tier.price}
                                </span>
                              );
                            })}
                          </div>

                          {/* Quote */}
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              aria-label={tr("Order quantity", "الكمية")}
                              value={q}
                              onChange={(e) => setQty((s) => ({ ...s, [p.id]: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                              className={`${inputCls} !w-20`}
                            />
                            <div className="min-w-[72px]">
                              <p className="text-sm font-black text-[var(--color-primary-light)] leading-none">{price} EGP</p>
                              <p className="text-[9px] text-[var(--color-text-muted)]">{(price * q).toLocaleString()} EGP</p>
                            </div>

                            {sent[p.id] ? (
                              <StatusPill variant="success">
                                <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                                {t.wholesaler.quoteSent}
                              </StatusPill>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  placeholder={tr("Note…", "ملاحظة…")}
                                  value={notes[p.id] || ""}
                                  onChange={(e) => setNotes((s) => ({ ...s, [p.id]: e.target.value }))}
                                  className={`${inputCls} flex-1 min-w-[96px]`}
                                />
                                <button type="button" onClick={() => sendQuote(w.id, p)} disabled={sending[p.id]} className={btnPrimary}>
                                  {sending[p.id] ? <i className="bi bi-arrow-repeat animate-spin" aria-hidden="true" /> : t.wholesaler.requestQuote}
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Collapse>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
