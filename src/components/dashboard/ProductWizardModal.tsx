"use client";

import React, { useState, useEffect, useId } from "react";
import { useDash } from "@/lib/useDash";
import { rtdb } from "@/lib/firebase";
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet, update as rtdbUpdate } from "firebase/database";
import { inputCls, btnPrimary, btnGhost, btnIconDanger, divider, focusRing, eyebrow } from "./ui/styles";

export interface ProductVariant {
  id: string;
  attribute: string; // Size or Dimensions
  color: string;
  price?: number | string;
  imageUrl?: string;
}

export interface ProductWizardData {
  name: string;
  brand: string;
  price: number;
  stockQty: number;
  sellingChannel: "both" | "pos" | "storefront";
  baseCategory: string;
  subCategory: string;
  images: string[];
  variants: ProductVariant[];
  notes: string;
  freeDelivery: boolean;
  attachedManual?: string;
}

interface ProductWizardModalProps {
  initialData?: Partial<ProductWizardData>;
  targetUid?: string;
  onClose: () => void;
  onSaved: (product: any) => Promise<void> | void;
}

const DEFAULT_BASE_CATEGORIES = [
  "Clothing & Fashion",
  "Home Appliances",
  "Electronics",
  "Footwear",
  "Jewelry & Accessories",
  "Food & Beverage",
  "General",
];

const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
  "Clothing & Fashion": ["T-shirts", "Hoodies & Sweatshirts", "Pants & Trousers", "Jackets", "Dresses"],
  "Home Appliances": ["Refrigerators", "Washing Machines", "Microwaves", "Blenders", "Air Conditioners"],
  "Electronics": ["Smartphones", "Laptops", "Audio & Headphones", "Accessories"],
  "Footwear": ["Sneakers", "Formal Shoes", "Boots", "Sandals"],
  "Jewelry & Accessories": ["Watches", "Necklaces", "Rings", "Bags"],
  "Food & Beverage": ["Snacks", "Coffee & Tea", "Cold Drinks"],
  "General": ["Standard Products"],
};

