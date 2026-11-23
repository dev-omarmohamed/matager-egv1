"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  ShoppingBag, Store, Layers, Sparkles, Plus, Minus, Trash2, ArrowRight,
  ChevronDown, ChevronUp, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2,
  Package, Sun, Moon, Globe, X, ExternalLink, Laptop, CreditCard, Banknote,
  QrCode, Zap, User, MapPin, SlidersHorizontal, RefreshCw,
  Search, Heart, Bell, LayoutGrid, Grid3x3, FolderOpen, Star,
  MessageCircle, Send, Home, Briefcase, Wallet, Lock, Truck, Tag,
  Clock, Check, Eye,
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

/* ─────────────────────────── Types ─────────────────────────── */
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

type DockTab =
  | "hub" | "cart" | "checkout" | "orders" | "favorites"
  | "notifications" | "search" | "stores" | "categories" | "gallery" | "profile"
  | "product";

interface ViewerNotification {
  id: string;
  type: "order" | "promo" | "store" | "system";
  title: string;
  message: string;
  time: number;
  read: boolean;
}

interface ViewerAddress {
  id: string;
  label: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

interface ViewerOrder {
  id: string;
  date: string;
  status: string;
  items_count: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  amount: number;
  currency: string;
  stores?: any[];
  primary_store_id?: string;
}

/* ─── Order tracking timeline (4 stops) ─── */
const ORDER_STOPS = [
  { key: "Pending", labelEn: "Pending", labelAr: "قيد الانتظار", icon: Clock },
  { key: "Accepted", labelEn: "Accepted", labelAr: "قيد التحضير", icon: Package },
  { key: "Shipped", labelEn: "In Shipping", labelAr: "قيد الشحن", icon: Truck },
  { key: "Delivered", labelEn: "Delivered", labelAr: "تم التوصيل", icon: Home },
] as const;

const statusToStop = (status: string): number => {
  switch (status) {
    case "Pending": return 0;
    case "Accepted":
    case "Processing": return 1;
    case "Shipped": return 2;
    case "Delivered":
    case "Completed": return 3;
    default: return -1;
  }
};

const isCancelable = (status: string) => status === "Pending" || status === "Accepted";
const isReturnable = (status: string) => status === "Delivered" || status === "Completed";
const isTerminal = (status: string) => status === "Canceled" || status === "Returned";

/* Default size/color options used when the product doesn't provide them */
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = ["Black", "White", "Red", "Blue", "Navy", "Gray"];

/* ═════════════════════════════════════════════════════════════════════════════
   EDGE-TO-EDGE PRODUCT TILE — image only, no borders, no text
   ═════════════════════════════════════════════════════════════════════════════ */
function ProductRowCard({
  prod,
  onOpen,
  viewerFavorites,
  onToggleFavorite,
}: {
  prod: any;
  onOpen: (p: any) => void;
  viewerFavorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const isFav = viewerFavorites.includes(prod.id);

  return (
    <div
      className="group relative w-full aspect-square overflow-hidden cursor-pointer bg-black/40"
      onClick={() => onOpen(prod)}
      draggable={false}
    >
      <img
        src={prod.image}
        alt={prod.title}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* hover veil */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

      {prod.badge && (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-bold">
          {prod.badge}
        </span>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(prod.id);
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/85 hover:scale-110 transition-all duration-200"
        aria-label="Toggle favorite"
      >
        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(prod);
        }}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#0479E8] to-[#0083FE] shadow-lg shadow-blue-500/40 flex items-center justify-center text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 transition-all duration-200"
        aria-label="View product"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* title overlay on hover */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-[10px] font-bold text-white truncate">{prod.title}</p>
        <p className="text-[9px] text-blue-300 font-bold truncate">
          {(prod.currency || "")} {prod.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function InfiniteProductRow({
  products,
  onOpen,
  viewerFavorites,
  onToggleFavorite,
  autoplay = true,
}: {
  products: any[];
  onOpen: (p: any) => void;
  viewerFavorites: string[];
  onToggleFavorite: (id: string) => void;
  autoplay?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetXRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const hoveredRef = useRef(false);
  const dragStartRef = useRef({ x: 0, pointerX: 0 });
  const lastPointerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const wasDraggingRef = useRef(false);
  const itemStrideRef = useRef(0);
  const uniqueCountRef = useRef(0);

  const uniqueProducts = useMemo(() => {
    if (products.length === 0) return [];
    let list = [...products];
    while (list.length < Math.max(products.length, 5)) {
      list = [...list, ...products];
    }
    return list;
  }, [products]);

  const displayProducts = useMemo(() => {
    if (uniqueProducts.length === 0) return [];
    return [...uniqueProducts, ...uniqueProducts, ...uniqueProducts];
  }, [uniqueProducts]);

  uniqueCountRef.current = uniqueProducts.length;

  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const first = trackRef.current.querySelector("[data-card]") as HTMLElement;
    if (!first) return;
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 0;
    itemStrideRef.current = first.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure, products.length]);

  useEffect(() => {
    const tick = () => {
      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.05) {
          targetXRef.current += velocityRef.current;
          velocityRef.current *= 0.94;
        } else {
          velocityRef.current = 0;
          if (autoplay && !hoveredRef.current) {
            targetXRef.current -= 0.55;
          }
        }
      }

      const wrapWidth = itemStrideRef.current * uniqueCountRef.current;
      let renderX = targetXRef.current;
      if (wrapWidth > 0) {
        renderX = ((targetXRef.current % wrapWidth) + wrapWidth) % wrapWidth;
        if (renderX > 0) renderX -= wrapWidth;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${renderX}px, 0, 0)`;
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [autoplay]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    dragDistanceRef.current = 0;
    dragStartRef.current = { x: targetXRef.current, pointerX: e.clientX };
    lastPointerRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartRef.current.pointerX;
    dragDistanceRef.current = delta;
    targetXRef.current = dragStartRef.current.x + delta;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = ((e.clientX - lastPointerRef.current) / dt) * 16;
    }
    lastPointerRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) { }
    if (Math.abs(dragDistanceRef.current) > 5) {
      wasDraggingRef.current = true;
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 80);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (products.length === 0) return null;

  return (
    <div
      className="overflow-hidden w-full select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={handleClickCapture}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      style={{ cursor: "grab", touchAction: "pan-y" }}
    >
      <div
        ref={trackRef}
        className="flex gap-0 will-change-transform"
        style={{ backfaceVisibility: "hidden" }}
      >
        {displayProducts.map((prod, idx) => (
          <div
            key={`${prod.id}-${idx}`}
            data-card
            className="w-1/3 lg:w-1/4 shrink-0"
          >
            <ProductRowCard
              prod={prod}
              onOpen={onOpen}
              viewerFavorites={viewerFavorites}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
function StorefrontContent() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useDashboardLanguage();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  const storeIdParam = searchParams.get("storeId") || searchParams.get("store");
  const viewerIdParam = searchParams.get("viewerId") || searchParams.get("uid");

  const [currentStore, setCurrentStore] = useState<StoreProfile>(() =>
    getStoreProfile(storeIdParam || "peacock_store")
  );
  const [viewer, setViewer] = useState<ViewerProfile>(() => resolveViewer(viewerIdParam));
  const allStores = useMemo(() => getAllRegisteredStores(), []);

  useEffect(() => {
    const updatedStore = getStoreProfile(storeIdParam || "peacock_store");
    setCurrentStore(updatedStore);
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_active_store_id", updatedStore.id);
    }
  }, [storeIdParam]);

  useEffect(() => {
    setViewer(resolveViewer(viewerIdParam));
  }, [viewerIdParam]);

  /* ─── Core UI state ─── */
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<DockTab>("hub");
  const [previousDockTab, setPreviousDockTab] = useState<DockTab>("hub");
  const [universalCart, setUniversalCart] = useState<UniversalCart>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [productQty, setProductQty] = useState<number>(1);
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [customViewerInput, setCustomViewerInput] = useState("");

  /* ─── Checkout form ─── */
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

  /* ─── Viewer account state ─── */
  const [viewerFavorites, setViewerFavorites] = useState<string[]>([]);
  const [viewerFollowedStores, setViewerFollowedStores] = useState<string[]>([]);
  const [viewerNotifications, setViewerNotifications] = useState<ViewerNotification[]>([]);
  const [viewerAddresses, setViewerAddresses] = useState<ViewerAddress[]>([]);
  const [viewerOrders, setViewerOrders] = useState<ViewerOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"products" | "categories" | "stores" | "orders">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [chatFeed, setChatFeed] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  /* ─── Sound / Toast ─── */
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
      } else if (type === "cash") {
        osc.type = "triangle";
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
        });
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(550, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      }
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (type === "cash" ? 0.35 : 0.1));
    } catch (_) { }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ─── GSAP Entrance Animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const hero = document.getElementById("store-hero");
      if (hero) {
        gsap.fromTo(hero, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      }
      const bar = document.getElementById("category-bar");
      if (bar) {
        gsap.fromTo(bar, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "power2.out" });
      }
      const rows = document.querySelectorAll(".product-row-animate");
      if (rows.length) {
        gsap.fromTo(rows, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, delay: 0.25, ease: "power3.out" });
      }
    });
    return () => ctx.revert();
  }, [currentStore.id, categoryFilter]);

  /* ─── Store / Viewer switching ─── */
  const switchStore = (targetStoreId: string) => {
    playSound("switch");
    setShowStoreSwitcher(false);
    const params = new URLSearchParams(window.location.search);
    params.set("storeId", targetStoreId);
    router.push(`/storefront?${params.toString()}`);
    showToast(isAr ? `تم التبديل إلى متجر ${targetStoreId}` : `Switched to store: ${targetStoreId}`);
  };

  const applyViewerChange = (newUid: string) => {
    playSound("pop");
    setShowViewerModal(false);
    const cleanUid = newUid.trim() || `usr_viewer_${Math.random().toString(36).substring(2, 7)}`;
    const params = new URLSearchParams(window.location.search);
    params.set("viewerId", cleanUid);
    router.push(`/storefront?${params.toString()}`);
    showToast(isAr ? `تم تحديث هوية المتصفح: #${cleanUid}` : `Viewer ID updated: #${cleanUid}`);
  };

  /* ─── Persistence helpers ─── */
  const loadCartFromStorage = () => {
    try {
      const data = localStorage.getItem("matager_universal_cart");
      if (data) setUniversalCart(JSON.parse(data));
    } catch (_) { }
  };

  const saveCart = (nextCart: UniversalCart) => {
    setUniversalCart(nextCart);
    try {
      localStorage.setItem("matager_universal_cart", JSON.stringify(nextCart));
    } catch (_) { }
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("matager_pos_sync");
        bc.postMessage({ type: "CART_UPDATED" });
        bc.close();
      }
    } catch (_) { }
  };

  const persistViewerSlice = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(`matager_viewer_${key}_${viewer.id}`, JSON.stringify(value));
    } catch (_) { }
  };

