"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sun,
  Moon,
  Globe,
  X,
  ExternalLink,
  Laptop,
  CreditCard,
  Banknote,
  QrCode,
  Zap,
  User,
  MapPin,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/theme/useTheme";
import { useDashboardLanguage } from "@/lib/i18n";
import { APP_ROUTES, buildDashboardUrl, buildCashierUrl } from "@/config/routes";
import {
  getStoreProfile,
  resolveViewer,
  getAllRegisteredStores,
  type StoreProfile,
  type StoreProduct,
  type ViewerProfile,
} from "@/lib/store-registry";
import { ProductDetailSheet } from "@/components/storefront/ProductDetailSheet";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  sku?: string;
  size?: string;
  color?: string;
  currency?: string;
}

interface StoreGroup {
  name: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
}

type UniversalCart = Record<string, StoreGroup>;

function StorefrontContent() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useDashboardLanguage();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters for Store ID & Viewer ID
  const storeIdParam = searchParams.get("storeId") || searchParams.get("store");
  const viewerIdParam = searchParams.get("viewerId") || searchParams.get("uid");

  // Active Store Profile resolved by storeId
  const [currentStore, setCurrentStore] = useState<StoreProfile>(() =>
    getStoreProfile(storeIdParam || "peacock_store")
  );

  // Active Viewer / Customer Profile resolved by viewerId
  const [viewer, setViewer] = useState<ViewerProfile>(() =>
    resolveViewer(viewerIdParam)
  );

  // List of all platform stores for quick switching
  const allStores = useMemo(() => getAllRegisteredStores(), []);

  // Sync state whenever URL query params change
  useEffect(() => {
    const updatedStore = getStoreProfile(storeIdParam || "peacock_store");
    setCurrentStore(updatedStore);
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_active_store_id", updatedStore.id);
    }
  }, [storeIdParam]);

  useEffect(() => {
    const updatedViewer = resolveViewer(viewerIdParam);
    setViewer(updatedViewer);
  }, [viewerIdParam]);

  // Presentation Mode: false = FastCart mode, true = 3D Bento Gallery mode
  const [isGalleryActive, setIsGalleryActive] = useState(false);

  // Floating Antigravity Dock State
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<"cart" | "checkout" | "orders">("cart");

  // Multi-Store Cart state
  const [universalCart, setUniversalCart] = useState<UniversalCart>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Product Slide-Up Bottom Sheet (Quick View) State
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleOpenProductDetail = (prod: StoreProduct) => {
    playSound("pop");
    setSelectedProduct(prod);
    setIsDetailSheetOpen(true);
  };

  // Store Switcher dropdown in header
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [customViewerInput, setCustomViewerInput] = useState("");

  // Checkout form state (pre-populated from viewer profile)
  const [customerName, setCustomerName] = useState(viewer.name);
  const [customerPhone, setCustomerPhone] = useState(viewer.phone);
  const [customerAddress, setCustomerAddress] = useState(viewer.address);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCustomerName(viewer.name);
    setCustomerPhone(viewer.phone);
    setCustomerAddress(viewer.address);
  }, [viewer]);

  // Audio effect
  const playSound = (type: "pop" | "cash" | "switch") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "cash") {
        osc.type = "triangle";
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
        });
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(550, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (_) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch store via URL
  const switchStore = (targetStoreId: string) => {
    playSound("switch");
    setShowStoreSwitcher(false);
    const params = new URLSearchParams(window.location.search);
    params.set("storeId", targetStoreId);
    router.push(`/storefront?${params.toString()}`);
    showToast(isAr ? `تم التبديل إلى متجر ${targetStoreId}` : `Switched to store: ${targetStoreId}`);
  };

  // Switch viewer via URL
  const applyViewerChange = (newUid: string) => {
    playSound("pop");
    setShowViewerModal(false);
    const cleanUid = newUid.trim() || `usr_viewer_${Math.random().toString(36).substring(2, 7)}`;
    const params = new URLSearchParams(window.location.search);
    params.set("viewerId", cleanUid);
    router.push(`/storefront?${params.toString()}`);
    showToast(isAr ? `تم تحديث هوية المتصفح: #${cleanUid}` : `Viewer ID updated: #${cleanUid}`);
  };

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const data = localStorage.getItem("matager_universal_cart");
      if (data) {
        setUniversalCart(JSON.parse(data));
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadCartFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "matager_universal_cart") {
        loadCartFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("matager_pos_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "CART_UPDATED") {
            loadCartFromStorage();
          }
        };
      }
    } catch (_) {}

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  const saveCart = (nextCart: UniversalCart) => {
    setUniversalCart(nextCart);
    try {
      localStorage.setItem("matager_universal_cart", JSON.stringify(nextCart));
    } catch (_) {}

    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("matager_pos_sync");
        bc.postMessage({ type: "CART_UPDATED" });
        bc.close();
      }
    } catch (_) {}
  };

  // Cart operations
  const handleAddToCart = (
    product: StoreProduct | { id: string; title: string; price: number; image: string; storeId?: string; storeName?: string; currency?: string },
    variant?: { size?: string; color?: string }
  ) => {
    playSound("pop");
    const targetStoreId = product.storeId || currentStore.id;
    const targetStoreName = product.storeName || currentStore.name;
    const itemCurrency = product.currency || currentStore.currency;

    const nextCart = { ...universalCart };
    if (!nextCart[targetStoreId]) {
      nextCart[targetStoreId] = {
        name: targetStoreName,
        currency: itemCurrency,
        items: [],
        subtotal: 0,
      };
    }

    const itemSku = variant?.size || variant?.color
      ? `${product.id}_${variant?.size || ""}_${variant?.color || ""}`
      : product.id;

    const existing = nextCart[targetStoreId].items.find((i) => (i.sku || i.id) === itemSku);
    if (existing) {
      existing.qty += 1;
    } else {
      nextCart[targetStoreId].items.push({
        id: product.id,
        sku: itemSku,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
        size: variant?.size,
        color: variant?.color,
        currency: itemCurrency,
      });
    }

    // Recalculate subtotal
    nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    saveCart(nextCart);
    const variantTag = variant?.size || variant?.color
      ? ` (${[variant?.size, variant?.color].filter(Boolean).join(" · ")})`
      : "";
    showToast(`${product.title}${variantTag} ${isAr ? "تمت إضافته إلى السلة" : "added to Universal FastCart"}`);
    setIsDockOpen(true);
    setActiveDockTab("cart");
  };

  const handleQuickBuy = (
    product: StoreProduct,
    variant?: { size?: string; color?: string }
  ) => {
    handleAddToCart(product, variant);
    setActiveDockTab("checkout");
  };

  const handleUpdateQty = (targetStoreId: string, productId: string, delta: number) => {
    playSound("pop");
    const nextCart = { ...universalCart };
    if (!nextCart[targetStoreId]) return;

    const target = nextCart[targetStoreId].items.find((i) => i.id === productId);
    if (!target) return;

    target.qty += delta;
    if (target.qty <= 0) {
      nextCart[targetStoreId].items = nextCart[targetStoreId].items.filter((i) => i.id !== productId);
      if (nextCart[targetStoreId].items.length === 0) {
        delete nextCart[targetStoreId];
      }
    }

    if (nextCart[targetStoreId]) {
      nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    saveCart(nextCart);
  };

  const handleRemoveItem = (targetStoreId: string, productId: string) => {
    playSound("switch");
    const nextCart = { ...universalCart };
    if (!nextCart[targetStoreId]) return;

    nextCart[targetStoreId].items = nextCart[targetStoreId].items.filter((i) => i.id !== productId);
    if (nextCart[targetStoreId].items.length === 0) {
      delete nextCart[targetStoreId];
    } else {
      nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }
    saveCart(nextCart);
  };

  // Grand totals
  const totalItemsCount = useMemo(() => {
    return Object.values(universalCart).reduce(
      (acc, s) => acc + s.items.reduce((sum, i) => sum + i.qty, 0),
      0
    );
  }, [universalCart]);

  const grandTotal = useMemo(() => {
    return Object.values(universalCart).reduce((acc, s) => acc + s.subtotal, 0);
  }, [universalCart]);

  // Universal Checkout submission
  const handlePlaceOrder = () => {
    if (totalItemsCount === 0) return;
    setIsSubmitting(true);
    playSound("cash");

    setTimeout(() => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const allStoresInCart = Object.keys(universalCart);

      const unifiedOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: "Completed",
        channel: "FastCart-Online",
        viewer_id: viewer.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: customerAddress,
        payment_method: paymentMethod,
        amount: grandTotal,
        currency: currentStore.currency,
        items_count: totalItemsCount,
        primary_store_id: currentStore.id,
        stores: allStoresInCart.map((id) => ({
          storeId: id,
          name: universalCart[id].name,
          currency: universalCart[id].currency,
          items: universalCart[id].items,
          subtotal: universalCart[id].subtotal,
        })),
      };

      // 1. Save to local storage
      try {
        const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
        existing.unshift(unifiedOrder);
        localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));

        // Also save to viewer's personal orders
        const viewerKey = `matager_orders_${viewer.id}`;
        const viewerOrders = JSON.parse(localStorage.getItem(viewerKey) || "[]");
        viewerOrders.unshift(unifiedOrder);
        localStorage.setItem(viewerKey, JSON.stringify(viewerOrders.slice(0, 20)));
      } catch (_) {}

      // 2. Clear cart
      saveCart({});

      // 3. Dispatch Live Events to POS Cashier & Merchant Dashboard
      window.dispatchEvent(new CustomEvent("matager:new_order", { detail: unifiedOrder }));
      window.dispatchEvent(new CustomEvent("matager:storefront_order", { detail: unifiedOrder }));

      // 4. Cross-tab BroadcastChannel to notify active POS terminals for this store
      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("matager_pos_sync");
          bc.postMessage({
            type: "ONLINE_FASTCART_ORDER",
            order: unifiedOrder,
            storeId: currentStore.id,
            timestamp: Date.now(),
          });
          bc.close();
        }
      } catch (_) {}

      setIsSubmitting(false);
      setPlacedOrderInfo(unifiedOrder);
      setActiveDockTab("orders");
      showToast(
        isAr
          ? `تم تأكيد الطلب بنجاح ${orderId} ومزامنته مع نقاط بيع ${currentStore.name}!`
          : `Order ${orderId} placed & synced with ${currentStore.name} POS Cashier!`
      );
    }, 1000);
  };

  // Toggle Gallery Presentation Mode
  const handleTogglePresentation = () => {
    playSound("switch");
    setIsGalleryActive((prev) => !prev);
    showToast(
      !isGalleryActive
        ? isAr
          ? "تم الانتقال إلى معرض المنتجات ثلاثي الأبعاد"
          : "Switched to 3D Bento Gallery Mode"
        : isAr
        ? "تم الانتقال إلى وضع السلة السريعة"
        : "Switched to FastCart Mode"
    );
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (categoryFilter === "All") return currentStore.products;
    return currentStore.products.filter((p) => p.category === categoryFilter);
  }, [categoryFilter, currentStore]);

  // Secondary partner store for demonstrating cross-store cart functionality
  const partnerStore = useMemo(() => {
    return allStores.find((s) => s.id !== currentStore.id) || allStores[0];
  }, [allStores, currentStore]);

  return (
    <div
      className={`min-h-screen text-[var(--color-text-primary)] transition-colors duration-300 font-sans ${
        theme === "dark" ? "bg-[#060608]" : "bg-slate-50"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ══════════════════ FLOATING TOAST NOTIFICATION ══════════════════ */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════ TOP STOREFRONT SYSTEM BAR ══════════════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[var(--color-canvas)]/85 border-b border-[var(--color-border-subtle)] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={buildDashboardUrl(currentStore.id)}
            className="flex items-center gap-2 group"
            title="Return to Merchant Admin Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              M
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-tight block leading-none">Matager OS</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {currentStore.name}
              </span>
            </div>
          </Link>

          <span className="w-px h-4 bg-white/10 hidden sm:block"></span>

          {/* Interactive Store Switcher Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all text-blue-400"
              title="Switch Active Store"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center shrink-0">
                <img
                  src={currentStore.logo}
                  alt={currentStore.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="max-w-[120px] truncate">{currentStore.name}</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {/* Store Switcher Dropdown */}
            {showStoreSwitcher && (
              <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-white/15 p-2 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-2 py-1 text-[10px] uppercase text-white/50 border-b border-white/10 mb-1">
                  {isAr ? "المتاجر المتاحة بالمنصة" : "Platform Active Stores"}
                </div>
                <div className="space-y-1">
                  {allStores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => switchStore(store.id)}
                      className={`w-full p-2 rounded-xl text-left rtl:text-right text-xs flex items-center justify-between transition-all ${
                        store.id === currentStore.id
                          ? "bg-blue-600 text-white font-bold"
                          : "hover:bg-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-5 h-5 rounded-md object-cover bg-black"
                        />
                        <div>
                          <p className="truncate font-bold leading-none">{store.name}</p>
                          <p className="text-[10px] opacity-60">{store.city}, {store.country}</p>
                        </div>
                      </div>
                      {store.id === currentStore.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* POS Sync Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>POS Online</span>
          </div>
        </div>

        {/* Right Controls: Viewer ID, Presentation Mode, Theme, Language, Cashier Link */}
        <div className="flex items-center gap-2">
          {/* Viewer ID Badge */}
          <button
            type="button"
            onClick={() => setShowViewerModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Click to view or switch Viewer ID"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[100px] truncate">
              {viewer.id.startsWith("usr_viewer_") ? `#${viewer.id.slice(-4)}` : viewer.id}
            </span>
          </button>

          {/* Presentation Mode Switcher */}
          <button
            type="button"
            onClick={handleTogglePresentation}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              isGalleryActive
                ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/25"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-[var(--color-text-primary)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGalleryActive ? (isAr ? "وضع السلة" : "FastCart Mode") : (isAr ? "معرض الصور" : "3D Gallery")}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Toggle Arabic / English"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">{isAr ? "EN" : "عربي"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* POS Cashier Register Link */}
          <Link
            href={buildCashierUrl(currentStore.id)}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all hidden md:flex items-center gap-1.5"
            title="Launch Store POS Register"
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </Link>
        </div>
      </header>

      {/* ══════════════════ VIEWER SWITCHER MODAL ══════════════════ */}
      {showViewerModal && (
        <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Viewer Session Identity</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewerModal(false)}
                className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-white/60">
                Each viewer browsing this storefront has an independent ID standing on their cart, preferences, and orders.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
                <div><span className="text-white/50">Current Viewer ID:</span> <strong className="text-blue-400">{viewer.id}</strong></div>
                <div><span className="text-white/50">Store Bound:</span> <strong className="text-white">{currentStore.id}</strong></div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  Change Viewer ID / UID
                </label>
                <input
                  type="text"
                  placeholder="e.g. omar_vip or customer_42"
                  value={customViewerInput}
                  onChange={(e) => setCustomViewerInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => applyViewerChange(`usr_viewer_${Math.random().toString(36).substring(2, 7)}`)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
              >
                New Random ID
              </button>
              <button
                type="button"
                onClick={() => applyViewerChange(customViewerInput || viewer.id)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25"
              >
                Apply ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ PARALLAX STOREFRONT STAGE ══════════════════ */}
      <main
        className="w-full max-w-full mx-auto p-0 space-y-8 transition-all duration-700 ease-out"
        style={{
          transform: isGalleryActive ? "scale(0.95) translateZ(-50px)" : "scale(1) translateZ(0)",
          filter: isGalleryActive ? "blur(4px) brightness(0.7)" : "none",
          pointerEvents: isGalleryActive ? "none" : "auto",
        }}
      >
        {/* Dynamic Store Hero Banner standing on storeId - Edge-to-Edge */}
        <section className="relative w-full rounded-none border-0 overflow-hidden bg-transparent">
          <div className="h-48 sm:h-64 md:h-72 w-full overflow-hidden relative">
            <img
              src={currentStore.banner}
              alt={`${currentStore.name} Cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>

          <div className="px-4 sm:px-8 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 bg-white dark:bg-neutral-900 shadow-xl shrink-0">
                <img
                  src={currentStore.logo}
                  alt={`${currentStore.name} Logo`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentStore.name}
                  </h1>
                  {currentStore.verified && (
                    <span
                      className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]"
                      title="Verified Merchant on Matager"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white/80 text-[10px] font-bold">
                    {currentStore.categories?.[1] || currentStore.categories?.[0] || "Clothing"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white/70 max-w-xl">
                  {isAr ? currentStore.taglineAr : currentStore.tagline}
                </p>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span>
                    <strong className="text-slate-900 dark:text-white">{currentStore.productsCount}</strong>{" "}
                    <span className="text-slate-500 dark:text-white/50">{isAr ? "منتج" : "products"}</span>
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{currentStore.followersCount}</strong>{" "}
                    <span className="text-slate-500 dark:text-white/50">{isAr ? "متابع" : "followers"}</span>
                  </span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">
                    {currentStore.rating} ★ <span className="text-slate-500 dark:text-white/50">({currentStore.reviewsCount})</span>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>{currentStore.city}, {currentStore.country}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Partner Store Add Demo Button */}
              {partnerStore && (
                <button
                  type="button"
                  onClick={() => handleAddToCart(partnerStore.products[0])}
                  className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-600 dark:text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                  title={`Simulate multi-store checkout with ${partnerStore.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {isAr ? `إضافة من ${partnerStore.name}` : `Add From ${partnerStore.name}`}
                  </span>
                </button>
              )}

              <button
                type="button"
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>{isAr ? "متابعة" : "follow"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════ CATEGORY SELECTOR & CATALOG ═══════════ */}
        <section className="space-y-4 mb-[70px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 pb-[35px]">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {currentStore.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 dark:text-[var(--color-text-muted)] flex items-center gap-2">
              <span>
                {filteredProducts.length} {isAr ? "منتجات معروضة" : "Products Live"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span className="text-blue-500 dark:text-blue-400 font-bold">{currentStore.currency}</span>
            </div>
          </div>

          {/* Product Grid standing on currentStore catalog - Edge to Edge, gap-0, border-0, p-0 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-[var(--color-border-subtle)] m-0">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group relative rounded-none border-0 p-0 flex flex-col justify-between bg-transparent hover:border-0 hover:shadow-none transition-all duration-300"
              >
                <div
                  onClick={() => handleOpenProductDetail(prod)}
                  className="relative aspect-square rounded-none overflow-hidden bg-black/5 dark:bg-black/60 mb-3 cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px]">
                      {prod.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px]">
                    {prod.stock} in stock
                  </span>
                </div>

                <div className="px-2.5">
                  <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider">
                    {prod.storeName} · {prod.category}
                  </span>
                  <h3
                    onClick={() => handleOpenProductDetail(prod)}
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--color-text-primary)] mt-1 line-clamp-1 leading-snug cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    {prod.title}
                  </h3>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-slate-900 dark:text-[var(--color-text-primary)]">
                        {prod.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-[var(--color-text-muted)] font-bold">
                        {prod.currency || currentStore.currency}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-slate-400 dark:text-[var(--color-text-muted)] line-through">
                          {prod.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Free Express</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)] px-2.5 pb-3">
                  <button
                    type="button"
                    onClick={() => handleOpenProductDetail(prod)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-[var(--color-text-primary)] text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة" : "Add"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenProductDetail(prod)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? "شراء سريع" : "Fast Buy"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ══════════════════ FULLSCREEN BENTO 3D GALLERY OVERLAY ══════════════════ */}
      {isGalleryActive && (
        <div data-lenis-prevent className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-3xl p-4 sm:p-8 flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-xs uppercase text-blue-400 font-bold">
                3D Bento Presentation Mode · {currentStore.name}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentStore.name} Featured Showcase
              </h2>
            </div>
            <button
              type="button"
              onClick={handleTogglePresentation}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10"
            >
              <X className="w-4 h-4" />
              <span>{isAr ? "العودة للسلة" : "Return to FastCart"}</span>
            </button>
          </div>

          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {currentStore.products.slice(0, 5).map((prod, idx) => (
              <div
                key={prod.id}
                onClick={() => handleAddToCart(prod)}
                className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/15 cursor-pointer min-h-[260px] ${
                  idx === 0
                    ? "col-span-1 md:col-span-2 row-span-2 min-h-[360px]"
                    : "col-span-1 row-span-1"
                }`}
              >
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 group-hover:blur-[1px] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    {currentStore.name} · {prod.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                    {prod.title}
                  </h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-sm font-black text-white">
                      {prod.currency || currentStore.currency} {prod.price.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add to FastCart
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ FLOATING ANTIGRAVITY MULTI-STORE DOCK ══════════════════ */}
      <div
        onClick={() => setIsDockOpen(false)}
        className={`fixed inset-0 z-[9980] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isDockOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed left-1/2 z-[9990] w-[min(430px,calc(100vw-28px))] max-h-[86vh] rounded-[30px] border border-[var(--glass-border,rgba(255,255,255,0.12))] overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)] ${
          theme === "dark"
            ? "bg-[#141416]/90 backdrop-blur-2xl text-white"
            : "bg-white/95 backdrop-blur-2xl text-slate-900 border-black/10 shadow-2xl"
        }`}
        style={{
          bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          transform: isDockOpen
            ? isGalleryActive
              ? "translate3d(-50%, 0, 80px) scale(1.03)"
              : "translate3d(-50%, 0, 0) scale(1)"
            : "translate3d(-50%, calc(100% - 64px), 0) scale(0.98)",
        }}
      >
        {/* Dock Header */}
        <div className="h-[50px] px-4 border-b border-white/10 flex items-center justify-between text-xs font-bold shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={currentStore.logo}
                alt={currentStore.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="truncate text-[11px] font-bold">
              {isAr ? "السلة الموحدة" : "Universal FastCart"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[11px]"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-blue-500" />}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className="px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold"
            >
              {isAr ? "EN" : "عربي"}
            </button>
            <button
              type="button"
              onClick={() => setIsDockOpen(!isDockOpen)}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[11px]"
            >
              {isDockOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dock Scrollable Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {/* Sub-tabs inside dock */}
          <div className="flex items-center gap-1 border-b border-white/10 pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveDockTab("cart")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "cart"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "السلة الموحدة" : "Multi-Store Cart"} ({totalItemsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveDockTab("checkout")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "checkout"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "إتمام الشراء" : "Checkout"}
            </button>
            <button
              type="button"
              onClick={() => setActiveDockTab("orders")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "orders"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "الطلبات" : "Orders"}
            </button>
          </div>

          {/* TAB 1: CART (GROUPED BY STORE) */}
          {activeDockTab === "cart" && (
            <div>
              {Object.keys(universalCart).length === 0 ? (
                <div className="py-10 text-center text-white/40 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm font-bold text-white">Your Universal Cart is empty</p>
                  <p className="text-xs">
                    Browse {currentStore.name} products above or add from a partner store to experience zero-gravity checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(universalCart).map(([storeId, store]) => (
                    <div
                      key={storeId}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                    >
                      {/* Store Header */}
                      <div className="px-3.5 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-bold text-white">{store.name}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                            {store.items.length} items
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-400">
                          {store.currency || currentStore.currency} {store.subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Store Items */}
                      <div className="p-3 divide-y divide-white/5">
                        {store.items.map((item) => (
                          <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover bg-black/60 shrink-0 border border-white/10"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                <p className="text-[10px] text-white/50">
                                  {item.currency || store.currency} {item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(storeId, item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold px-1.5 text-white">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(storeId, item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(storeId, item.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Summary & Checkout CTA */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>{isAr ? "المتاجر المشمولة" : "Stores in Order"}</span>
                      <span className="font-bold text-white">{Object.keys(universalCart).length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                      <span>{isAr ? "الإجمالي الكلي" : "Grand Total"}</span>
                      <span className="text-blue-400">
                        {currentStore.currency} {grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveDockTab("checkout")}
                      className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <span>{isAr ? "إتمام الشراء لجميع المتاجر" : "Checkout All Stores"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHECKOUT VIEW */}
          {activeDockTab === "checkout" && (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Viewer Session:
                </span>
                <strong className="text-white">{viewer.id}</strong>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "الاسم بالكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "عنوان التوصيل" : `Delivery Address (${currentStore.city} / ${currentStore.country})`}
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "طريقة الدفع" : "Payment Method"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Visa / MasterCard">Visa / MasterCard</option>
                  <option value="Mada / Apple Pay">Mada / Apple Pay</option>
                  <option value="Mobile Wallet">Vodafone Cash / Meeza</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-white/50 block">Amount Due</span>
                  <span className="text-sm font-black text-blue-400">
                    {currentStore.currency} {grandTotal.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted
                  </span>
                  <span className="text-[9px] text-white/40">Syncing with {currentStore.name} POS</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting || totalItemsCount === 0}
                onClick={handlePlaceOrder}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Unified Checkout...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {isAr
                        ? "تأكيد الطلب والدفع"
                        : `Confirm & Pay (${currentStore.currency} ${grandTotal.toLocaleString()})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: ORDERS VIEW */}
          {activeDockTab === "orders" && (
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                {isAr ? "سجل الطلبات المتزامنة" : "Synced Orders History"}
              </h4>
              {placedOrderInfo && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">{placedOrderInfo.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      Just Placed
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    {placedOrderInfo.items_count} items across {placedOrderInfo.stores?.length || 1} stores
                  </p>
                  <p className="text-[11px] font-bold text-emerald-400">
                    {placedOrderInfo.currency} {placedOrderInfo.amount.toLocaleString()}
                  </p>
                  <div className="pt-1 text-[9px] text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Live POS Cashier Terminal Notified</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-white/40 pt-2 text-center">
                All FastCart orders are automatically routed to the in-store Cashier Terminal nodes.
              </p>
            </div>
          )}
        </div>

        {/* Dock Bottom Bar */}
        <div className="h-16 px-3 border-t border-white/10 flex items-center gap-2 shrink-0 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setIsDockOpen(!isDockOpen)}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0"
            title="Expand / Collapse Dock"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDockOpen) setIsDockOpen(true);
              setActiveDockTab(activeDockTab === "cart" ? "checkout" : "cart");
            }}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <span>
              {isDockOpen
                ? activeDockTab === "checkout"
                  ? isAr
                    ? "العودة للسلة"
                    : "Back to Cart"
                  : isAr
                  ? `إتمام الشراء (${totalItemsCount})`
                  : `Checkout (${totalItemsCount}) · ${currentStore.currency} ${grandTotal.toLocaleString()}`
                : isAr
                ? `عرض السلة (${totalItemsCount})`
                : `Universal FastCart (${totalItemsCount})`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ══════════════════ PRODUCT SLIDE-UP BOTTOM SHEET (QUICK VIEW) ══════════════════ */}
      <ProductDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        product={selectedProduct}
        currency={currentStore.currency}
        isAr={isAr}
        onAddToCart={(prod, variant) => handleAddToCart(prod, variant)}
        onQuickBuy={(prod, variant) => handleQuickBuy(prod, variant)}
      />
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center text-xs">
          Loading Matager Universal FastCart & Storefront...
        </div>
      }
    >
      <StorefrontContent />
    </Suspense>
  );
}
