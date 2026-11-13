"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  WholesalerProduct,
  WholesalerPriceTier,
  validateTiers,
  saveWholesalerProduct,
} from "@/lib/wholesalers";
import { STORE_CATEGORIES, StoreCategory, CATEGORY_LABELS } from "@/lib/categories";

interface AddProductDrawerProps {
  wholesalerId: string;
  onProductAdded: () => void;
  drawerId?: string;
}

export const AddProductDrawer: React.FC<AddProductDrawerProps> = ({
  wholesalerId,
  onProductAdded,
  drawerId = "toggle-add-product-drawer",
}) => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState<StoreCategory>("clothing");
  const [basePrice, setBasePrice] = useState<number>(100);
  const [msrp, setMsrp] = useState<number>(150);
  const [moq, setMoq] = useState<number>(10);
  const [unit, setUnit] = useState<"piece" | "pack" | "carton">("piece");
  const [stock, setStock] = useState<number>(500);

  const [tiers, setTiers] = useState<WholesalerPriceTier[]>([
    { minQty: 10, price: 95 },
    { minQty: 50, price: 85 },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newQty = lastTier ? lastTier.minQty * 2 : 20;
    const newPrice = lastTier ? Math.max(1, Math.round(lastTier.price * 0.9)) : 90;
    setTiers([...tiers, { minQty: newQty, price: newPrice }]);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: "minQty" | "price", val: number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: val };
    setTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim() || !name.trim()) {
      setError("Please fill out both SKU and Product Name");
      return;
    }

    const tierValidation = validateTiers(tiers);
    if (!tierValidation.valid) {
      setError(tierValidation.error || "Invalid tier configuration");
      return;
    }

    setSaving(true);
    try {
      const prodId = `prod_${Date.now()}`;
      const newProduct: WholesalerProduct = {
        id: prodId,
        sku: sku.trim(),
        name: name.trim(),
        nameAr: nameAr.trim() || name.trim(),
        category,
        basePrice,
        msrp,
        moq,
        unit,
        tiers,
        stock,
        status: "active",
        updatedAt: new Date().toISOString(),
      };

      await saveWholesalerProduct(wholesalerId, newProduct);

      // Reset form
      setSku("");
      setName("");
      setNameAr("");
      setTiers([
        { minQty: 10, price: 95 },
        { minQty: 50, price: 85 },
      ]);

      // Uncheck drawer toggle
      const checkbox = document.getElementById(drawerId) as HTMLInputElement | null;
      if (checkbox) checkbox.checked = false;

      onProductAdded();
    } catch (err: any) {
      setError(err?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] overflow-hidden shadow-sm">
      {/* Pure-CSS Checkbox Toggle */}
      <input
        type="checkbox"
        id={drawerId}
        className="peer/drawer hidden"
        aria-hidden="true"
      />

      {/* Header bar that serves as toggle */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
            <i className="bi bi-plus-circle" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
              {t.wholesaler.addProduct}
            </h4>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)]">
              Publish new volume inventory with custom quantity discount ladders.
            </p>
          </div>
        </div>

        <label
          htmlFor={drawerId}
          className="cursor-pointer select-none px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-glass-card-bg)] text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-all peer-checked/drawer:[&_.drawer-chevron]:rotate-180"
        >
          <span>{t.wholesaler.addProduct}</span>
          <i className="bi bi-chevron-down text-[10px] transition-transform duration-300 drawer-chevron" />
        </label>
      </div>

      {/* Collapsible Drawer Content */}
      <div className="max-h-0 peer-checked/drawer:max-h-[2000px] transition-all duration-500 ease-in-out overflow-hidden">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 bg-[var(--color-surface)]/60">
          {error && (
            <div className="p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)] flex items-center gap-2">
              <i className="bi bi-exclamation-triangle" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WH-TEE-101"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Name EN */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Product Title (EN) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Combed Egyptian Cotton Tee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Name AR */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Product Title (AR)
              </label>
              <input
                type="text"
                placeholder="اسم المنتج بالعربية"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoreCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {STORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat][isAr ? "ar" : "en"]}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Base Wholesale Price (EGP) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* MSRP */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Suggested Retail MSRP (EGP) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={msrp}
                onChange={(e) => setMsrp(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* MOQ */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Minimum Order Quantity (MOQ) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={moq}
                onChange={(e) => setMoq(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Packaging Unit */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Packaging Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="piece">Piece (قطعة)</option>
                <option value="pack">Pack (طقم / عبوة)</option>
                <option value="carton">Carton (كرتونة)</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Warehouse Available Stock *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Volume Tiers Ladder Editor */}
          <div className="pt-2 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="text-xs font-bold text-[var(--color-text-primary)]">
                  {t.wholesaler.tierEditor}
                </h5>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  Quantities must be strictly ascending; prices must be strictly descending.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] flex items-center gap-1 transition-all"
              >
                <i className="bi bi-plus-lg text-[10px]" />
                <span>{t.wholesaler.addTier}</span>
              </button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] w-14">
                    Tier {idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Min Qty:</span>
                    <input
                      type="number"
                      min={1}
                      value={tier.minQty}
                      onChange={(e) =>
                        handleTierChange(idx, "minQty", parseInt(e.target.value, 10))
                      }
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Unit Price:</span>
                    <input
                      type="number"
                      min={1}
                      value={tier.price}
                      onChange={(e) =>
                        handleTierChange(idx, "price", parseFloat(e.target.value))
                      }
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <span className="text-xs text-[var(--color-text-muted)]">EGP</span>
                  </div>

                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="text-xs text-[var(--color-status-red)] hover:opacity-80 px-2 py-1"
                      title={t.wholesaler.removeTier}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[var(--color-border-subtle)]">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[var(--gradient-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving Product..." : t.wholesaler.addProduct}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