  /* ─── Load viewer account data on viewer change ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(`matager_viewer_favorites_${viewer.id}`);
      setViewerFavorites(raw ? JSON.parse(raw) : []);
    } catch { setViewerFavorites([]); }

    try {
      const raw = localStorage.getItem(`matager_viewer_followed_stores_${viewer.id}`);
      setViewerFollowedStores(raw ? JSON.parse(raw) : []);
    } catch { setViewerFollowedStores([]); }

    try {
      const raw = localStorage.getItem(`matager_orders_${viewer.id}`);
      setViewerOrders(raw ? JSON.parse(raw) : []);
    } catch { setViewerOrders([]); }

    try {
      const raw = localStorage.getItem(`matager_viewer_addresses_${viewer.id}`);
      if (raw) {
        setViewerAddresses(JSON.parse(raw));
      } else {
        const initial: ViewerAddress[] = [
          { id: "addr-1", label: "Home", address: viewer.address, phone: viewer.phone, isDefault: true },
        ];
        setViewerAddresses(initial);
        localStorage.setItem(`matager_viewer_addresses_${viewer.id}`, JSON.stringify(initial));
      }
    } catch { }

    try {
      const raw = localStorage.getItem(`matager_viewer_notifications_${viewer.id}`);
      if (raw) {
        setViewerNotifications(JSON.parse(raw));
      } else {
        const initial: ViewerNotification[] = [
          { id: "n1", type: "order", title: "Your order has shipped", message: "ORD-8823 is on its way to you", time: Date.now() - 3600000, read: false },
          { id: "n2", type: "promo", title: "20% off welcome", message: "Use code WELCOME at checkout", time: Date.now() - 86400000, read: false },
          { id: "n3", type: "store", title: "New store added", message: "Check out Samsung Store", time: Date.now() - 172800000, read: true },
        ];
        setViewerNotifications(initial);
        localStorage.setItem(`matager_viewer_notifications_${viewer.id}`, JSON.stringify(initial));
      }
    } catch { }

    setChatFeed([
      { role: "ai", text: isAr ? "مرحباً! أنا مساعدك في Matager. اطلب مني فتح السلة، الطلبات، المفضلة، البحث، أو تبديل الوضع." : "Hi! I'm your Matager assistant. Ask me to open a view, search products, or switch theme." },
    ]);
  }, [viewer.id]);

  /* ─── Cart persistence effect ─── */
  useEffect(() => {
    loadCartFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "matager_universal_cart") loadCartFromStorage();
    };
    window.addEventListener("storage", handleStorage);
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("matager_pos_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "CART_UPDATED") loadCartFromStorage();
        };
      }
    } catch (_) { }
    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  /* ─── Seed sample orders across all 4 states ─── */
  const sampleOrders = useMemo<ViewerOrder[]>(() => {
    if (!currentStore.products || currentStore.products.length === 0) return [];
    const p1 = currentStore.products[0];
    const p2 = currentStore.products[1] || p1;
    const p3 = currentStore.products[2] || p2;
    const base = {
      customer_name: viewer.name,
      customer_phone: viewer.phone,
      shipping_address: viewer.address,
      payment_method: "Cash on Delivery",
      currency: currentStore.currency,
      primary_store_id: currentStore.id,
    };
    return [
      {
        ...base,
        id: "ORD-8822",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        status: "Pending",
        items_count: 2,
        amount: p1.price * 2,
        stores: [{ storeId: currentStore.id, name: currentStore.name, items: [{ ...p1, qty: 2 }], subtotal: p1.price * 2 }],
      },
      {
        ...base,
        id: "ORD-8823",
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        status: "Shipped",
        items_count: 1,
        amount: p2.price,
        payment_method: "Credit Card",
        stores: [{ storeId: currentStore.id, name: currentStore.name, items: [{ ...p2, qty: 1 }], subtotal: p2.price }],
      },
      {
        ...base,
        id: "ORD-8824",
        date: new Date(Date.now() - 8 * 86400000).toISOString(),
        status: "Delivered",
        items_count: 1,
        amount: p3.price,
        stores: [{ storeId: currentStore.id, name: currentStore.name, items: [{ ...p3, qty: 1 }], subtotal: p3.price }],
      },
    ];
  }, [currentStore, viewer]);

  const displayOrders = viewerOrders.length > 0 ? viewerOrders : sampleOrders;

  /* ─── Flat product list for search/favorites ─── */
  const allProducts = useMemo(() => {
    return allStores.flatMap((s) =>
      s.products.map((p) => ({
        ...p,
        storeId: s.id,
        storeName: s.name,
        currency: p.currency || s.currency,
      }))
    );
  }, [allStores]);

  const findProduct = (id: string) => allProducts.find((p) => p.id === id);

  const totalItemsCount = useMemo(() => {
    return Object.values(universalCart).reduce(
      (acc, s) => acc + s.items.reduce((sum, i) => sum + i.qty, 0),
      0
    );
  }, [universalCart]);

  const grandTotal = useMemo(() => {
    return Object.values(universalCart).reduce((acc, s) => acc + s.subtotal, 0);
  }, [universalCart]);

  const unreadNotifCount = viewerNotifications.filter((n) => !n.read).length;

  /* ─── Viewer actions ─── */
  const toggleFavorite = (productId: string) => {
    playSound("pop");
    const isFav = viewerFavorites.includes(productId);
    const next = isFav ? viewerFavorites.filter((id) => id !== productId) : [...viewerFavorites, productId];
    setViewerFavorites(next);
    persistViewerSlice("favorites", next);
    showToast(isFav ? (isAr ? "أزيل من المفضلة" : "Removed from favorites") : (isAr ? "أضيف للمفضلة" : "Added to favorites"));
  };

  const toggleFollowStore = (storeId: string) => {
    playSound("pop");
    const isFollowing = viewerFollowedStores.includes(storeId);
    const next = isFollowing ? viewerFollowedStores.filter((id) => id !== storeId) : [...viewerFollowedStores, storeId];
    setViewerFollowedStores(next);
    persistViewerSlice("followed_stores", next);
    showToast(isFollowing ? (isAr ? "تمت إزالة المتابعة" : "Unfollowed store") : (isAr ? "تتم المتابعة الآن" : "Following store"));
  };

  const markAllNotificationsRead = () => {
    const next = viewerNotifications.map((n) => ({ ...n, read: true }));
    setViewerNotifications(next);
    persistViewerSlice("notifications", next);
    playSound("switch");
  };

  const clearAllNotifications = () => {
    setViewerNotifications([]);
    persistViewerSlice("notifications", []);
    playSound("switch");
    showToast(isAr ? "تم مسح الإشعارات" : "Notifications cleared");
  };

  const cancelOrder = (orderId: string) => {
    const order = viewerOrders.find((o) => o.id === orderId);
    if (!order) return;
    if (!isCancelable(order.status)) {
      playSound("switch");
      showToast(
        isAr
          ? "لا يمكن إلغاء الطلب في هذه المرحلة — يمكنك طلب استرجاع بعد التوصيل."
          : "Order can't be canceled at this stage — you can request a return after delivery."
      );
      return;
    }
    const next = viewerOrders.map((o) => (o.id === orderId ? { ...o, status: "Canceled" } : o));
    setViewerOrders(next);
    try {
      localStorage.setItem(`matager_orders_${viewer.id}`, JSON.stringify(next));
    } catch { }
    playSound("switch");
    showToast(isAr ? `تم إلغاء ${orderId}` : `${orderId} canceled`);
  };

  const requestReturn = (orderId: string) => {
    const order = viewerOrders.find((o) => o.id === orderId);
    if (!order) return;
    if (!isReturnable(order.status)) {
      playSound("switch");
      showToast(isAr ? "يمكن طلب الاسترجاع فقط بعد استلام الطلب." : "Return can only be requested after delivery.");
      return;
    }
    const next = viewerOrders.map((o) => (o.id === orderId ? { ...o, status: "Returned" } : o));
    setViewerOrders(next);
    try {
      localStorage.setItem(`matager_orders_${viewer.id}`, JSON.stringify(next));
    } catch { }
    playSound("switch");
    showToast(
      isAr ? `تم تسجيل طلب استرجاع ${orderId} — سيتواصل معك المتجر.` : `Return requested for ${orderId} — the store will contact you.`
    );
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatFeed((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    playSound("pop");
    setTimeout(() => {
      const q = userMsg.toLowerCase();
      let reply = "";
      if (/cart|سلة/.test(q)) { setActiveDockTab("cart"); reply = isAr ? "فتحت سلة التسوق." : "Opened your cart."; }
      else if (/order|طلب/.test(q)) { setActiveDockTab("orders"); reply = isAr ? "إليك طلباتك." : "Here are your orders."; }
      else if (/favorit|مفضل/.test(q)) { setActiveDockTab("favorites"); reply = isAr ? "هذه المفضلة لديك." : "Here are your favorites."; }
      else if (/search|بحث|find/.test(q)) { setActiveDockTab("search"); reply = isAr ? "فتحت البحث." : "Opened search."; }
      else if (/profile|account|حساب/.test(q)) { setActiveDockTab("profile"); reply = isAr ? "هذا حسابك." : "Here's your profile."; }
      else if (/theme|dark|light|وضع/.test(q)) { toggleTheme(); reply = isAr ? "تم تبديل الوضع." : "Toggled theme."; }
      else if (/store|متجر/.test(q)) { setActiveDockTab("stores"); reply = isAr ? "هذه المتاجر." : "Here are the stores."; }
      else reply = isAr ? "يمكنني فتح: السلة، الطلبات، المفضلة، البحث، الحساب، المتاجر، أو تبديل الوضع." : "I can open: cart, orders, favorites, search, profile, stores, or switch theme.";
      setChatFeed((prev) => [...prev, { role: "ai", text: reply }]);
    }, 400);
  };

  /* ─── Cart operations ─── */
  const handleAddToCart = (
    product: StoreProduct | { id: string; title: string; price: number; image: string; storeId?: string; storeName?: string; currency?: string },
    variant?: { size?: string; color?: string; qty?: number }
  ) => {
    playSound("pop");
    const addQty = variant?.qty && variant.qty > 0 ? variant.qty : 1;
    const targetStoreId = (product as any).storeId || currentStore.id;
    const targetStoreName = (product as any).storeName || currentStore.name;
    const itemCurrency = (product as any).currency || currentStore.currency;
    const nextCart = { ...universalCart };
    if (!nextCart[targetStoreId]) {
      nextCart[targetStoreId] = { name: targetStoreName, currency: itemCurrency, items: [], subtotal: 0 };
    }
    const itemSku = variant?.size || variant?.color ? `${product.id}_${variant?.size || ""}_${variant?.color || ""}` : product.id;
    const existing = nextCart[targetStoreId].items.find((i) => (i.sku || i.id) === itemSku);
    if (existing) existing.qty += addQty;
    else
      nextCart[targetStoreId].items.push({
        id: product.id,
        sku: itemSku,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: addQty,
        size: variant?.size,
        color: variant?.color,
        currency: itemCurrency,
      });
    nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce((s, i) => s + i.price * i.qty, 0);
    saveCart(nextCart);
    showToast(`${product.title} ${isAr ? "تمت إضافته إلى السلة" : "added to FastCart"}`);
    setIsDockOpen(true);
    setActiveDockTab("cart");
  };

  const handleQuickBuy = (product: StoreProduct, variant?: { size?: string; color?: string; qty?: number }) => {
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
      if (nextCart[targetStoreId].items.length === 0) delete nextCart[targetStoreId];
    }
    if (nextCart[targetStoreId]) {
      nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce((s, i) => s + i.price * i.qty, 0);
    }
    saveCart(nextCart);
  };

  const handleRemoveItem = (targetStoreId: string, productId: string) => {
    playSound("switch");
    const nextCart = { ...universalCart };
    if (!nextCart[targetStoreId]) return;
    nextCart[targetStoreId].items = nextCart[targetStoreId].items.filter((i) => i.id !== productId);
    if (nextCart[targetStoreId].items.length === 0) delete nextCart[targetStoreId];
    else nextCart[targetStoreId].subtotal = nextCart[targetStoreId].items.reduce((s, i) => s + i.price * i.qty, 0);
    saveCart(nextCart);
  };

  const handlePlaceOrder = () => {
    if (totalItemsCount === 0) return;
    setIsSubmitting(true);
    playSound("cash");
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const allStoresInCart = Object.keys(universalCart);
      const unifiedOrder: ViewerOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: "Pending",
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
      try {
        const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
        existing.unshift(unifiedOrder);
        localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));
        const viewerKey = `matager_orders_${viewer.id}`;
        const viewerOrdersList = JSON.parse(localStorage.getItem(viewerKey) || "[]");
        viewerOrdersList.unshift(unifiedOrder);
        localStorage.setItem(viewerKey, JSON.stringify(viewerOrdersList.slice(0, 20)));
      } catch (_) { }
      saveCart({});
      setViewerOrders((prev) => [unifiedOrder, ...prev]);
      window.dispatchEvent(new CustomEvent("matager:new_order", { detail: unifiedOrder }));
      window.dispatchEvent(new CustomEvent("matager:storefront_order", { detail: unifiedOrder }));
      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("matager_pos_sync");
          bc.postMessage({ type: "ONLINE_FASTCART_ORDER", order: unifiedOrder, storeId: currentStore.id, timestamp: Date.now() });
          bc.close();
        }
      } catch (_) { }
      setIsSubmitting(false);
      setPlacedOrderInfo(unifiedOrder);
      setActiveDockTab("orders");
      showToast(isAr ? `تم تأكيد الطلب ${orderId}!` : `Order ${orderId} placed!`);
    }, 1000);
  };

  const handleTogglePresentation = () => {
    playSound("switch");
    setIsGalleryActive((p) => !p);
  };

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "All") return currentStore.products;
    return currentStore.products.filter((p) => p.category === categoryFilter);
  }, [categoryFilter, currentStore]);

  /* Split filtered products into two rows for the dual-infinite-scroll layout */
  const productRows = useMemo(() => {
    if (filteredProducts.length === 0) return { row1: [], row2: [] };
    const mid = Math.ceil(filteredProducts.length / 2);
    return {
      row1: filteredProducts.slice(0, mid),
      row2: filteredProducts.slice(mid),
    };
  }, [filteredProducts]);

  const partnerStore = useMemo(() => allStores.find((s) => s.id !== currentStore.id) || allStores[0], [allStores, currentStore]);

  const viewerEmail = (viewer as any).email || `${viewer.id}@matager.store`;

  /* ─── Open product in dock ─── */
  const openProductInDock = (prod: any) => {
    playSound("pop");
    if (activeDockTab !== "product") {
      setPreviousDockTab(activeDockTab);
    }
    setSelectedProduct(prod as StoreProduct);
    setSelectedSize("");
    setSelectedColor("");
    setProductQty(1);
    setActiveDockTab("product");
    setIsDockOpen(true);
  };

  /* ─── Dock Tab definitions ─── */
  const dockTabs = [
    { id: "hub" as DockTab, icon: LayoutGrid, label: isAr ? "الرئيسية" : "Hub", badge: 0 },
    { id: "cart" as DockTab, icon: ShoppingBag, label: isAr ? "السلة" : "Cart", badge: totalItemsCount },
    { id: "checkout" as DockTab, icon: CreditCard, label: isAr ? "الدفع" : "Pay", badge: 0 },
    { id: "orders" as DockTab, icon: Package, label: isAr ? "الطلبات" : "Orders", badge: displayOrders.length },
    { id: "favorites" as DockTab, icon: Heart, label: isAr ? "المفضلة" : "Saved", badge: viewerFavorites.length },
    { id: "notifications" as DockTab, icon: Bell, label: isAr ? "الإشعارات" : "Alerts", badge: unreadNotifCount },
    { id: "search" as DockTab, icon: Search, label: isAr ? "بحث" : "Search", badge: 0 },
    { id: "stores" as DockTab, icon: Store, label: isAr ? "المتاجر" : "Stores", badge: 0 },
    { id: "categories" as DockTab, icon: FolderOpen, label: isAr ? "الفئات" : "Categories", badge: 0 },
    { id: "gallery" as DockTab, icon: Grid3x3, label: isAr ? "المعرض" : "Gallery", badge: 0 },
    { id: "profile" as DockTab, icon: User, label: isAr ? "الحساب" : "Profile", badge: 0 },
  ];

  /* ─── Search results ─── */
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { products: [], categories: [], stores: [], orders: [] };
    return {
      products: allProducts.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 20),
      categories: Array.from(new Set(allStores.flatMap((s) => s.categories || []))).filter((c) => c.toLowerCase().includes(q)),
      stores: allStores.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20),
      orders: displayOrders.filter((o) => o.id.toLowerCase().includes(q)),
    };
  }, [searchQuery, allProducts, allStores, displayOrders]);

  /* ─── Product detail helpers ─── */
  const productSizes = (selectedProduct as any)?.sizes || DEFAULT_SIZES;
  const productColors = (selectedProduct as any)?.colors || DEFAULT_COLORS;
  const productDescription =
    (selectedProduct as any)?.description ||
    (isAr
      ? "منتج عالي الجودة مختار بعناية من متجرنا. تصميم عصري وخامة متينة."
      : "A carefully curated, high-quality piece from our store. Modern design with durable craftsmanship.");

  return (
    <div
      className={`min-h-screen text-[var(--color-text-primary)] transition-colors duration-300 font-sans ${theme === "dark" ? "bg-[#060608]" : "bg-slate-50"}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[var(--color-canvas)]/85 border-b border-[var(--color-border-subtle)] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={buildDashboardUrl(currentStore.id)} className="flex items-center gap-2 group" title="Return to Merchant Admin Dashboard">
            <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              M
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-tight block leading-none">Matager OS</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{currentStore.name}</span>
            </div>
          </Link>

          <span className="w-px h-4 bg-white/10 hidden sm:block"></span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
              className="px-2.5 py-1 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all text-blue-400"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center shrink-0">
                <img src={currentStore.logo} alt={currentStore.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="max-w-[120px] truncate">{currentStore.name}</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {showStoreSwitcher && (
              <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 w-64 rounded-[8px] bg-neutral-900 border border-white/15 p-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-2 py-1 text-[10px] uppercase text-white/50 border-b border-white/10 mb-1">
                  {isAr ? "المتاجر المتاحة" : "Platform Stores"}
                </div>
                <div className="space-y-1">
                  {allStores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => switchStore(store.id)}
                      className={`w-full p-2 rounded-[8px] text-left rtl:text-right text-xs flex items-center justify-between transition-all ${store.id === currentStore.id ? "bg-blue-600 text-white font-bold" : "hover:bg-white/5 text-white/80"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={store.logo} alt={store.name} className="w-5 h-5 rounded-md object-cover bg-black" />
                        <div>
                          <p className="truncate font-bold leading-none">{store.name}</p>
                          <p className="text-[10px] opacity-60">
                            {store.city}, {store.country}
                          </p>
                        </div>
                      </div>
                      {store.id === currentStore.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>POS Online</span>
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveDockTab("profile");
              setIsDockOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-[8px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[100px] truncate">
              {viewer.id.startsWith("usr_viewer_") ? `#${viewer.id.slice(-4)}` : viewer.id}
            </span>
          </button>

          <button
            type="button"
            onClick={handleTogglePresentation}
            className={`px-3 py-1.5 rounded-[8px] border text-xs font-bold transition-all flex items-center gap-2 ${isGalleryActive
              ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/25"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-[var(--color-text-primary)]"
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGalleryActive ? (isAr ? "وضع السلة" : "FastCart") : isAr ? "معرض" : "3D Gallery"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">{isAr ? "EN" : "عربي"}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          <Link
            href={buildCashierUrl(currentStore.id)}
            target="_blank"
            className="px-3 py-1.5 rounded-[8px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all hidden md:flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS</span>
          </Link>
        </div>
      </header>

      {/* VIEWER MODAL */}
      {showViewerModal && (
        <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Viewer Identity</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewerModal(false)}
                className="w-6 h-6 rounded-[8px] bg-white/5 flex items-center justify-center text-white/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-white/60">Each viewer has an independent cart, favorites, addresses, and orders.</p>
            <div className="p-3 rounded-[8px] bg-white/5 border border-white/10 text-[11px] space-y-1">
              <div>
                <span className="text-white/50">Viewer ID:</span> <strong className="text-blue-400">{viewer.id}</strong>
              </div>
              <div>
                <span className="text-white/50">Orders:</span> <strong className="text-white">{displayOrders.length}</strong>
              </div>
              <div>
                <span className="text-white/50">Favorites:</span> <strong className="text-white">{viewerFavorites.length}</strong>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">Change Viewer ID</label>
              <input
                type="text"
                placeholder="e.g. omar_vip"
                value={customViewerInput}
                onChange={(e) => setCustomViewerInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-[8px] p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => applyViewerChange(`usr_viewer_${Math.random().toString(36).substring(2, 7)}`)}
                className="flex-1 py-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
              >
                Random ID
              </button>
              <button
                type="button"
                onClick={() => applyViewerChange(customViewerInput || viewer.id)}
                className="flex-1 py-2 rounded-[8px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN STOREFRONT */}
      <main
        className="w-full max-w-full mx-auto p-0 space-y-8 transition-all duration-700 ease-out"
        style={{
          transform: isGalleryActive ? "scale(0.95) translateZ(-50px)" : "scale(1) translateZ(0)",
          filter: isGalleryActive ? "blur(4px) brightness(0.7)" : "none",
          pointerEvents: isGalleryActive ? "none" : "auto",
        }}
      >
        <section id="store-hero" className="relative w-full rounded-none border-0 overflow-hidden bg-transparent">
          <div className="h-48 sm:h-64 md:h-72 w-full overflow-hidden relative">
            <img src={currentStore.banner} alt={currentStore.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>
          <div className="px-4 sm:px-8 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 bg-white dark:bg-neutral-900 shadow-xl shrink-0">
                <img src={currentStore.logo} alt={currentStore.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentStore.name}</h1>
                  {currentStore.verified && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white/80 text-[10px] font-bold">
                    {currentStore.categories?.[1] || currentStore.categories?.[0] || "Clothing"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white/70 max-w-xl">{isAr ? currentStore.taglineAr : currentStore.tagline}</p>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span>
                    <strong className="text-slate-900 dark:text-white">{currentStore.productsCount}</strong>{" "}
                    <span className="text-slate-500 dark:text-white/50">{isAr ? "منتج" : "products"}</span>
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{currentStore.followersCount}</strong>{" "}
                    <span className="text-slate-500 dark:text-white/50">{isAr ? "متابع" : "followers"}</span>
                  </span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">{currentStore.rating} ★</span>
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {currentStore.city}, {currentStore.country}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {partnerStore && (
                <button
                  type="button"
                  onClick={() => handleAddToCart(partnerStore.products[0])}
                  className="flex-1 md:flex-none px-4 py-2 rounded-[8px] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="truncate">{isAr ? `إضافة من ${partnerStore.name}` : `Add From ${partnerStore.name}`}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  toggleFollowStore(currentStore.id);
                }}
                className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold flex items-center justify-center gap-2 shadow-lg ${viewerFollowedStores.includes(currentStore.id)
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-500"
                  : "bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white"
                  }`}
              >
                <span>
                  {viewerFollowedStores.includes(currentStore.id)
                    ? isAr
                      ? "متابَع"
                      : "Following"
                    : isAr
                      ? "متابعة"
                      : "Follow"}
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 mb-[70px]">
          <div id="category-bar" className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 pb-1">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {currentStore.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all duration-200 ${categoryFilter === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-[var(--color-text-secondary)]"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* <div className="text-xs text-slate-500 dark:text-[var(--color-text-muted)] flex items-center gap-2">
              <span>
                {filteredProducts.length} {isAr ? "منتجات معروضة" : "Products Live"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span className="text-blue-500 dark:text-blue-400 font-bold">{currentStore.currency}</span>
            </div> */}
          </div>

          {/* Dual infinite-scroll rows — edge-to-edge, no gap */}
          <div className="space-y-0">
            {productRows.row1.length > 0 && (
              <div className="product-row-animate">
                <InfiniteProductRow
                  products={productRows.row1}
                  onOpen={openProductInDock}
                  viewerFavorites={viewerFavorites}
                  onToggleFavorite={toggleFavorite}
                  autoplay
                />
              </div>
            )}
            {productRows.row2.length > 0 && (
              <div className="product-row-animate">
                <InfiniteProductRow
                  products={productRows.row2}
                  onOpen={openProductInDock}
                  viewerFavorites={viewerFavorites}
                  onToggleFavorite={toggleFavorite}
                  autoplay
                />
              </div>
            )}
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center text-white/40 space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-bold text-white">
                  {isAr ? "لا توجد منتجات في هذه الفئة" : "No products in this category"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3D GALLERY OVERLAY */}
      {isGalleryActive && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-3xl p-4 sm:p-8 flex flex-col items-center animate-in fade-in duration-500"
        >
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-xs uppercase text-blue-400 font-bold">3D Bento · {currentStore.name}</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentStore.name} Showcase</h2>
            </div>
            <button
              type="button"
              onClick={handleTogglePresentation}
              className="px-4 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{isAr ? "العودة" : "Return to FastCart"}</span>
            </button>
          </div>
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {currentStore.products.slice(0, 5).map((prod, idx) => (
              <div
                key={prod.id}
                onClick={() => {
                  setIsGalleryActive(false);
                  openProductInDock(prod);
                }}
                className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/15 cursor-pointer min-h-[260px] ${idx === 0 ? "col-span-1 md:col-span-2 row-span-2 min-h-[360px]" : "col-span-1 row-span-1"
                  }`}
              >
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">
                    {currentStore.name} · {prod.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">{prod.title}</h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-sm font-black text-white">
                      {prod.currency || currentStore.currency} {prod.price.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BACKDROP */}
      <div
        onClick={() => setIsDockOpen(false)}
        className={`fixed inset-0 z-[9980] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isDockOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* EXPANDED UNIVERSAL DOCK */}
      <aside
        className={`fixed left-1/2 z-[9990] w-[min(430px,calc(100vw-28px))] max-h-[86vh] rounded-[30px] border border-[var(--glass-border,rgba(255,255,255,0.12))] overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)] ${theme === "dark"
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
            {activeDockTab === "product" ? (
              <button
                onClick={() => {
                  playSound("switch");
                  setActiveDockTab(previousDockTab);
                }}
                className="w-8 h-8 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-white shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center overflow-hidden shrink-0">
                <img src={currentStore.logo} alt={currentStore.name} className="w-full h-full object-cover rounded-full" />
              </div>
            )}
            <div className="truncate">
              <span className="truncate text-[11px] font-bold block leading-tight">
                {activeDockTab === "product" ? (isAr ? "تفاصيل المنتج" : "Product Detail") : isAr ? "حسابي" : "My Account"}
              </span>
              <span className="text-[9px] text-white/40 block leading-tight truncate">
                {activeDockTab === "product" && selectedProduct ? selectedProduct.title : viewer.name || viewer.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-6 h-6 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              {theme === "dark" ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-blue-500" />}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className="px-1.5 py-0.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-[9px] font-bold"
            >
              {isAr ? "EN" : "عربي"}
            </button>
            <button
              type="button"
              onClick={() => setIsDockOpen(!isDockOpen)}
              className="w-6 h-6 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              {isDockOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto min-h-[280px]">
          {/* Sticky tab bar (hidden on product view) */}
          {activeDockTab !== "product" && (
            <div
              className={`sticky top-0 z-20 px-2 pt-2 pb-1 border-b border-white/10 ${theme === "dark" ? "bg-[#141416]/95 backdrop-blur-xl" : "bg-white/95 backdrop-blur-xl"
                }`}
            >
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {dockTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveDockTab(tab.id);
                      playSound("pop");
                    }}
                    className={`relative px-2.5 py-1.5 rounded-[8px] text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${activeDockTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-blue-500 text-white text-[8px] font-black flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className={activeDockTab === "product" ? "p-0" : "p-3"}>
            {/* ───────────── PRODUCT DETAIL (full in dock) ───────────── */}
            {activeDockTab === "product" && selectedProduct && (
              <div className="space-y-0">
                {/* Large image */}
                <div className="relative w-full aspect-square overflow-hidden bg-black/40">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedProduct.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-bold">
                      {selectedProduct.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/85 hover:scale-110 transition-all"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${viewerFavorites.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""
                        }`}
                    />
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {/* Header */}
                  <div>
                    <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider truncate">
                      {(selectedProduct as any).storeName || currentStore.name} · {selectedProduct.category}
                    </p>
                    <h3 className="text-base font-black text-white mt-1 leading-snug">
                      {selectedProduct.title}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-white">
                        {selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-white/50 font-bold">
                        {(selectedProduct as any).currency || currentStore.currency}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-[11px] text-white/30 line-through">
                          {selectedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {selectedProduct.originalPrice && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          -
                          {Math.round(
                            ((selectedProduct.originalPrice - selectedProduct.price) /
                              selectedProduct.originalPrice) *
                            100
                          )}
                          %
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {selectedProduct.stock > 0
                          ? `${selectedProduct.stock} ${isAr ? "متوفر" : "in stock"}`
                          : isAr
                            ? "نفد"
                            : "Out of stock"}
                      </span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/50">
                        {isAr ? "شحن مجاني" : "Free Express"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/10">
                    <p className="text-[9px] uppercase font-bold text-white/50 mb-1">
                      {isAr ? "الوصف" : "Description"}
                    </p>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      {productDescription}
                    </p>
                  </div>

                  {/* Size selector */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-white/50 mb-1.5">
                      {isAr ? "المقاس" : "Size"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {productSizes.map((sz: string) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[36px] h-8 px-2 rounded-[8px] text-[10px] font-bold transition-all ${selectedSize === sz
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                            }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-white/50 mb-1.5">
                      {isAr ? "اللون" : "Color"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {productColors.map((clr: string) => {
                        const colorHex: Record<string, string> = {
                          Black: "#111111",
                          White: "#ffffff",
                          Red: "#ef4444",
                          Blue: "#3b82f6",
                          Navy: "#172554",
                          Gray: "#9ca3af",
                          Beige: "#e5d5b7",
                          Green: "#22c55e",
                        };
                        const isActive = selectedColor === clr;
                        return (
                          <button
                            key={clr}
                            onClick={() => setSelectedColor(clr)}
                            className={`h-8 pl-1 pr-2 rounded-[8px] text-[10px] font-bold flex items-center gap-1.5 transition-all ${isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                              : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                              }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border ${clr === "White" ? "border-white/30" : "border-white/20"
                                }`}
                              style={{ background: colorHex[clr] || "#9ca3af" }}
                            />
                            {clr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-white/50 mb-1.5">
                      {isAr ? "الكمية" : "Quantity"}
                    </p>
                    <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-[8px] p-1">
                      <button
                        type="button"
                        onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-[6px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-white min-w-[28px] text-center">{productQty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProductQty((q) =>
                            Math.min(selectedProduct.stock || 999, q + 1)
                          )
                        }
                        className="w-7 h-7 rounded-[6px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart(selectedProduct, {
                          size: selectedSize || productSizes[0],
                          color: selectedColor || productColors[0],
                          qty: productQty,
                        })
                      }
                      className="py-3 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isAr ? "أضف للسلة" : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickBuy(selectedProduct, {
                          size: selectedSize || productSizes[0],
                          color: selectedColor || productColors[0],
                          qty: productQty,
                        })
                      }
                      className="py-3 rounded-[8px] bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {isAr ? "شراء سريع" : "Buy Now"}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-[8px] bg-white/[0.03] border border-white/10">
                      <p className="text-[8px] uppercase font-bold text-white/40 mb-0.5">
                        {isAr ? "الشحن" : "Delivery"}
                      </p>
                      <p className="text-[10px] font-bold text-white/80">
                        {isAr ? "شحن مجاني • 2-4 أيام" : "Free Express • 2-4 days"}
                      </p>
                    </div>
                    <div className="p-2 rounded-[8px] bg-white/[0.03] border border-white/10">
                      <p className="text-[8px] uppercase font-bold text-white/40 mb-0.5">
                        {isAr ? "الإرجاع" : "Returns"}
                      </p>
                      <p className="text-[10px] font-bold text-white/80">
                        {isAr ? "خلال 14 يوم" : "14-day returns"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HUB */}
            {activeDockTab === "hub" && (
              <div className="space-y-3">
                <div className="p-3 rounded-[8px] bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/20">
                  <p className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">{isAr ? "مرحباً بعودتك" : "Welcome back"}</p>
                  <h3 className="text-sm font-black text-white mt-0.5">{viewer.name || "Guest User"}</h3>
                  <p className="text-[10px] text-white/50 truncate">{viewerEmail}</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-[8px] bg-white/[0.04] border border-white/10">
                  <div className="text-center">
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "مفضل" : "Saved"}</p>
                    <p className="text-sm font-black text-white">{viewerFavorites.length}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "بالسلة" : "In cart"}</p>
                    <p className="text-sm font-black text-white">{totalItemsCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "طلبات" : "Orders"}</p>
                    <p className="text-sm font-black text-white">{displayOrders.length}</p>
                  </div>
                </div>

                <div className="rounded-[8px] bg-white/[0.03] border border-white/10 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold text-white">{isAr ? "اسأل Matager AI" : "Ask Matager AI"}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[8px] font-bold ml-auto">Local</span>
                  </div>
                  <div className="max-h-[100px] overflow-y-auto p-2 space-y-1.5">
                    {chatFeed.map((m, i) => (
                      <div
                        key={i}
                        className={`text-[10px] p-1.5 rounded-[8px] ${m.role === "ai" ? "bg-white/5 text-white/80" : "bg-blue-500/20 text-white ml-6"
                          }`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="p-1.5 border-t border-white/10 flex gap-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                      placeholder={isAr ? "اسألني أي شيء..." : "Ask me anything…"}
                      className="flex-1 bg-black/40 border border-white/10 rounded-[8px] px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleChatSend}
                      className="w-7 h-7 rounded-[8px] bg-blue-500 hover:bg-blue-400 flex items-center justify-center"
                    >
                      <Send className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CART */}
            {activeDockTab === "cart" && (
              <div>
                {Object.keys(universalCart).length === 0 ? (
                  <div className="py-10 text-center text-white/40 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-white">{isAr ? "سلتك فارغة" : "Your cart is empty"}</p>
                    <p className="text-xs">{isAr ? "تصفح المنتجات أعلاه" : "Browse products above"}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(universalCart).map(([storeId, store]) => (
                      <div key={storeId} className="rounded-[8px] border border-white/10 bg-white/[0.03] overflow-hidden">
                        <div className="px-3.5 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-bold text-white">{store.name}</span>
                            <span className="px-1.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                              {store.items.length}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-blue-400">
                            {store.currency} {store.subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 divide-y divide-white/5">
                          {store.items.map((item) => (
                            <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-[8px] object-cover bg-black/60 shrink-0 border border-white/10"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                  <p className="text-[10px] text-white/50">
                                    {item.currency || store.currency} {item.price.toLocaleString()}
                                    {(item.size || item.color) && (
                                      <span className="text-white/40">
                                        {" "}
                                        · {[item.size, item.color].filter(Boolean).join(" / ")}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-[8px] p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(storeId, item.id, -1)}
                                    className="w-5 h-5 flex items-center justify-center text-white/70"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold px-1.5 text-white">{item.qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(storeId, item.id, 1)}
                                    className="w-5 h-5 flex items-center justify-center text-white/70"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(storeId, item.id)}
                                  className="text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="p-3.5 rounded-[8px] bg-white/[0.04] border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs text-white/70">
                        <span>{isAr ? "المتاجر" : "Stores"}</span>
                        <span className="font-bold text-white">{Object.keys(universalCart).length}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                        <span>{isAr ? "الإجمالي" : "Grand Total"}</span>
                        <span className="text-blue-400">
                          {currentStore.currency} {grandTotal.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveDockTab("checkout")}
                        className="w-full mt-2 py-2.5 rounded-[8px] bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <span>{isAr ? "إتمام الشراء" : "Checkout All Stores"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHECKOUT */}
            {activeDockTab === "checkout" && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Viewer:
                  </span>
                  <strong className="text-white">{viewer.id}</strong>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    {isAr ? "الاسم" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    {isAr ? "الهاتف" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    {isAr ? "العنوان" : "Address"}
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    {isAr ? "طريقة الدفع" : "Payment"}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-[8px] p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Visa / MasterCard">Visa / MasterCard</option>
                    <option value="Mada / Apple Pay">Mada / Apple Pay</option>
                    <option value="Mobile Wallet">Mobile Wallet</option>
                  </select>
                </div>
                <div className="p-3 rounded-[8px] bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 block">{isAr ? "المبلغ" : "Amount"}</span>
                    <span className="text-sm font-black text-blue-400">
                      {currentStore.currency} {grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure
                    </span>
                    <span className="text-[9px] text-white/40">Syncs with {currentStore.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting || totalItemsCount === 0}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 rounded-[8px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{isAr ? "جاري المعالجة..." : "Processing..."}</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>
                        {isAr
                          ? "تأكيد الطلب"
                          : `Confirm & Pay (${currentStore.currency} ${grandTotal.toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ORDERS (4-stop tracking slider) */}
            {activeDockTab === "orders" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-white/60">
                    {displayOrders.length} {isAr ? "طلب" : "orders"}
                  </span>
                  <button onClick={() => setActiveDockTab("cart")} className="text-[10px] text-blue-400 font-bold hover:underline">
                    {isAr ? "تسوق المزيد" : "Shop more"}
                  </button>
                </div>

                {displayOrders.length === 0 ? (
                  <div className="py-10 text-center text-white/40 space-y-2">
                    <Package className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-white">{isAr ? "لا توجد طلبات" : "No orders yet"}</p>
                  </div>
                ) : (
                  displayOrders.map((order) => {
                    const expanded = expandedOrderId === order.id;
                    const currentStop = statusToStop(order.status);
                    const terminal = isTerminal(order.status);
                    const canceled = order.status === "Canceled";
                    const returned = order.status === "Returned";
                    const canCancelNow = isCancelable(order.status);
                    const canReturnNow = isReturnable(order.status);
                    const mustWait = order.status === "Shipped";

                    const statusColor = canceled
                      ? "bg-red-500/20 text-red-300"
                      : returned
                        ? "bg-purple-500/20 text-purple-300"
                        : currentStop === 3
                          ? "bg-emerald-500/20 text-emerald-300"
                          : currentStop >= 1
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-amber-500/20 text-amber-300";

                    const statusLabel = isAr
                      ? ({
                        Pending: "قيد الانتظار",
                        Accepted: "قيد التحضير",
                        Processing: "قيد التحضير",
                        Shipped: "قيد الشحن",
                        Delivered: "تم التوصيل",
                        Completed: "تم التوصيل",
                        Canceled: "ملغي",
                        Returned: "مرتجع",
                      } as Record<string, string>)[order.status] || order.status
                      : ({
                        Processing: "Accepted",
                        Completed: "Delivered",
                      } as Record<string, string>)[order.status] || order.status;

                    return (
                      <div key={order.id} className="rounded-[8px] bg-white/[0.03] border border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                          className="w-full p-3 text-left rtl:text-right flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColor}`}>
                                {statusLabel}
                              </span>
                              <span className="text-[10px] font-bold text-white/60">#{order.id}</span>
                            </div>
                            <p className="text-xs font-bold text-white truncate">
                              {order.items_count} {isAr ? "عنصر" : "items"} · {order.currency}{" "}
                              {order.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-white/40 shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {expanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                            {terminal ? (
                              <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/10 flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${canceled ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                                    }`}
                                >
                                  {canceled ? <X className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-white">
                                    {canceled
                                      ? isAr
                                        ? "تم إلغاء الطلب"
                                        : "Order canceled"
                                      : isAr
                                        ? "تم تسجيل طلب الاسترجاع"
                                        : "Return requested"}
                                  </p>
                                  <p className="text-[9px] text-white/50 truncate">
                                    {canceled
                                      ? isAr
                                        ? "لم يعد التتبع متاحًا"
                                        : "Tracking no longer active"
                                      : isAr
                                        ? "سيتواصل معك المتجر قريبًا"
                                        : "The store will contact you shortly"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-[8px] bg-white/[0.03] border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] uppercase font-bold text-white/50">
                                    {isAr ? "تتبع الطلب" : "Order tracking"}
                                  </span>
                                  <span className="text-[9px] font-bold text-blue-400">{currentStop + 1}/4</span>
                                </div>

                                <div className="relative pt-1 pb-1">
                                  <div className="absolute top-[10px] left-[12.5%] right-[12.5%] h-0.5 bg-white/10 rounded-full" />
                                  <div
                                    className="absolute top-[10px] left-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(currentStop / 3) * 75}%` }}
                                  />
                                  <div className="relative grid grid-cols-4">
                                    {ORDER_STOPS.map((stop, i) => {
                                      const done = i < currentStop;
                                      const current = i === currentStop;
                                      const StopIcon = stop.icon;
                                      return (
                                        <div key={stop.key} className="flex flex-col items-center gap-1">
                                          <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${current
                                              ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/40 scale-110"
                                              : done
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "bg-[#141416] border-white/20 text-white/30"
                                              }`}
                                          >
                                            {done ? <Check className="w-2.5 h-2.5" /> : <StopIcon className="w-2.5 h-2.5" />}
                                          </div>
                                          <span
                                            className={`text-[8px] font-bold text-center leading-tight ${current
                                              ? "text-blue-400"
                                              : done
                                                ? "text-emerald-400"
                                                : "text-white/40"
                                              }`}
                                          >
                                            {isAr ? stop.labelAr : stop.labelEn}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="p-2 rounded-[8px] bg-black/30">
                                <p className="text-white/40 uppercase text-[8px] font-bold mb-0.5">
                                  {isAr ? "الشحن إلى" : "Ship to"}
                                </p>
                                <p className="text-white/80 truncate">{order.shipping_address}</p>
                              </div>
                              <div className="p-2 rounded-[8px] bg-black/30">
                                <p className="text-white/40 uppercase text-[8px] font-bold mb-0.5">
                                  {isAr ? "الدفع" : "Payment"}
                                </p>
                                <p className="text-white/80 truncate">{order.payment_method}</p>
                              </div>
                            </div>

                            {order.stores?.map((s: any) => (
                              <div key={s.storeId} className="p-2 rounded-[8px] bg-white/[0.03]">
                                <p className="text-[9px] font-bold text-blue-400 mb-1">{s.name}</p>
                                {s.items?.map((it: any, i: number) => (
                                  <div key={i} className="flex items-center gap-2 py-0.5">
                                    <img src={it.image} alt={it.title} className="w-6 h-6 rounded object-cover" />
                                    <span className="text-[10px] text-white/70 flex-1 truncate">{it.title}</span>
                                    <span className="text-[10px] text-white/50">×{it.qty}</span>
                                  </div>
                                ))}
                              </div>
                            ))}

                            <div className="flex gap-1.5">
                              {canCancelNow && (
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  className="flex-1 py-2 rounded-[8px] bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold flex items-center justify-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  {isAr ? "إلغاء الطلب" : "Cancel order"}
                                </button>
                              )}
                              {mustWait && (
                                <div className="flex-1 py-2 rounded-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {isAr ? "في انتظار التوصيل" : "Awaiting delivery"}
                                </div>
                              )}
                              {canReturnNow && (
                                <button
                                  onClick={() => requestReturn(order.id)}
                                  className="flex-1 py-2 rounded-[8px] bg-purple-500/15 border border-purple-500/25 text-purple-400 text-[10px] font-bold flex items-center justify-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  {isAr ? "طلب استرجاع" : "Request return"}
                                </button>
                              )}
                              {terminal && (
                                <div className="flex-1 py-2 rounded-[8px] bg-white/5 text-white/40 text-[10px] font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {isAr ? "مغلق" : "Closed"}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* FAVORITES */}
            {activeDockTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-white/60">
                    {viewerFavorites.length} {isAr ? "مفضلة" : "saved"}
                  </span>
                </div>
                {viewerFavorites.length === 0 ? (
                  <div className="py-10 text-center text-white/40 space-y-2">
                    <Heart className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-white">{isAr ? "لا توجد مفضلات" : "No favorites yet"}</p>
                    <p className="text-xs">{isAr ? "اضغط على القلب لحفظ المنتجات" : "Tap the heart to save products"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {viewerFavorites.map((favId) => {
                      const prod = findProduct(favId);
                      if (!prod) return null;
                      return (
                        <div key={favId} className="rounded-[8px] bg-white/[0.03] border border-white/10 overflow-hidden">
                          <div className="relative aspect-square overflow-hidden bg-black/40">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openProductInDock(prod)}
                            />
                            <button
                              onClick={() => toggleFavorite(favId)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                            >
                              <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <div className="p-2">
                            <p
                              className="text-[10px] font-bold text-white truncate cursor-pointer"
                              onClick={() => openProductInDock(prod)}
                            >
                              {prod.title}
                            </p>
                            <p className="text-[10px] text-blue-400 font-bold">
                              {prod.currency || currentStore.currency} {prod.price.toLocaleString()}
                            </p>
                            <button
                              onClick={() => openProductInDock(prod)}
                              className="mt-1 w-full py-1 rounded bg-blue-600 text-white text-[9px] font-bold"
                            >
                              {isAr ? "عرض التفاصيل" : "View detail"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeDockTab === "notifications" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-white/60">
                    {unreadNotifCount} {isAr ? "غير مقروء" : "unread"}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[9px] px-2 py-1 rounded bg-white/5 text-white/70 font-bold"
                    >
                      {isAr ? "قراءة الكل" : "Mark all read"}
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[9px] px-2 py-1 rounded bg-red-500/15 text-red-400 font-bold"
                    >
                      {isAr ? "مسح" : "Clear"}
                    </button>
                  </div>
                </div>
                {viewerNotifications.length === 0 ? (
                  <div className="py-10 text-center text-white/40 space-y-2">
                    <Bell className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-white">{isAr ? "لا توجد إشعارات" : "No notifications"}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {viewerNotifications.map((n) => {
                      const Icon =
                        n.type === "order" ? Package : n.type === "promo" ? Tag : n.type === "store" ? Store : Bell;
                      return (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-[8px] border ${n.read ? "bg-white/[0.02] border-white/5" : "bg-blue-500/10 border-blue-500/20"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${n.read ? "bg-white/5 text-white/40" : "bg-blue-500/20 text-blue-400"
                                }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[11px] font-bold text-white truncate">{n.title}</p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                              </div>
                              <p className="text-[10px] text-white/60 line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-white/30 mt-0.5">{new Date(n.time).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SEARCH */}
            {activeDockTab === "search" && (
              <div className="space-y-2">
                <div className="flex gap-1 overflow-x-auto scrollbar-none">
                  {(["products", "categories", "stores", "orders"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSearchMode(mode)}
                      className={`px-2.5 py-1 rounded-[8px] text-[10px] font-bold whitespace-nowrap ${searchMode === mode ? "bg-blue-600 text-white" : "bg-white/5 text-white/60"
                        }`}
                    >
                      {isAr
                        ? ({ products: "منتجات", categories: "فئات", stores: "متاجر", orders: "طلبات" } as any)[mode]
                        : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 left-2.5 rtl:left-auto rtl:right-2.5 w-3 h-3 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "ابحث..." : `Search ${searchMode}...`}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                {searchMode === "products" && (
                  <div className="space-y-1">
                    {(searchQuery ? searchResults.products : allProducts.slice(0, 8)).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openProductInDock(p)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-[8px] hover:bg-white/5 text-left rtl:text-right"
                      >
                        <img src={p.image} alt={p.title} className="w-8 h-8 rounded object-cover bg-black/40" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white truncate">{p.title}</p>
                          <p className="text-[9px] text-white/40">{p.storeName}</p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-400">
                          {p.currency} {p.price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchMode === "categories" && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {(searchQuery
                      ? searchResults.categories
                      : Array.from(new Set(allStores.flatMap((s) => s.categories || [])))
                    ).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCategoryFilter(c);
                          setActiveDockTab("gallery");
                        }}
                        className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-left rtl:text-right"
                      >
                        <p className="text-[11px] font-bold text-white truncate">{c}</p>
                      </button>
                    ))}
                  </div>
                )}
                {searchMode === "stores" && (
                  <div className="space-y-1">
                    {(searchQuery ? searchResults.stores : allStores).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => switchStore(s.id)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-[8px] hover:bg-white/5 text-left rtl:text-right"
                      >
                        <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-[8px] object-cover bg-black/40" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white truncate">{s.name}</p>
                          <p className="text-[9px] text-white/40">
                            {s.city}, {s.country}
                          </p>
                        </div>
                        {viewerFollowedStores.includes(s.id) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    ))}
                  </div>
                )}
                {searchMode === "orders" && (
                  <div className="space-y-1">
                    {(searchQuery ? searchResults.orders : displayOrders).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setActiveDockTab("orders");
                          setExpandedOrderId(o.id);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-left rtl:text-right"
                      >
                        <Package className="w-3.5 h-3.5 text-blue-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white">#{o.id}</p>
                          <p className="text-[9px] text-white/40">
                            {o.status} · {o.currency} {o.amount.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STORES */}
            {activeDockTab === "stores" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 left-2.5 rtl:left-auto rtl:right-2.5 w-3 h-3 text-white/40" />
                  <input
                    type="text"
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    placeholder={isAr ? "ابحث عن متاجر..." : "Search stores..."}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                {viewerFollowedStores.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase font-bold text-white/40 mb-1 flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" /> {isAr ? "متابَع" : "Followed"} (
                      {viewerFollowedStores.length})
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                      {viewerFollowedStores.map((id) => {
                        const s = allStores.find((x) => x.id === id);
                        if (!s) return null;
                        return (
                          <div
                            key={id}
                            className="w-[100px] shrink-0 p-2 rounded-[8px] bg-white/5 border border-white/10 text-center"
                          >
                            <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-[8px] object-cover mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-white truncate">{s.name}</p>
                            <button
                              onClick={() => toggleFollowStore(id)}
                              className="text-[8px] text-red-400 mt-0.5 font-bold"
                            >
                              {isAr ? "إلغاء" : "Unfollow"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase font-bold text-white/40 mb-1">{isAr ? "كل المتاجر" : "All Stores"}</p>
                  <div className="space-y-1">
                    {allStores
                      .filter((s) => !storeSearchQuery || s.name.toLowerCase().includes(storeSearchQuery.toLowerCase()))
                      .map((s) => (
                        <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-[8px] hover:bg-white/5">
                          <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-[8px] object-cover bg-black/40" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-white truncate flex items-center gap-1">
                              {s.name}
                              {s.verified && <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />}
                            </p>
                            <p className="text-[9px] text-white/40">
                              {s.city}, {s.country} · ⭐{s.rating}
                            </p>
                          </div>
                          <button
                            onClick={() => switchStore(s.id)}
                            className="text-[9px] px-2 py-1 rounded bg-blue-600 text-white font-bold"
                          >
                            {isAr ? "افتح" : "Open"}
                          </button>
                          <button
                            onClick={() => toggleFollowStore(s.id)}
                            className={`text-[9px] px-2 py-1 rounded font-bold ${viewerFollowedStores.includes(s.id)
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/5 text-white/60"
                              }`}
                          >
                            {viewerFollowedStores.includes(s.id) ? (isAr ? "متابَع" : "Following") : "+"}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIES */}
            {activeDockTab === "categories" && (
              <div>
                <p className="text-[10px] font-bold uppercase text-white/60 mb-2">
                  {currentStore.categories.length} {isAr ? "فئة" : "categories"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {currentStore.categories.map((cat) => {
                    const count = currentStore.products.filter((p) => p.category === cat).length;
                    const cover = currentStore.products.find((p) => p.category === cat)?.image || currentStore.banner;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          setActiveDockTab("gallery");
                        }}
                        className="relative rounded-[8px] overflow-hidden border border-white/10 aspect-[4/3] group"
                      >
                        <img
                          src={cover}
                          alt={cat}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                          <p className="text-[11px] font-bold text-white">{cat}</p>
                          <p className="text-[9px] text-white/60">
                            {count} {isAr ? "منتج" : "items"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GALLERY */}
            {activeDockTab === "gallery" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase text-white/60">
                    {currentStore.name} · {filteredProducts.length}
                  </p>
                  {categoryFilter !== "All" && (
                    <button onClick={() => setCategoryFilter("All")} className="text-[9px] text-blue-400 font-bold">
                      Clear filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => openProductInDock(p)}
                      className="rounded-[8px] bg-white/[0.03] border border-white/10 overflow-hidden text-left rtl:text-right group"
                    >
                      <div className="relative aspect-square bg-black/40 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                        >
                          <Heart
                            className={`w-3 h-3 ${viewerFavorites.includes(p.id) ? "fill-red-500 text-red-500" : "text-white"
                              }`}
                          />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-bold text-white truncate">{p.title}</p>
                        <p className="text-[9px] text-white/40 truncate">{p.category}</p>
                        <p className="text-[10px] font-bold text-blue-400 mt-0.5">
                          {p.currency || currentStore.currency} {p.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeDockTab === "profile" && (
              <div className="space-y-3">
                <div className="p-3 rounded-[8px] bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-base font-black shrink-0">
                    {(viewer.name || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white truncate">{viewer.name || "Guest User"}</p>
                    <p className="text-[10px] text-white/50 truncate">{viewerEmail}</p>
                    <p className="text-[9px] text-blue-400 truncate mt-0.5">ID: {viewer.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-[8px] bg-white/[0.04] border border-white/10">
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{displayOrders.length}</p>
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "طلبات" : "Orders"}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-sm font-black text-white">{viewerFavorites.length}</p>
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "مفضل" : "Saved"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{viewerFollowedStores.length}</p>
                    <p className="text-[8px] text-white/50 uppercase font-bold">{isAr ? "متابَع" : "Following"}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold uppercase text-white/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {isAr ? "العناوين" : "Addresses"}
                    </p>
                    <button className="text-[9px] text-blue-400 font-bold">+ {isAr ? "إضافة" : "Add"}</button>
                  </div>
                  <div className="space-y-1">
                    {viewerAddresses.map((a) => (
                      <div
                        key={a.id}
                        className="p-2 rounded-[8px] bg-white/[0.03] border border-white/10 flex items-start gap-2"
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          {a.label === "Work" ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] font-bold text-white">{a.label}</p>
                            {a.isDefault && (
                              <span className="text-[8px] px-1 rounded bg-blue-500/20 text-blue-300 font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-white/60 truncate">{a.address}</p>
                          <p className="text-[9px] text-white/40">{a.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-white/60 mb-1.5 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> {isAr ? "طرق الدفع" : "Payment methods"}
                  </p>
                  <div className="space-y-1">
                    {[
                      { id: "card", icon: CreditCard, title: "Visa •••• 4242", sub: "Expires 08/27" },
                      { id: "cod", icon: Banknote, title: "Cash on Delivery", sub: "Pay on arrival" },
                    ].map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-[8px] bg-white/[0.03] border border-white/10 flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-md bg-white/5 text-white/60 flex items-center justify-center">
                          <m.icon className="w-3 h-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-white truncate">{m.title}</p>
                          <p className="text-[9px] text-white/40 truncate">{m.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => setShowViewerModal(true)}
                    className="w-full py-2 rounded-[8px] bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> {isAr ? "تغيير الهوية" : "Change Viewer Identity"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveDockTab("orders");
                    }}
                    className="w-full py-2 rounded-[8px] bg-white/5 text-white text-[10px] font-bold flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3 h-3" /> {isAr ? "كل الطلبات" : "View all orders"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dock Footer */}
        <div className="h-16 px-3 border-t border-white/10 flex items-center gap-2 shrink-0 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setIsDockOpen(!isDockOpen)}
            className="w-11 h-11 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isDockOpen) setIsDockOpen(true);
              if (activeDockTab === "checkout") handlePlaceOrder();
              else if (activeDockTab === "product" && selectedProduct)
                handleAddToCart(selectedProduct, {
                  size: selectedSize || productSizes[0],
                  color: selectedColor || productColors[0],
                  qty: productQty,
                });
              else if (activeDockTab === "cart") setActiveDockTab("checkout");
              else setActiveDockTab("cart");
            }}
            className="flex-1 h-11 rounded-[8px] bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <span>
              {activeDockTab === "checkout"
                ? isAr
                  ? `تأكيد الدفع (${currentStore.currency} ${grandTotal.toLocaleString()})`
                  : `Confirm & Pay (${currentStore.currency} ${grandTotal.toLocaleString()})`
                : activeDockTab === "product" && selectedProduct
                  ? isAr
                    ? `أضف للسلة (${productQty})`
                    : `Add to Cart (${productQty})`
                  : isAr
                    ? `عرض السلة (${totalItemsCount})`
                    : `Universal Cart (${totalItemsCount})`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
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