"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Ruler,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Truck,
  Sparkles,
  Store,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { StoreProduct, ProductColor } from "@/lib/store-registry";

interface ProductDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: StoreProduct | null;
  currency?: string;
  isAr?: boolean;
  onAddToCart: (product: StoreProduct, variant: { size: string; color: string }) => void;
  onQuickBuy: (product: StoreProduct, variant: { size: string; color: string }) => void;
}

export function ProductDetailSheet({
  isOpen,
  onClose,
  product,
  currency = "EGP",
  isAr = false,
  onAddToCart,
  onQuickBuy,
}: ProductDetailSheetProps) {
  // Variant states
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);
  const [isQuickLookOpen, setIsQuickLookOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Gallery images fallback
  const gallery = product?.gallery && product.gallery.length > 0
    ? product.gallery
    : product?.image
    ? [product.image]
    : [];

  // Colors fallback
  const colors: ProductColor[] = product?.colors && product.colors.length > 0
    ? product.colors
    : [
        { name: "White / Royal Blue", hex: "#f8fafc" },
        { name: "Onyx Black", hex: "#111827" },
        { name: "Forest Green", hex: "#166534" },
        { name: "Crimson Red", hex: "#991b1b" },
        { name: "Slate Navy", hex: "#1e3a8a" },
      ];

  // Sizes fallback
  const sizes = product?.sizes && product.sizes.length > 0
    ? product.sizes
    : ["XS", "S", "M", "L", "XL", "XXL"];

  // Reset or initialize state when product opens
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(colors[0]?.name || "Default");
      setSelectedSize(sizes[1] || sizes[0] || "Standard");
      setIsWishlisted(false);
      setShowSizeChart(false);
      setIsQuickLookOpen(false);
      setIsZoomed(false);
    }
  }, [product]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (showSizeChart) {
          setShowSizeChart(false);
        } else if (isQuickLookOpen) {
          setIsQuickLookOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showSizeChart, isQuickLookOpen, onClose]);

  if (!product) return null;

  // WhatsApp click handler
  const handleWhatsAppChat = () => {
    const phone = "201023456789"; // Merchant's WhatsApp line
    const textMessage = isAr
      ? `مرحباً ${product.storeName}، أود الاستفسار عن منتج "${product.title}" (${product.price} ${product.currency || currency}) - مقاس: ${selectedSize} ولون: ${selectedColor}. هل هو متوفر حالياً؟`
      : `Hello ${product.storeName}, I'm interested in "${product.title}" (${product.currency || currency} ${product.price.toLocaleString()}) - Size: ${selectedSize}, Color: ${selectedColor}. Is this item currently available?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const currentGalleryImage = gallery[activeImageIndex] || product.image;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10002] flex items-end justify-center pointer-events-auto">
            {/* Backdrop Blur Wash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10002]"
            />

            {/* Slide-Up Bottom Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative z-[10003] w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-[32px] sm:rounded-t-[36px] bg-[#121316] text-white border-t border-x border-white/15 shadow-2xl flex flex-col overflow-hidden"
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Drag Handle Top Indicator */}
              <div className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none shrink-0 bg-white/[0.02]">
                <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors" />
              </div>

              {/* Top Navigation & Close Actions */}
              <div className="px-5 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white/90 truncate max-w-[200px]">
                    {product.storeName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px]">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickLookOpen(true)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title={isAr ? "معاينة سريعة مكبرة" : "Quick Look Fullscreen"}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title={isAr ? "إغلاق" : "Close"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Sheet Content */}
              <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-none">
                {/* ═══════════ 1. SWIPEABLE IMAGE GALLERY ═══════════ */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 group">
                  <img
                    src={currentGalleryImage}
                    alt={product.title}
                    className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Discount Badge */}
                  {product.discountPercent ? (
                    <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-rose-600/30">
                      -{product.discountPercent}%
                    </span>
                  ) : product.badge ? (
                    <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-600/30">
                      {product.badge}
                    </span>
                  ) : null}

                  {/* Pagination Badge (e.g., 1/2) */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                    {activeImageIndex + 1}/{gallery.length}
                  </div>

                  {/* Quick Look Overlay Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsQuickLookOpen(true)}
                    className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg transition-transform hover:scale-105"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isAr ? "معاينة مكبرة" : "Quick Look"}</span>
                  </button>

                  {/* Gallery Slide Arrows */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? gallery.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === gallery.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Pagination Indicator Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                        {gallery.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`transition-all rounded-full ${
                              idx === activeImageIndex
                                ? "w-4 h-1.5 bg-blue-500"
                                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ═══════════ 2. PRODUCT INFO & PRICING ═══════════ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      {product.brand ? `${product.brand} · ${product.category}` : `${product.storeName} · ${product.category}`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>IN STOCK ({product.stock})</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {product.title}
                  </h2>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-3 pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">
                        {product.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-white/60">
                        {product.currency || currency}
                      </span>
                    </div>

                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-white/40 line-through">
                        {product.originalPrice.toLocaleString()} {product.currency || currency}
                      </span>
                    )}

                    {product.discountPercent && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold">
                        -{product.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-white/70 leading-relaxed pt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* ═══════════ 3. CHOOSE COLOR (+5) ═══════════ */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white/90">
                      {isAr ? "اختر اللون" : "Choose Color"}{" "}
                      <span className="text-blue-400">(+{colors.length})</span>
                    </span>
                    <span className="text-white/60 text-[11px] font-medium">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {colors.map((c) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all border ${
                            isSelected
                              ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500"
                              : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate">{c.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ═══════════ 4. CHOOSE SIZE (+5) & SIZE CHART ═══════════ */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white/90">
                      {isAr ? "اختر المقاس" : "Choose Size"}{" "}
                      <span className="text-blue-400">(+{sizes.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{isAr ? "دليل المقاسات" : "Size Chart"}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[48px] py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30"
                              : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:border-white/20"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ═══════════ 5. WHATSAPP CHAT INTEGRATION ═══════════ */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppChat}
                    className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 transition-all"
                  >
                    {/* Official WhatsApp Monogram SVG */}
                    <svg
                      className="w-4 h-4 fill-current shrink-0"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>
                      {isAr
                        ? "استفسر عن هذا المنتج - تحدث مع المتجر عبر واتساب"
                        : "Ask about this item - Chat with the store on WhatsApp"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                  </button>
                </div>

                {/* Value Props & Store Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-white/60">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <Truck className="w-4 h-4 mx-auto text-blue-400" />
                    <p className="font-bold text-white/80">Express Delivery</p>
                    <p>Within 24-48 Hours</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <ShieldCheck className="w-4 h-4 mx-auto text-emerald-400" />
                    <p className="font-bold text-white/80">Authentic 100%</p>
                    <p>Direct Store Node</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <RotateCcw className="w-4 h-4 mx-auto text-amber-400" />
                    <p className="font-bold text-white/80">14-Day Return</p>
                    <p>Easy Instant Exchange</p>
                  </div>
                </div>
              </div>

              {/* ═══════════ 6. STICKY BOTTOM ACTION BAR ═══════════ */}
              <div className="px-5 py-3.5 border-t border-white/10 bg-[#121316]/95 backdrop-blur-xl shrink-0 flex items-center gap-2.5">
                {/* Wishlist / Heart Button */}
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                    isWishlisted
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-500 scale-105"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-current text-rose-500" : ""}`}
                  />
                </button>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, { size: selectedSize, color: selectedColor });
                    onClose();
                  }}
                  className="flex-1 h-12 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/10 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <span>{isAr ? "إضافة إلى السلة" : "Add to Bag"}</span>
                </button>

                {/* Quick Buy Button */}
                <button
                  type="button"
                  onClick={() => {
                    onQuickBuy(product, { size: selectedSize, color: selectedColor });
                    onClose();
                  }}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                  <span>{isAr ? "شراء سريع" : "Quick Buy"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════ 7. SIZE CHART MODAL ══════════════════ */}
      <AnimatePresence>
        {showSizeChart && (
          <div className="fixed inset-0 z-[10015] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeChart(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/15 p-6 shadow-2xl text-white space-y-4 z-10"
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
                    {isAr ? "دليل المقاسات الرسمي" : "Official Size Chart (CM / Inches)"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/60">
                Measurements below represent garment dimensions. For an oversized relaxed fit, we recommend choosing one size up.
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5 font-bold">Size</th>
                      <th className="p-2.5">Chest (cm)</th>
                      <th className="p-2.5">Length (cm)</th>
                      <th className="p-2.5">Shoulder (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-blue-400">XS</td>
                      <td className="p-2.5">94</td>
                      <td className="p-2.5">68</td>
                      <td className="p-2.5">43</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-blue-400">S</td>
                      <td className="p-2.5">100</td>
                      <td className="p-2.5">70</td>
                      <td className="p-2.5">45</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] bg-blue-500/10 font-bold">
                      <td className="p-2.5 text-blue-400">M (Standard)</td>
                      <td className="p-2.5">106</td>
                      <td className="p-2.5">72</td>
                      <td className="p-2.5">47</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-blue-400">L</td>
                      <td className="p-2.5">112</td>
                      <td className="p-2.5">74</td>
                      <td className="p-2.5">49</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-blue-400">XL</td>
                      <td className="p-2.5">118</td>
                      <td className="p-2.5">76</td>
                      <td className="p-2.5">51</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-blue-400">XXL</td>
                      <td className="p-2.5">124</td>
                      <td className="p-2.5">78</td>
                      <td className="p-2.5">53</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                {isAr ? "فهمت المقاسات" : "Got It"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════ 8. QUICK LOOK FULLSCREEN VIEWER (SCREENSHOT 9) ══════════════════ */}
      <AnimatePresence>
        {isQuickLookOpen && (
          <div className="fixed inset-0 z-[10020] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 text-white">
            {/* Quick Look Top Navigation Bar */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>IN STOCK</span>
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-sm font-bold truncate max-w-xs">{product.title}</h4>
                  <p className="text-[10px] text-white/50">
                    {product.brand || product.storeName} · {product.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-all"
                  title="Toggle Zoom"
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isZoomed ? "Zoom Out" : "Zoom In"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickLookOpen(false);
                    setIsZoomed(false);
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centered High-Res Image Viewport */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4">
              <motion.div
                animate={{ scale: isZoomed ? 1.7 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="max-h-[72vh] max-w-full flex items-center justify-center cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={currentGalleryImage}
                  alt={product.title}
                  className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl select-none"
                />
              </motion.div>

              {/* Gallery Switchers on Fullscreen */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === 0 ? gallery.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === gallery.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Quick Look Bottom Floating Bar */}
            <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 flex items-center justify-between gap-4 z-10">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate">{product.title}</p>
                <p className="text-xs font-bold text-blue-400">
                  {product.currency || currency} {product.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, { size: selectedSize, color: selectedColor });
                    setIsQuickLookOpen(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة للسلة" : "Add to Bag"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