export const ProductWizardModal: React.FC<ProductWizardModalProps> = ({
  initialData,
  targetUid = "A3ireYsqqIMJ5ORmeRxuWeg1EqM2",
  onClose,
  onSaved,
}) => {
  const { tr, isRtl } = useDash();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Step 1 Form State ──
  const [name, setName] = useState(initialData?.name || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [price, setPrice] = useState<number | string>(initialData?.price ?? "");
  const [stockQty, setStockQty] = useState<number | string>(initialData?.stockQty ?? "");
  const [sellingChannel, setSellingChannel] = useState<"both" | "pos" | "storefront">(
    initialData?.sellingChannel || "both"
  );

  // Category State
  const [baseCategories, setBaseCategories] = useState<string[]>(DEFAULT_BASE_CATEGORIES);
  const [baseCategory, setBaseCategory] = useState<string>(
    initialData?.baseCategory || "Clothing & Fashion"
  );
  const [subCategories, setSubCategories] = useState<string[]>(
    DEFAULT_SUBCATEGORIES["Clothing & Fashion"] || []
  );
  const [subCategory, setSubCategory] = useState<string>(initialData?.subCategory || "T-shirts");

  // Inline "+ Add New" subcategory UI
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");
  const [isSavingSubCategory, setIsSavingSubCategory] = useState(false);

  // ── Step 2 Form State ──
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [
      { id: "v1", attribute: "M", color: "Black", price: "", imageUrl: "" },
    ]
  );

  // ── Step 3 Form State ──
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [freeDelivery, setFreeDelivery] = useState(initialData?.freeDelivery || false);
  const [attachedManual, setAttachedManual] = useState<string>(initialData?.attachedManual || "");

  // ── Fetch Base Categories & Subcategories from RTDB on mount ──
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!rtdb) return;
      try {
        // 1. Fetch base category from A3ireYsqqIMJ5ORmeRxuWeg1EqM2/storeconfig/category
        const baseRef = rtdbRef(rtdb, `${targetUid}/storeconfig/category`);
        const baseSnap = await rtdbGet(baseRef);
        if (alive && baseSnap.exists()) {
          const val = baseSnap.val();
          if (Array.isArray(val) && val.length > 0) {
            setBaseCategories(val);
            if (!initialData?.baseCategory) setBaseCategory(val[0]);
          } else if (typeof val === "string") {
            setBaseCategories((prev) => (prev.includes(val) ? prev : [val, ...prev]));
            if (!initialData?.baseCategory) setBaseCategory(val);
          }
        }

        // 2. Fetch saved subcategories
        const subRef = rtdbRef(rtdb, `${targetUid}/storeconfig/subcategories`);
        const subSnap = await rtdbGet(subRef);
        if (alive && subSnap.exists()) {
          const savedSubs = subSnap.val();
          if (typeof savedSubs === "object" && savedSubs !== null) {
            if (Array.isArray(savedSubs)) {
              setSubCategories((prev) => Array.from(new Set([...prev, ...savedSubs])));
            } else {
              const merged = Object.values(savedSubs).flat() as string[];
              setSubCategories((prev) => Array.from(new Set([...prev, ...merged])));
            }
          }
        }
      } catch (err) {
        console.warn("RTDB Category fetch warning:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [targetUid, initialData?.baseCategory]);

  // Update available subcategories when base category changes
  useEffect(() => {
    const defaults = DEFAULT_SUBCATEGORIES[baseCategory] || ["General"];
    setSubCategories((prev) => Array.from(new Set([...defaults, ...prev])));
    if (!subCategory || !defaults.includes(subCategory)) {
      setSubCategory(defaults[0] || "General");
    }
  }, [baseCategory]);

  // Determine if category uses Size vs Dimensions
  const isClothing =
    baseCategory.toLowerCase().includes("clothing") ||
    baseCategory.toLowerCase().includes("fashion") ||
    baseCategory.toLowerCase().includes("apparel");

  const isAppliances =
    baseCategory.toLowerCase().includes("appliance") ||
    baseCategory.toLowerCase().includes("home") ||
    baseCategory.toLowerCase().includes("electronic");

  const attributeLabel = isClothing
    ? tr("Size (e.g. S, M, L, XL)", "المقاس (مثل S, M, L, XL)")
    : isAppliances
    ? tr("Dimensions (e.g. 200x90cm)", "الأبعاد (مثل 200x90 سم)")
    : tr("Size / Dimensions", "المقاس أو الأبعاد");

  const defaultAttributeValue = isClothing ? "M" : isAppliances ? "200x90cm" : "Standard";

  // ── Handler: Add New Sub-Category & Sync to RTDB ──
  const handleAddNewSubCategory = async () => {
    const trimmed = newSubCategoryInput.trim();
    if (!trimmed) return;
    setIsSavingSubCategory(true);
    try {
      const updated = Array.from(new Set([...subCategories, trimmed]));
      setSubCategories(updated);
      setSubCategory(trimmed);
      setNewSubCategoryInput("");
      setIsAddingSubCategory(false);

      if (rtdb) {
        // Save to RTDB path so it persists for future uploads
        const subRef = rtdbRef(rtdb, `${targetUid}/storeconfig/subcategories`);
        await rtdbSet(subRef, updated);
        const storeSubRef = rtdbRef(rtdb, `stores/${targetUid}/storeconfig/subcategories`);
        await rtdbSet(storeSubRef, updated);
      }
    } catch (err) {
      console.warn("Error saving subcategory:", err);
    } finally {
      setIsSavingSubCategory(false);
    }
  };

  // ── Handler: Add Media Image ──
  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Handler: Manage Variant Rows ──
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        attribute: defaultAttributeValue,
        color: "Black",
        price: "",
        imageUrl: images[0] || "",
      },
    ]);
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // ── Validation & Step Navigation ──
  const handleNextStep1 = () => {
    if (!name.trim()) {
      setErrorMessage(tr("Product Name is required.", "اسم المنتج مطلوب."));
      return;
    }
    if (price === "" || Number(price) <= 0) {
      setErrorMessage(tr("Please provide a valid price.", "يرجى إدخال سعر صحيح."));
      return;
    }
    if (stockQty === "" || Number(stockQty) < 0) {
      setErrorMessage(tr("Please provide a valid stock quantity.", "يرجى إدخال كمية مخزون صحيحة."));
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    setErrorMessage(null);
    setStep(3);
  };

  // ── Final Save: Synchronize with RTDB Paths ──
  const handleFinalSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const prodId = `prod_${Date.now()}`;
    const primaryImage =
      images[0] ||
      (isClothing
        ? "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg"
        : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80");

    const categoryFull = `${baseCategory} > ${subCategory}`;

    const newProductPayload = {
      id: prodId,
      name: name.trim(),
      brand: brand.trim(),
      price: Number(price),
      currency: "EGP",
      stockQty: Number(stockQty),
      stockText: `${stockQty} in Stock`,
      sellingChannel,
      baseCategory,
      subCategory,
      category: categoryFull,
      images,
      image: primaryImage,
      variants,
      notes,
      freeDelivery,
      attachedManual,
      created_at: new Date().toISOString(),
      statusVariant: Number(stockQty) > 5 ? "success" : Number(stockQty) > 0 ? "pending" : "danger",
    };

    try {
      if (rtdb) {
        // 1. Save chosen category to A3ireYsqqIMJ5ORmeRxuWeg1EqM2/products/category
        const catRef = rtdbRef(rtdb, `${targetUid}/products/category`);
        await rtdbUpdate(catRef, { [prodId]: categoryFull });

        // 2. Save full product to A3ireYsqqIMJ5ORmeRxuWeg1EqM2/products/<prodId>
        const prodRef = rtdbRef(rtdb, `${targetUid}/products/${prodId}`);
        await rtdbSet(prodRef, newProductPayload);

        // 3. Mirror to stores/<targetUid>/products/<prodId> for cross-app synchronization
        const storeProdRef = rtdbRef(rtdb, `stores/${targetUid}/products/${prodId}`);
        await rtdbSet(storeProdRef, newProductPayload);
      }

      await onSaved(newProductPayload);
      onClose();
    } catch (err: any) {
      console.error("Error creating product:", err);
      setErrorMessage(err?.message || tr("Failed to save product.", "فشل في حفظ المنتج."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden h-full">
      {/* ─── STATIC DOCKED SUB-HEADER: 3-STEP PROGRESS STEPPER ─── */}
      <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: tr("1. Basic Attributes", "١. البيانات الأساسية"), icon: "bi-card-list" },
            { num: 2, label: tr("2. Media & Variants", "٢. الوسائط والمتغيرات"), icon: "bi-layers" },
            { num: 3, label: tr("3. Settings", "٣. الإعدادات"), icon: "bi-sliders" },
          ].map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num as any);
                }}
                disabled={s.num > step}
                className={`flex items-center gap-1.5 text-xs font-bold font-ui transition-colors ${
                  isCurrent
                    ? "text-[var(--color-primary-light)]"
                    : isDone
                    ? "text-[var(--color-status-green)] cursor-pointer"
                    : "text-[var(--color-text-muted)] opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-[var(--color-primary-light)] text-white shadow-sm"
                      : isDone
                      ? "bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)]"
                      : "bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]"
                  }`}
                >
                  {isDone ? <i className="bi bi-check2 text-xs" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── SCROLLABLE INNER BODY ─── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4 custom-scrollbar">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-xl flex items-center gap-2 text-xs bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-[var(--color-status-red)]"
          >
            <i className="bi bi-exclamation-circle shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

      {/* ─── STEP 1: BASIC ATTRIBUTES & CATEGORY LOGIC ─── */}
      {step === 1 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
              {tr("Product Name", "اسم المنتج")} <span className="text-[var(--color-status-red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr("e.g. Classic Oversized Cotton Hoodie", "مثال: هودي قطني كلاسيكي")}
              required
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                {tr("Brand Name (Optional)", "اسم الماركة (اختياري)")}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={tr("e.g. Matager Collection", "مثال: تشكيلة متاجر")}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                {tr("Price (EGP)", "السعر (ج.م)")} <span className="text-[var(--color-status-red)]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="450"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                {tr("Stock Quantity", "كمية المخزون")} <span className="text-[var(--color-status-red)]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="50"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Selling Channel Radio Buttons */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1.5">
              {tr("Selling Channel", "قناة البيع")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "both", label: tr("Both (POS & Storefront)", "كلاهما (الكاشير والمتجر)"), icon: "bi-shop" },
                { id: "pos", label: tr("POS Only", "الكاشير فقط"), icon: "bi-pc-display" },
                { id: "storefront", label: tr("Storefront Only", "المتجر الإلكتروني فقط"), icon: "bi-globe" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSellingChannel(ch.id as any)}
                  className={`p-2.5 rounded-xl border text-start transition-all ${
                    sellingChannel === ch.id
                      ? "bg-[var(--color-primary-light)]/10 border-[var(--color-primary-light)] text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary-light)]/40"
                      : "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <i className={`bi ${ch.icon} text-sm mb-1 block`} />
                  <span className="text-xs font-bold block">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Section: Read-only Base Category + Sub-Category with "+ Add New" */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className={eyebrow}>{tr("Category Architecture", "هيكلية التصنيف")}</span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                {targetUid.slice(0, 10)}...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Base Category (Read-Only) */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                  {tr("Base Category (Read-Only)", "التصنيف الرئيسي (للقراءة فقط)")}
                </label>
                <div className="relative">
                  <select
                    value={baseCategory}
                    onChange={(e) => setBaseCategory(e.target.value)}
                    className={`${inputCls} bg-[var(--color-surface)] border-[var(--color-border)] font-semibold`}
                  >
                    {baseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  {tr("Base category defined in store config.", "التصنيف الأساسي محدد في إعدادات المتجر.")}
                </p>
              </div>

              {/* Sub-Category with "+ Add New" */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[var(--color-text-primary)] font-subtitle">
                    {tr("Specific Item Sub-Category", "التصنيف الفرعي للمنتج")}
                  </label>
                  {!isAddingSubCategory && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSubCategory(true)}
                      className="text-[11px] font-bold text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
                    >
                      <i className="bi bi-plus" />
                      <span>{tr("+ Add New", "+ إضافة جديد")}</span>
                    </button>
                  )}
                </div>

                {isAddingSubCategory ? (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newSubCategoryInput}
                        onChange={(e) => setNewSubCategoryInput(e.target.value)}
                        placeholder={tr("e.g. T-shirts or Blenders", "مثال: تيشرتات أو خلاطات")}
                        className={inputCls}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewSubCategory}
                        disabled={isSavingSubCategory || !newSubCategoryInput.trim()}
                        className={`${btnPrimary} !px-3 shrink-0`}
                      >
                        {isSavingSubCategory ? <i className="bi bi-arrow-repeat animate-spin" /> : tr("Save", "حفظ")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSubCategory(false);
                          setNewSubCategoryInput("");
                        }}
                        className={`${btnGhost} !px-2.5 shrink-0`}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {tr("Saves to RTDB for future uploads.", "يتم حفظه في قاعدة البيانات لعمليات الرفع المستقبلية.")}
                    </p>
                  </div>
                ) : (
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className={inputCls}
                  >
                    {subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: MEDIA & DYNAMIC VARIANTS ─── */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Media Uploader */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3">
            <span className={eyebrow}>{tr("Product Media Gallery", "معرض صور المنتج")}</span>

            {/* URL input or drag-drop */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder={tr("Paste image URL (https://...)", "الصق رابط الصورة (https://...)")}
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={!imageUrlInput.trim()}
                className={`${btnPrimary} shrink-0`}
              >
                <i className="bi bi-plus-lg" />
                <span>{tr("Add Image", "إضافة")}</span>
              </button>
            </div>

            {/* Thumbnail previews */}
            {images.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border-subtle)] group bg-[var(--color-surface)]"
                  >
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 end-1 w-5 h-5 rounded-full bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="bi bi-x text-xs" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-bold py-0.5">
                        {tr("Main", "الرئيسية")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl p-4 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                <i className="bi bi-cloud-arrow-up text-xl text-[var(--color-primary-light)] block mb-1" />
                <p className="font-semibold text-[var(--color-text-secondary)]">
                  {tr("Add product images via URL above", "أضف روابط صور المنتج أعلاه")}
                </p>
                <p className="text-[10px]">
                  {tr("Images will be linked to variants below.", "يمكنك ربط الصور بمتغيرات المقاس واللون أدناه.")}
                </p>
              </div>
            )}
          </div>

          {/* Dynamic Variant Builder */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={eyebrow}>{tr("Dynamic Variant Builder", "منشئ المتغيرات الديناميكي")}</span>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {isClothing
                    ? tr("Configured for Apparel (Size & Color)", "مُهيأ للملابس (المقاس واللون)")
                    : isAppliances
                    ? tr("Configured for Appliances (Dimensions & Color)", "مُهيأ للأجهزة (الأبعاد واللون)")
                    : tr("Configured for General Products", "مُهيأ للمنتجات العامة")}
                </p>
              </div>
              <button type="button" onClick={handleAddVariant} className={`${btnGhost} !px-2.5 !py-1 text-xs`}>
                <i className="bi bi-plus-circle text-[var(--color-primary-light)]" />
                <span>{tr("+ Add Variant", "+ إضافة متغير")}</span>
              </button>
            </div>

            {/* Variant Rows Table */}
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] grid grid-cols-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto] gap-2 items-center"
                >
                  {/* Size / Dimension */}
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] mb-0.5">
                      {attributeLabel}
                    </span>
                    {isClothing ? (
                      <select
                        value={v.attribute}
                        onChange={(e) => handleUpdateVariant(v.id, "attribute", e.target.value)}
                        className={`${inputCls} !py-1.5 !text-xs`}
                      >
                        {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={v.attribute}
                        onChange={(e) => handleUpdateVariant(v.id, "attribute", e.target.value)}
                        placeholder={isAppliances ? "200x90cm" : "Standard"}
                        className={`${inputCls} !py-1.5 !text-xs`}
                      />
                    )}
                  </div>

                  {/* Color */}
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] mb-0.5">
                      {tr("Color", "اللون")}
                    </span>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleUpdateVariant(v.id, "color", e.target.value)}
                      placeholder={tr("e.g. Navy Blue", "مثال: أزرق داكن")}
                      className={`${inputCls} !py-1.5 !text-xs`}
                    />
                  </div>

                  {/* Custom Price (optional) */}
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] mb-0.5">
                      {tr("Price (Opt)", "السعر (اختياري)")}
                    </span>
                    <input
                      type="number"
                      value={v.price ?? ""}
                      onChange={(e) => handleUpdateVariant(v.id, "price", e.target.value)}
                      placeholder={String(price || "450")}
                      className={`${inputCls} !py-1.5 !text-xs`}
                    />
                  </div>

                  {/* Link Image Dropdown */}
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] mb-0.5">
                      {tr("Link Image", "ربط بالصورة")}
                    </span>
                    <select
                      value={v.imageUrl || ""}
                      onChange={(e) => handleUpdateVariant(v.id, "imageUrl", e.target.value)}
                      className={`${inputCls} !py-1.5 !text-xs`}
                    >
                      <option value="">{tr("None (Default)", "بدون (الرئيسية)")}</option>
                      {images.map((img, imgIdx) => (
                        <option key={imgIdx} value={img}>
                          {tr(`Image #${imgIdx + 1}`, `صورة رقم ${imgIdx + 1}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delete button */}
                  <div className="flex sm:justify-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      disabled={variants.length <= 1}
                      className={btnIconDanger}
                      aria-label="Delete variant"
                    >
                      <i className="bi bi-trash3 text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: ATTACHMENTS & SETTINGS ─── */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
              {tr("Notes / Special Instructions", "ملاحظات أو تعليمات خاصة")}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tr(
                "e.g. Wash at 30°C. Made from 100% Egyptian cotton.",
                "مثال: يُغسل على درجة حرارة 30. مصنوع من قطن مصري 100%."
              )}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Checkbox: Free Delivery */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)] shrink-0">
                <i className="bi bi-truck text-sm" />
              </span>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  {tr("Offer Free Delivery on this item", "توفير شحن وتوصيل مجاني لهذا المنتج")}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {tr("Item will show a Free Delivery badge on the storefront.", "سيظهر وسام التوصيل المجاني على صفحة المتجر.")}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={freeDelivery}
              onChange={(e) => setFreeDelivery(e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--color-primary-light)] cursor-pointer"
            />
          </div>

          {/* Attach Size Chart / Manual Button Placeholder */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="bi bi-file-earmark-pdf text-base text-[var(--color-primary-light)]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  {tr("Attach Size Chart / Manual", "إرفاق دليل المقاسات أو الكتالوج")}
                </span>
              </div>
              {attachedManual ? (
                <span className="text-xs font-mono text-[var(--color-status-green)] flex items-center gap-1">
                  <i className="bi bi-check-circle-fill text-[11px]" />
                  <span>{attachedManual}</span>
                </span>
              ) : null}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={attachedManual}
                onChange={(e) => setAttachedManual(e.target.value)}
                placeholder={tr("e.g. Size-Chart-2026.pdf or User-Manual.pdf", "مثال: دليل-المقاسات-2026.pdf")}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => {
                  if (!attachedManual) setAttachedManual("Size-Chart-Standard.pdf");
                }}
                className={`${btnGhost} shrink-0`}
              >
                <i className="bi bi-paperclip" />
                <span>{tr("Attach File", "إرفاق")}</span>
              </button>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              {tr("Customers can view and download this manual directly on the storefront.", "يمكن للعملاء استعراض وتنزيل هذا الدليل مباشرة من واجهة المتجر.")}
            </p>
          </div>

          {/* Summary Preview */}
          <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">{tr("Target RTDB Category Node:", "مسار التصنيف في RTDB:")}</span>
              <span className="font-mono font-bold text-[var(--color-primary-light)]">
                {targetUid}/products/category
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">{tr("Selected Classification:", "التصنيف المختار:")}</span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {baseCategory} &gt; {subCategory}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">{tr("Variants Created:", "المتغيرات المنشأة:")}</span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {variants.length} {tr("rows", "خيارات")}
              </span>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ─── STATIC DOCKED FOOTER: ACTIONS ─── */}
      <div className="px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between gap-2 shrink-0 sticky bottom-0 z-10">
        {step === 1 && (
          <>
            <button type="button" onClick={onClose} className={btnGhost}>
              {tr("Cancel", "إلغاء")}
            </button>
            <button type="button" onClick={handleNextStep1} className={btnPrimary}>
              <span>{tr("Next: Media & Variants", "التالي: الوسائط والمتغيرات")}</span>
              <i className={`bi ${isRtl ? "bi-arrow-left" : "bi-arrow-right"}`} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button type="button" onClick={() => setStep(1)} className={btnGhost}>
              <i className={`bi ${isRtl ? "bi-arrow-right" : "bi-arrow-left"}`} />
              <span>{tr("Back: Step 1", "الرجوع: الخطوة ١")}</span>
            </button>
            <button type="button" onClick={handleNextStep2} className={btnPrimary}>
              <span>{tr("Next: Settings", "التالي: الإعدادات")}</span>
              <i className={`bi ${isRtl ? "bi-arrow-left" : "bi-arrow-right"}`} />
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <button type="button" onClick={() => setStep(2)} disabled={isSubmitting} className={btnGhost}>
              <i className={`bi ${isRtl ? "bi-arrow-right" : "bi-arrow-left"}`} />
              <span>{tr("Back: Step 2", "الرجوع: الخطوة ٢")}</span>
            </button>
            <button type="button" onClick={handleFinalSubmit} disabled={isSubmitting} className={btnPrimary}>
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin" />
                  <span>{tr("Saving Product...", "جاري حفظ المنتج...")}</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle" />
                  <span>{tr("Publish Product", "حفظ ونشر المنتج")}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
