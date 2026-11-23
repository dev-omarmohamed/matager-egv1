"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { PlusCircle, Search, Edit, Trash2, Package } from "lucide-react";

export const InventoryPanel: React.FC = () => {
  const { t, locale, dir } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { products, addProduct, editProduct, removeProduct } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleOpenAddProduct = () => {
    openCrudModal({
      mode: "create",
      entity: "product",
      title: isRtl ? "إضافة منتج جديد" : "Add New Product",
      fields: [
        { name: "name", label: isRtl ? "اسم المنتج" : "Product Name", required: true, placeholder: "e.g. Classic Cotton Hoodie" },
        { name: "sku", label: isRtl ? "رمز المنتج (SKU)" : "SKU", placeholder: "e.g. SKU-HD-001" },
        {
          name: "category",
          label: isRtl ? "التصنيف" : "Category",
          type: "select",
          defaultValue: "Apparel",
          options: [
            { label: isRtl ? "ملابس وأزياء" : "Apparel", value: "Apparel" },
            { label: isRtl ? "أحذية" : "Footwear", value: "Footwear" },
            { label: isRtl ? "إلكترونيات" : "Electronics", value: "Electronics" },
            { label: isRtl ? "مأكولات ومشروبات" : "Food & Beverage", value: "Food & Beverage" },
            { label: isRtl ? "إكسسوارات ومجوهرات" : "Jewelry & Accessories", value: "Jewelry & Accessories" },
            { label: isRtl ? "أخرى" : "General", value: "General" },
          ],
        },
        { name: "price", label: isRtl ? "السعر (ج.م)" : "Price (EGP)", type: "number", required: true, placeholder: "450" },
        { name: "stockQty", label: isRtl ? "الكمية المتاحة في المخزن" : "Stock Quantity", type: "number", required: true, placeholder: "25" },
        { name: "image", label: isRtl ? "رابط صورة المنتج (اختياري)" : "Image URL (Optional)", placeholder: "https://..." },
      ],
      onSubmit: async (data) => {
        await addProduct({
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: Number(data.price) || 0,
          currency: "EGP",
          stockQty: Number(data.stockQty) || 0,
          image: data.image || "",
        });
      },
    });
  };

  const handleOpenEditProduct = (p: any) => {
    openCrudModal({
      mode: "edit",
      entity: "product",
      title: isRtl ? `تعديل منتج: ${p.name}` : `Edit Product: ${p.name}`,
      initialData: {
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stockQty: p.stockQty,
        image: p.image,
      },
      fields: [
        { name: "name", label: isRtl ? "اسم المنتج" : "Product Name", required: true },
        { name: "sku", label: isRtl ? "رمز المنتج (SKU)" : "SKU" },
        {
          name: "category",
          label: isRtl ? "التصنيف" : "Category",
          type: "select",
          options: [
            { label: isRtl ? "ملابس وأزياء" : "Apparel", value: "Apparel" },
            { label: isRtl ? "أحذية" : "Footwear", value: "Footwear" },
            { label: isRtl ? "إلكترونيات" : "Electronics", value: "Electronics" },
            { label: isRtl ? "مأكولات ومشروبات" : "Food & Beverage", value: "Food & Beverage" },
            { label: isRtl ? "إكسسوارات ومجوهرات" : "Jewelry & Accessories", value: "Jewelry & Accessories" },
            { label: isRtl ? "أخرى" : "General", value: "General" },
          ],
        },
        { name: "price", label: isRtl ? "السعر (ج.م)" : "Price (EGP)", type: "number", required: true },
        { name: "stockQty", label: isRtl ? "الكمية المتاحة في المخزن" : "Stock Quantity", type: "number", required: true },
        { name: "image", label: isRtl ? "رابط الصورة" : "Image URL" },
      ],
      onSubmit: async (data) => {
        await editProduct(p.id, {
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: Number(data.price) || p.price,
          stockQty: Number(data.stockQty) || p.stockQty,
          image: data.image,
        });
      },
    });
  };

  const handleOpenDeleteProduct = (p: any) => {
    openCrudModal({
      mode: "delete",
      entity: "product",
      title: isRtl ? `تأكيد حذف المنتج ${p.name}` : `Confirm Deleting ${p.name}`,
      initialData: {
        id: p.id,
        name: `${p.name} (${p.sku})`,
      },
      onDelete: async () => {
        await removeProduct(p.id);
      },
    });
  };

  // Normalized metrics
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.stockQty > 0 && p.stockQty < 5).length;
  const depletedCount = products.filter((p) => p.stockQty <= 0).length;
  const usagePercentage = totalProductsCount > 0 ? Math.min(100, Math.round((totalProductsCount / 500) * 100)) : 0;

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      {/* 3 Pure-CSS Sub-tab Checkboxes */}
      <input type="checkbox" id="toggle-capacity" className="peer/capacity hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-live" className="peer/live hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-settings" className="peer/settings hidden" aria-hidden="true" />

      {/* Main Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
              {t.inventory.title}
            </h3>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              {t.inventory.subtitle}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            {totalProductsCount}
          </span>
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
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/capacity:max-h-[300px] bg-[var(--color-surface-elevated)]/30 border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                {t.inventory.capacity.title}
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold font-heading text-[var(--color-text-primary)]">
                  {totalProductsCount}
                </span>
                <StatusPill variant="info">{t.inventory.capacity.badge}</StatusPill>
              </div>
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="text-[var(--color-text-muted)] font-subtitle">
                  {t.inventory.capacity.usageLabel}
                </span>
                <span className="text-[var(--color-status-blue)] font-bold">
                  {usagePercentage}%
                </span>
              </div>
              <div className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded-lg text-[10px] font-bold font-ui hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{t.inventory.capacity.addNew}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-5 rtl:md:pl-0 rtl:md:pr-5">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
              {t.inventory.capacity.healthAlerts}
            </p>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-text-secondary)]">{t.inventory.capacity.draftProducts}</span>
              <span className="font-bold text-[var(--color-text-primary)]">0</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-status-amber)]">{t.inventory.capacity.lowStockAlert}</span>
              <span className="font-bold text-[var(--color-status-amber)]">{lowStockCount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)]/40 pb-2">
              <span className="text-[var(--color-status-red)]">{t.inventory.capacity.depletedStock}</span>
              <span className="font-bold text-[var(--color-status-red)]">{depletedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE PRODUCTS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/live:max-h-[350px] bg-[var(--color-surface-elevated)]/30 border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t.inventory.liveList.searchPlaceholder}
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-3 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded-lg text-[10px] font-bold font-ui hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-3 h-3" />
              <span>{isRtl ? "إضافة منتج" : "Add Product"}</span>
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--color-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Package className="w-5 h-5 text-[var(--color-text-muted)]" />
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">
                          {isRtl ? "لا توجد منتجات بعد" : "No products yet"}
                        </span>
                        <span className="text-[10px]">
                          {isRtl ? "اضغط على إضافة منتج للبدء" : "Click 'Add Product' to create your first item"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
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
                            <div className="w-7 h-7 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0">
                              <Package className="w-3.5 h-3.5" />
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
                          onClick={() => handleOpenEditProduct(p)}
                          className="w-6 h-6 inline-flex items-center justify-center rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary-light)] text-[var(--color-text-muted)] transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteProduct(p)}
                          className="w-6 h-6 inline-flex items-center justify-center rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-status-red)] hover:text-[var(--color-status-red)] text-[var(--color-text-muted)] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. STOCK SETTINGS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/settings:max-h-[300px] bg-[var(--color-surface-elevated)]/30">
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
        </div>
      </div>
    </div>
  );
};
