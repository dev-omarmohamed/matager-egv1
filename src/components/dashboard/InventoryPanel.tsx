"use client";

import React, { useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import type { CrudFieldConfig } from "./DashboardCrudModal";
import { Panel } from "./ui/Panel";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput } from "./ui/SearchInput";
import { SettingRow } from "./ui/Switch";
import { btnPrimary, btnIcon, btnIconDanger, divider } from "./ui/styles";
import { ProductWizardModal } from "./ProductWizardModal";

type StockFilter = "all" | "low" | "out";
const CAPACITY = 500;

export const InventoryPanel: React.FC<{ externalFilter?: string }> = ({ externalFilter = "" }) => {
  const { t, tr } = useDash();
  const { products, addProduct, editProduct, removeProduct, uid } = useStoreOwnerData();
  const { openCrudModal, closeCrudModal } = useDashboardModal();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  const lowStock = products.filter((p) => p.stockQty > 0 && p.stockQty < 5).length;
  const depleted = products.filter((p) => p.stockQty <= 0).length;
  const usagePct = products.length > 0 ? Math.min(100, Math.round((products.length / CAPACITY) * 100)) : 0;

  const needle = (search || externalFilter).toLowerCase();
  const list = products.filter((p) => {
    const hit = !needle || p.name.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle);
    const stock = filter === "all" || (filter === "low" ? p.stockQty > 0 && p.stockQty < 5 : p.stockQty <= 0);
    return hit && stock;
  });

  const productFields = (placeholders: boolean): CrudFieldConfig[] => [
    { name: "name", label: tr("Product Name", "اسم المنتج"), required: true, placeholder: placeholders ? "e.g. Classic Cotton Hoodie" : undefined },
    { name: "sku", label: tr("SKU", "رمز المنتج (SKU)"), placeholder: placeholders ? "e.g. SKU-HD-001" : undefined },
    {
      name: "category",
      label: tr("Category", "التصنيف"),
      type: "select",
      defaultValue: "Apparel",
      options: [
        { label: tr("Apparel", "ملابس وأزياء"), value: "Apparel" },
        { label: tr("Footwear", "أحذية"), value: "Footwear" },
        { label: tr("Electronics", "إلكترونيات"), value: "Electronics" },
        { label: tr("Food & Beverage", "مأكولات ومشروبات"), value: "Food & Beverage" },
        { label: tr("Jewelry & Accessories", "إكسسوارات ومجوهرات"), value: "Jewelry & Accessories" },
        { label: tr("General", "أخرى"), value: "General" },
      ],
    },
    { name: "price", label: tr("Price (EGP)", "السعر (ج.م)"), type: "number", required: true, placeholder: placeholders ? "450" : undefined },
    { name: "stockQty", label: tr("Stock Quantity", "الكمية المتاحة في المخزن"), type: "number", required: true, placeholder: placeholders ? "25" : undefined },
    { name: "image", label: tr("Image URL (optional)", "رابط صورة المنتج (اختياري)"), placeholder: "https://..." },
  ];

  const openAdd = () =>
    openCrudModal({
      mode: "create",
      entity: "product",
      title: tr("Add New Product", "إضافة منتج جديد"),
      description: tr(
        "Complete the 3-step wizard to configure your product, variants, and channels.",
        "أكمل المعالج المكون من 3 خطوات لتكوين منتجك ومتغيراته وقنوات البيع."
      ),
      hideFooter: true,
      children: (
        <ProductWizardModal
          targetUid={uid || "A3ireYsqqIMJ5ORmeRxuWeg1EqM2"}
          onClose={closeCrudModal}
          onSaved={async (newProd) => {
            await addProduct(newProd);
          }}
        />
      ),
    });

  const openEdit = (p: any) =>
    openCrudModal({
      mode: "edit",
      entity: "product",
      title: tr(`Edit Product: ${p.name}`, `تعديل منتج: ${p.name}`),
      initialData: { name: p.name, sku: p.sku, category: p.category, price: p.price, stockQty: p.stockQty, image: p.image },
      fields: productFields(false),
      onSubmit: async (d) => {
        await editProduct(p.id, {
          name: d.name,
          sku: d.sku,
          category: d.category,
          price: Number(d.price) || p.price,
          stockQty: Number(d.stockQty) || p.stockQty,
          image: d.image,
        });
      },
    });

  const openDelete = (p: any) =>
    openCrudModal({
      mode: "delete",
      entity: "product",
      title: tr(`Confirm Deleting ${p.name}`, `تأكيد حذف المنتج ${p.name}`),
      initialData: { id: p.id, name: `${p.name} (${p.sku})` },
      onDelete: async () => {
        await removeProduct(p.id);
      },
    });

  const toggle = (f: StockFilter) => setFilter((cur) => (cur === f ? "all" : f));

  return (
    <Panel
      title={t.inventory.title}
      subtitle={t.inventory.subtitle}
      icon="bi-box-seam"
      badge={products.length}
      toggleLabel={t.inventory.tabLive}
      actions={
        <button type="button" onClick={openAdd} className={btnPrimary} aria-label={tr("Add Product", "إضافة منتج")}>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          <span className="hidden sm:inline">{tr("Add Product", "إضافة منتج")}</span>
        </button>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        {/* Continuous Collapsed-Border KPI Strip */}
        <div className="rounded-[20px] overflow-hidden w-full glass-panel border border-[var(--color-glass-card-border)] bg-[var(--color-glass-card-bg)] shadow-[var(--shadow-glass-card)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 w-full">
            {/* Tile 0: Total Capacity */}
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`relative border border-[var(--color-border-subtle)] rounded-none p-3.5 sm:p-4 flex flex-col justify-between gap-3 text-start transition-colors duration-150 hover:bg-[var(--color-surface-elevated)]/40 cursor-pointer focus:outline-none ${
                filter === "all" ? "bg-[var(--color-surface-elevated)]/70 z-10 ring-1 ring-[var(--color-primary-light)]/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                  {tr("Total Capacity", "السعة الإجمالية")}
                </span>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-primary-light)]">
                  <i className="bi bi-hdd-stack text-xs" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] font-ui tracking-tight">
                  {products.length} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ {CAPACITY}</span>
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-green)] font-ui">
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                  {usagePct}%
                </span>
              </div>
            </button>

            {/* Tile 1 (-ms-px): Low Stock */}
            <button
              type="button"
              onClick={() => toggle("low")}
              className={`-ms-px relative border border-[var(--color-border-subtle)] rounded-none p-3.5 sm:p-4 flex flex-col justify-between gap-3 text-start transition-colors duration-150 hover:bg-[var(--color-surface-elevated)]/40 cursor-pointer focus:outline-none ${
                filter === "low" ? "bg-[var(--color-surface-elevated)]/70 z-10 ring-1 ring-[var(--color-status-amber)]/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                  {tr("Low Stock", "مخزون منخفض")}
                </span>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-status-amber)]">
                  <i className="bi bi-exclamation-triangle text-xs" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] font-ui tracking-tight">
                  {lowStock}
                </span>
                {lowStock > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-amber)] font-ui">
                    <i className="bi bi-arrow-down-right" aria-hidden="true" />
                    -{lowStock}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-green)] font-ui">
                    <i className="bi bi-check2" aria-hidden="true" />
                    0
                  </span>
                )}
              </div>
            </button>

            {/* Tile 2 (-mt-px lg:mt-0 lg:-ms-px): Out of Stock */}
            <button
              type="button"
              onClick={() => toggle("out")}
              className={`-mt-px lg:mt-0 lg:-ms-px relative border border-[var(--color-border-subtle)] rounded-none p-3.5 sm:p-4 flex flex-col justify-between gap-3 text-start transition-colors duration-150 hover:bg-[var(--color-surface-elevated)]/40 cursor-pointer focus:outline-none ${
                filter === "out" ? "bg-[var(--color-surface-elevated)]/70 z-10 ring-1 ring-[var(--color-status-red)]/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                  {tr("Out of Stock", "نفد المخزون")}
                </span>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-status-red)]">
                  <i className="bi bi-x-octagon text-xs" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] font-ui tracking-tight">
                  {depleted}
                </span>
                {depleted > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-red)] font-ui">
                    <i className="bi bi-arrow-down-right" aria-hidden="true" />
                    -{depleted}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-green)] font-ui">
                    <i className="bi bi-check2" aria-hidden="true" />
                    0
                  </span>
                )}
              </div>
            </button>

            {/* Tile 3 (-ms-px -mt-px lg:mt-0): Total Products */}
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`-ms-px -mt-px lg:mt-0 relative border border-[var(--color-border-subtle)] rounded-none p-3.5 sm:p-4 flex flex-col justify-between gap-3 text-start transition-colors duration-150 hover:bg-[var(--color-surface-elevated)]/40 cursor-pointer focus:outline-none ${
                filter === "all" ? "bg-[var(--color-surface-elevated)]/70 z-10 ring-1 ring-[var(--color-primary-light)]/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                  {tr("Total Products", "إجمالي المنتجات")}
                </span>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-status-blue)]">
                  <i className="bi bi-box-seam text-xs" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] font-ui tracking-tight">
                  {products.length}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--color-status-green)] font-ui">
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                  +100%
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Plan capacity */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[var(--color-text-muted)] font-subtitle">{t.inventory.capacity.usageLabel}</span>
            <span className="font-bold text-[var(--color-status-blue)]">
              {products.length} / {CAPACITY} · {usagePct}%
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden bg-[var(--color-surface-elevated)] border ${divider}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] transition-[width] duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder={t.inventory.liveList.searchPlaceholder} className="sm:max-w-sm" />

        {/* Product list */}
        <div className={`rounded-xl border ${divider} overflow-hidden`}>
          {list.length === 0 ? (
            <EmptyState
              icon="bi-box-seam"
              title={tr("No products yet", "لا توجد منتجات بعد")}
              desc={tr("Add your first item to start selling.", "أضف أول منتج لتبدأ البيع.")}
              action={
                products.length === 0 ? (
                  <button type="button" onClick={openAdd} className={btnPrimary}>
                    <i className="bi bi-plus-circle" aria-hidden="true" />
                    {tr("Add Product", "إضافة منتج")}
                  </button>
                ) : undefined
              }
            />
          ) : (
            <ul className={`divide-y ${divider} max-h-[420px] overflow-y-auto custom-scrollbar`}>
              {list.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
                  <span className="hidden min-[380px]:flex w-9 h-9 rounded-lg shrink-0 items-center justify-center overflow-hidden bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <i className="bi bi-box-seam" aria-hidden="true" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      <span dir="ltr">{p.sku}</span> · {p.category}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {p.price} <span className="text-[9px] font-normal text-[var(--color-text-muted)]">{p.currency}</span>
                    </span>
                    <StatusPill variant={p.statusVariant}>{p.stockText}</StatusPill>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => openEdit(p)} className={btnIcon} aria-label={tr("Edit", "تعديل")}>
                      <i className="bi bi-pencil" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => openDelete(p)} className={btnIconDanger} aria-label={tr("Delete", "حذف")}>
                      <i className="bi bi-trash3" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SettingRow
          title={t.inventory.settings.showOutOfStock}
          desc={t.inventory.settings.showOutOfStockDesc}
          checked={showOutOfStock}
          onChange={setShowOutOfStock}
        />
      </div>
    </Panel>
  );
};
