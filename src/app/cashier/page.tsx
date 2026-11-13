"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store,
  RefreshCw,
  Lock,
  LayoutGrid,
  ShoppingBag,
  User,
  Watch,
  Tag,
  Star,
  Package,
  AlertTriangle,
  ScanLine,
  Filter,
  Wifi,
  Trash2,
  UserPlus,
  Minus,
  Plus,
  PauseCircle,
  CheckCircle2,
  Gauge,
  Receipt,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Printer,
  Sun,
  Moon,
  Zap,
  ChevronDown,
} from "lucide-react";
import { APP_ROUTES, buildDashboardUrl, buildStorefrontUrl } from "@/config/routes";
import { useTheme } from "@/theme/useTheme";
import {
  createPosTransaction,
  getStorePosNodes,
  type PosNodeInfo,
} from "@/lib/firestore-service";
import { getStoreProfile, getAllRegisteredStores } from "@/lib/store-registry";

interface PosProductItem {
  id: string;
  name: string;
  sku: string;
  category: "Footwear" | "Apparel" | "Accessories" | "Sale Items";
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  image: string;
  size?: string;
  color?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
}

interface CartLine {
  product: PosProductItem;
  quantity: number;
  selectedSize?: string;
}

const POS_CATALOG: PosProductItem[] = [
  {
    id: "p1",
    name: "Nike Air Max 270",
    sku: "NK-270-BLK",
    category: "Footwear",
    price: 850,
    originalPrice: 1250,
    discountPercent: 32,
    stock: 84,
    image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/6044dd9dea9948f49524adaa00b9338b_9366/GZ1561_01_00_standard.jpg",
    size: "42",
    color: "Black",
    isBestSeller: true,
  },
  {
    id: "p2",
    name: "Adidas Ultraboost 22",
    sku: "AD-UB22-WHT",
    category: "Footwear",
    price: 2200,
    stock: 42,
    image: "https://assets.adidas.com/images/w_1880,f_auto,q_auto/6f20fbc592f5410d83e7e3dd3e0926f0_9366/JS3268_01_00_standard.jpg",
    size: "44",
    color: "White",
    isBestSeller: true,
  },
  {
    id: "p3",
    name: "Adidas Classic Tee",
    sku: "AD-TEE-BLK",
    category: "Apparel",
    price: 890,
    stock: 4,
    image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM1.jpg",
    size: "L",
    color: "Black",
  },
  {
    id: "p4",
    name: "Nike Air Max 270 React",
    sku: "NK-270R-WHT",
    category: "Footwear",
    price: 4200,
    stock: 28,
    image: "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/pysqd15onjaeugu8mh4l/AIR+MAX+270.png",
    size: "43",
    color: "White/Blue",
    isNew: true,
  },
  {
    id: "p5",
    name: "Performance Crew Socks (3-Pack)",
    sku: "PF-SOCK-GRY",
    category: "Accessories",
    price: 120,
    stock: 120,
    image: "https://resources.mandmdirect.com/Images/_default/a/d/3/ad30709_1_cloudzoom.jpg",
    size: "L",
    color: "Grey",
    isBestSeller: true,
  },
  {
    id: "p6",
    name: "Nike Air Force 1 '07",
    sku: "NK-AF1-WHT",
    category: "Footwear",
    price: 3800,
    stock: 0,
    image: "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/pysqd15onjaeugu8mh4l/AIR+MAX+270.png",
    size: "41",
    color: "White",
  },
  {
    id: "p7",
    name: "Tech Fleece Windrunner Hoodie",
    sku: "NK-TF-GRY",
    category: "Apparel",
    price: 1850,
    originalPrice: 2200,
    discountPercent: 15,
    stock: 18,
    image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM1.jpg",
    size: "XL",
    color: "Heather Grey",
  },
  {
    id: "p8",
    name: "Matager RFID Smart Card Holder",
    sku: "MTG-WLT-CARB",
    category: "Accessories",
    price: 450,
    stock: 55,
    image: "https://resources.mandmdirect.com/Images/_default/a/d/3/ad30709_1_cloudzoom.jpg",
    size: "One Size",
    color: "Carbon Black",
    isNew: true,
  },
];

function PosCashierContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeIdParam = searchParams.get("storeId") || searchParams.get("store") || "peacock_store";
  const activeStore = useMemo(() => getStoreProfile(storeIdParam), [storeIdParam]);
  const allStores = useMemo(() => getAllRegisteredStores(), []);
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);

  const handleSwitchStore = (newStoreId: string) => {
    setShowStoreSwitcher(false);
    const params = new URLSearchParams(window.location.search);
    params.set("storeId", newStoreId);
    router.push(`/cashier?${params.toString()}`);
  };

  // Derive catalog from active store merged with POS items
  const storePosCatalog = useMemo<PosProductItem[]>(() => {
    if (!activeStore.products || activeStore.products.length === 0) {
      return POS_CATALOG;
    }
    const storeMapped: PosProductItem[] = activeStore.products.map((p) => ({
      id: p.id,
      name: p.title,
      sku: `${activeStore.id.slice(0, 3).toUpperCase()}-${p.id.slice(-4)}`,
      category: (p.category as any) || "Apparel",
      price: p.price,
      originalPrice: p.originalPrice,
      discountPercent: p.discountPercent,
      stock: p.stock,
      image: p.image,
      size: "M",
      color: "Standard",
      isBestSeller: p.isBestSeller,
    }));
    return [...storeMapped, ...POS_CATALOG.slice(2)];
  }, [activeStore]);

  // Terminal and shift state
  const [nodes, setNodes] = useState<PosNodeInfo[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string>("TERM-01");
  const [cashierName, setCashierName] = useState<string>("Mohamed Ahmed");
  const [shiftOpenTime, setShiftOpenTime] = useState<string>("08:42 AM");
  const [isShiftActive, setIsShiftActive] = useState<boolean>(true);
  const [syncingStock, setSyncingStock] = useState<boolean>(false);

  // Filter and catalog search state
  const [activeCategory, setActiveCategory] = useState<string>("All Products");
  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart and Order state
  const [cart, setCart] = useState<CartLine[]>([
    { product: POS_CATALOG[0], quantity: 1, selectedSize: "42" },
    { product: POS_CATALOG[4], quantity: 2, selectedSize: "L" },
  ]);
  const [orderNumber, setOrderNumber] = useState<string>(
    `POS-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [appliedDiscountRate, setAppliedDiscountRate] = useState<number>(0);
  const [discountFeedback, setDiscountFeedback] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Wallet" | "Mada">("Cash");
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);

  // Modal / Receipt state
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState<boolean>(false);
  const [heldOrders, setHeldOrders] = useState<Array<{ id: string; cart: CartLine[]; time: string }>>([]);

  // Online FastCart Orders & Live Synchronization
  const { theme, toggleTheme } = useTheme();
  const [incomingOnlineOrder, setIncomingOnlineOrder] = useState<any>(null);
  const [onlineFastCartOrders, setOnlineFastCartOrders] = useState<any[]>([]);
  const [showOnlineOrdersModal, setShowOnlineOrdersModal] = useState<boolean>(false);

  // Load terminals and subscribe to online FastCart sync
  useEffect(() => {
    const list = getStorePosNodes();
    setNodes(list);
    if (list.length > 0) {
      setSelectedTerminal(list[0].id);
      setCashierName(list[0].staffName);
    }

    const handleStorefrontOrder = (e: any) => {
      const order = e.detail;
      if (order) {
        playCashRegisterSound();
        setIncomingOnlineOrder(order);
        setOnlineFastCartOrders((prev) => [order, ...prev]);
      }
    };

    window.addEventListener("matager:storefront_order", handleStorefrontOrder);
    window.addEventListener("matager:new_order", handleStorefrontOrder);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("matager_pos_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "ONLINE_FASTCART_ORDER" && msg.data.order) {
            playCashRegisterSound();
            setIncomingOnlineOrder(msg.data.order);
            setOnlineFastCartOrders((prev) => [msg.data.order, ...prev]);
          }
        };
      }
    } catch (_) {}

    return () => {
      window.removeEventListener("matager:storefront_order", handleStorefrontOrder);
      window.removeEventListener("matager:new_order", handleStorefrontOrder);
      channel?.close();
    };
  }, []);

  // Filtered catalog
  const filteredProducts = useMemo(() => {
    return storePosCatalog.filter((item) => {
      if (activeCategory !== "All Products" && item.category !== activeCategory) {
        return false;
      }
      if (quickFilter === "bestsellers" && !item.isBestSeller) return false;
      if (quickFilter === "instock" && item.stock <= 0) return false;
      if (quickFilter === "lowstock" && (item.stock <= 0 || item.stock > 10)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, quickFilter, searchQuery]);

  // Audio effects
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // fallback
    }
  };

  const playCashRegisterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // fallback
    }
  };

  // Add product to cart
  const handleAddToCart = (product: PosProductItem) => {
    if (product.stock <= 0) return;
    playBeep();
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: product.size || "M" }];
    });
  };

  // Cart controls
  const handleUpdateQty = (productId: string, delta: number) => {
    playBeep();
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.product.id === productId) {
            const nextQty = line.quantity + delta;
            return nextQty > 0 ? { ...line, quantity: nextQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const handleRemoveLine = (productId: string) => {
    setCart((prev) => prev.filter((line) => line.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountCode("");
    setAppliedDiscountRate(0);
    setDiscountFeedback("");
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, line) => acc + line.product.price * line.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round(subtotal * appliedDiscountRate);
  }, [subtotal, appliedDiscountRate]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round(taxableAmount * 0.14);
  const totalDue = taxableAmount + vatAmount;
  const changeDue = Math.max(0, (tenderedAmount || totalDue) - totalDue);

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (code === "SAVE20" || code === "VIP20") {
      setAppliedDiscountRate(0.2);
      setDiscountFeedback("VIP 20% discount applied!");
    } else if (code === "STAFF" || code === "MATAGER10") {
      setAppliedDiscountRate(0.1);
      setDiscountFeedback("10% store discount applied!");
    } else if (code === "PROMO30") {
      setAppliedDiscountRate(0.3);
      setDiscountFeedback("Flash Sale 30% discount applied!");
    } else {
      setAppliedDiscountRate(0);
      setDiscountFeedback("Invalid promo code");
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    setHeldOrders((prev) => [
      ...prev,
      {
        id: orderNumber,
        cart,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCart([]);
    setOrderNumber(`POS-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleResumeHeldOrder = (heldId: string) => {
    const target = heldOrders.find((h) => h.id === heldId);
    if (target) {
      setCart(target.cart);
      setOrderNumber(target.id);
      setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const handleCompletePayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    playCashRegisterSound();

    const currentTerminal = nodes.find((n) => n.id === selectedTerminal);

    const transaction = await createPosTransaction({
      storeId: activeStore.id,
      terminalId: selectedTerminal,
      terminalName: currentTerminal?.name || "Terminal 01",
      cashierName,
      customerName: customerName || "Walk-in Guest",
      customerPhone: customerPhone || "N/A",
      items: cart.map((line) => ({
        productId: line.product.id,
        title: line.product.name,
        sku: line.product.sku,
        price: line.product.price,
        quantity: line.quantity,
        size: line.selectedSize,
        color: line.product.color,
      })),
      subtotal,
      discountAmount,
      taxAmount: vatAmount,
      totalAmount: totalDue,
      paymentMethod,
      amountTendered: tenderedAmount || totalDue,
      changeDue,
    });

    setCompletedOrder({
      ...transaction,
      terminalName: currentTerminal?.name || "Register 01",
      cashierName,
      items: cart,
      subtotal,
      discountAmount,
      vatAmount,
      totalDue,
      paymentMethod,
      amountTendered: tenderedAmount || totalDue,
      changeDue,
      timeString: new Date().toLocaleTimeString(),
      dateString: new Date().toLocaleDateString(),
    });

    setIsProcessing(false);
    setShowReceiptModal(true);

    setCart([]);
    setDiscountCode("");
    setAppliedDiscountRate(0);
    setDiscountFeedback("");
    setCustomerName("");
    setCustomerPhone("");
    setTenderedAmount(0);
    setOrderNumber(`POS-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleSyncStock = () => {
    setSyncingStock(true);
    setTimeout(() => {
      setSyncingStock(false);
      playBeep();
    }, 800);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600/30 selection:text-white ${theme === "light" ? "bg-slate-100 text-slate-900" : "bg-[#030303] text-white"}`}>
      {/* ══════════════════ INCOMING FASTCART ORDER BANNER ══════════════════ */}
      {incomingOnlineOrder && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-2 duration-300 shadow-xl z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>⚡ FASTCART ONLINE ORDER: {incomingOnlineOrder.id}</span>
            <span className="text-white/80">· {incomingOnlineOrder.customer_name}</span>
            <span className="text-emerald-200">EGP {Number(incomingOnlineOrder.amount).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlineOrdersModal(true)}
              className="px-2.5 py-1 rounded-lg bg-white text-black text-[11px] font-bold hover:bg-white/90 shadow-sm"
            >
              View Order
            </button>
            <button onClick={() => setIncomingOnlineOrder(null)} className="p-1 hover:text-white/80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ TOP POS STATUS & TERMINAL NAV ══════════════════ */}
      <header className="px-4 py-3 bg-black/60 border-b border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href={buildDashboardUrl(activeStore.id)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center text-white shadow-md shadow-blue-500/20 hover:scale-105 transition-all"
            title="Return to Merchant Admin Dashboard"
          >
            <Store className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                {activeStore.name} · Ground POS
              </h1>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                Online Sync
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedTerminal}
                onChange={(e) => {
                  setSelectedTerminal(e.target.value);
                  const found = nodes.find((n) => n.id === e.target.value);
                  if (found) setCashierName(found.staffName);
                }}
                className="bg-transparent text-[10px] text-white/50 focus:outline-none focus:text-white cursor-pointer hover:text-white transition-colors"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id} className="bg-neutral-900 text-white">
                    {n.name} · {n.branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* POS Store Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-blue-400 transition-all"
              title="Switch Active Store POS"
            >
              <span>{activeStore.name}</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>
            {showStoreSwitcher && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-neutral-900 border border-white/15 p-1.5 shadow-2xl z-50">
                <div className="px-2 py-1 text-[9px] uppercase text-white/40 border-b border-white/10 mb-1">
                  Active Store POS Register
                </div>
                {allStores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSwitchStore(s.id)}
                    className={`w-full p-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                      s.id === activeStore.id ? "bg-blue-600 text-white font-bold" : "text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.id === activeStore.id && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {heldOrders.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 text-[10px] font-bold">
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{heldOrders.length} Held</span>
              <button
                onClick={() => handleResumeHeldOrder(heldOrders[0].id)}
                className="underline hover:text-white ml-1"
              >
                Resume
              </button>
            </div>
          )}

          {/* Shift status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <div
              className={`w-2 h-2 rounded-full ${
                isShiftActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-[10px] text-white/60">Shift Open:</span>
            <span className="text-[10px] text-white font-bold">{shiftOpenTime}</span>
          </div>

          {/* Cashier Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[10px] text-white/60">Cashier:</span>
            <span className="text-[10px] text-white font-bold">{cashierName}</span>
          </div>

          {/* Sync Stock */}
          <button
            onClick={handleSyncStock}
            disabled={syncingStock}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Sync live inventory with online store"
          >
            <RefreshCw className={`w-3 h-3 ${syncingStock ? "animate-spin" : ""}`} />
            <span>{syncingStock ? "Syncing..." : "Sync Stock"}</span>
          </button>

          {/* Online FastCart Orders Queue */}
          <button
            onClick={() => setShowOnlineOrdersModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold transition-all"
            title="View incoming FastCart online orders"
          >
            <Zap className="w-3 h-3 text-blue-400" />
            <span>FastCart Orders</span>
            {onlineFastCartOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px]">
                {onlineFastCartOrders.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {/* Close Shift */}
          <button
            onClick={() => setShowCloseRegisterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Lock className="w-3 h-3" />
            <span>Close Shift</span>
          </button>

          {/* Storefront Link */}
          <Link
            href={buildStorefrontUrl(activeStore.id)}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-[10px] font-bold transition-all"
            title={`Open Live ${activeStore.name} Storefront`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Storefront</span>
          </Link>

          {/* Dashboard link */}
          <Link
            href={buildDashboardUrl(activeStore.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white text-[10px] font-bold transition-all"
            title={`Open ${activeStore.name} Dashboard`}
          >
            <Gauge className="w-3 h-3 text-[#0083FE]" />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* ══════════════════ 3-COLUMN RESPONSIVE POS LAYOUT ══════════════════ */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden min-h-[calc(100vh-60px)]">
        {/* ─── COLUMN 1: CATEGORIES & QUICK FILTERS (2 cols) ─── */}
        <aside data-lenis-prevent className="col-span-12 md:col-span-3 lg:col-span-2 border-r border-white/10 p-3 space-y-3 bg-[#060606] overflow-y-auto">
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">
              Categories
            </p>
            <div className="space-y-1">
              {[
                { name: "All Products", icon: LayoutGrid, count: POS_CATALOG.length },
                { name: "Footwear", icon: ShoppingBag, count: 4 },
                { name: "Apparel", icon: User, count: 2 },
                { name: "Accessories", icon: Watch, count: 2 },
                { name: "Sale Items", icon: Tag, count: 2 },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      playBeep();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white shadow-md shadow-blue-500/20"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                    <span
                      className={`ml-auto text-[10px] font-bold ${
                        isActive ? "text-white/90" : "text-white/30"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">
              Quick Filters
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setQuickFilter((prev) => (prev === "bestsellers" ? "all" : "bestsellers"))}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  quickFilter === "bestsellers"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Star className="w-3 h-3 text-yellow-400" />
                <span>Best Sellers</span>
              </button>
              <button
                onClick={() => setQuickFilter((prev) => (prev === "instock" ? "all" : "instock"))}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  quickFilter === "instock"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Package className="w-3 h-3 text-emerald-400" />
                <span>In Stock Only</span>
              </button>
              <button
                onClick={() => setQuickFilter((prev) => (prev === "lowstock" ? "all" : "lowstock"))}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  quickFilter === "lowstock"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Low Stock Alert</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">
              Quick Barcode Scans
            </p>
            <div className="space-y-1.5">
              {[POS_CATALOG[0], POS_CATALOG[1], POS_CATALOG[4]].map((item) => (
                <button
                  key={item.sku}
                  onClick={() => handleAddToCart(item)}
                  className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/70 flex items-center justify-between group transition-colors"
                >
                  <span className="truncate">{item.sku}</span>
                  <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-blue-400 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── COLUMN 2: PRODUCT SEARCH & GRID (7 cols) ─── */}
        <section className="col-span-12 md:col-span-9 lg:col-span-7 flex flex-col border-r border-white/10 bg-[#040404]">
          {/* Barcode Search Header */}
          <div className="p-3 border-b border-white/10 bg-black/30 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none w-3.5 h-3.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode or search product by name, SKU (e.g. NK-270)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#0083FE] focus:ring-1 focus:ring-[#0083FE] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setQuickFilter("all");
                  setActiveCategory("All Products");
                  setSearchQuery("");
                }}
                className="px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors flex items-center gap-1"
                title="Reset filters"
              >
                <Filter className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
              <div className="flex items-center gap-1.5">
                <span>Showing</span>
                <span className="text-white font-bold">{filteredProducts.length}</span>
                <span>products</span>
                {quickFilter !== "all" && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">
                    Filtered: {quickFilter}
                  </span>
                )}
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                <Wifi className="w-3 h-3" />
                <span>Barcode Scanner Active</span>
              </span>
            </div>
          </div>

          {/* Product Grid */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-bold text-white">No products found</p>
                <p className="text-xs mt-1">Try another search keyword or clear active filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && handleAddToCart(prod)}
                      className={`group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200 select-none ${
                        isOutOfStock
                          ? "opacity-45 cursor-not-allowed"
                          : "hover:border-blue-500/50 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer active:scale-[0.98]"
                      }`}
                    >
                      <div className="relative aspect-square bg-black/60 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {prod.discountPercent && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-red-500/90 text-white text-[9px] font-black uppercase tracking-wider">
                            -{prod.discountPercent}%
                          </div>
                        )}
                        {prod.isNew && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-blue-500/90 text-white text-[9px] font-black uppercase tracking-wider">
                            New
                          </div>
                        )}

                        <div
                          className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[9px] font-bold ${
                            isOutOfStock
                              ? "bg-red-500/80 text-white"
                              : prod.stock <= 5
                              ? "bg-amber-500/90 text-black font-black"
                              : "bg-black/75 text-white/90 border border-white/10"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : `${prod.stock} in stock`}
                        </div>
                      </div>

                      <div className="p-3">
                        <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-blue-400 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-white/40 mt-0.5 mb-2 truncate">
                          {prod.sku} {prod.size ? `· ${prod.size}` : ""}
                        </p>

                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-white">{prod.price}</span>
                            {prod.originalPrice && (
                              <span className="text-[10px] text-white/30 line-through">
                                {prod.originalPrice}
                              </span>
                            )}
                            <span className="text-[9px] text-white/40">EGP</span>
                          </div>

                          <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-[#0479E8] group-hover:text-white group-hover:border-transparent transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── COLUMN 3: CART, TOTALS & CHECKOUT (3 cols) ─── */}
        <aside className="col-span-12 md:col-span-12 lg:col-span-3 flex flex-col bg-[#070707] border-l border-white/10">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Active Order
              </p>
              <p className="text-xs font-bold text-white mt-0.5">{orderNumber}</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[10px] text-red-400 font-bold hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="p-3 border-b border-white/10">
            {customerName ? (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{customerName}</p>
                  <p className="text-[10px] text-white/50">{customerPhone || "Guest phone"}</p>
                </div>
                <button
                  onClick={() => {
                    setCustomerName("");
                    setCustomerPhone("");
                  }}
                  className="text-white/40 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomerModal(true)}
                className="w-full flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-left text-xs text-white/70 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Attach Customer (Optional)</span>
              </button>
            )}
          </div>

          <div data-lenis-prevent className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30">
                <Receipt className="w-8 h-8 mb-2 opacity-25" />
                <p className="text-xs font-bold text-white/60">Cart is empty</p>
                <p className="text-[10px] mt-1">Tap any product or scan barcode to add</p>
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={line.product.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex gap-2.5"
                >
                  <div className="w-11 h-11 rounded-lg bg-black/60 overflow-hidden shrink-0 border border-white/5">
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold text-white truncate">{line.product.name}</p>
                      <button
                        onClick={() => handleRemoveLine(line.product.id)}
                        className="text-white/30 hover:text-red-400 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40">
                      {line.product.sku} {line.selectedSize ? `· Size ${line.selectedSize}` : ""}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(line.product.id, -1)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-5 text-center">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(line.product.id, 1)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-white">
                          {line.product.price * line.quantity} EGP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Discount code (e.g. SAVE20)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 uppercase"
              />
              <button
                onClick={handleApplyDiscount}
                className="px-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-colors"
              >
                Apply
              </button>
            </div>
            {discountFeedback && (
              <p
                className={`text-[9px] mt-1 font-bold ${
                  appliedDiscountRate > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {discountFeedback}
              </p>
            )}
          </div>

          <div className="p-3 border-t border-white/10 space-y-1.5 bg-black/40 text-[11px]">
            <div className="flex justify-between text-white/50">
              <span>Subtotal</span>
              <span className="text-white/80">{subtotal.toLocaleString()} EGP</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount ({appliedDiscountRate * 100}%)</span>
                <span>- {discountAmount.toLocaleString()} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-white/50">
              <span>VAT (14%)</span>
              <span className="text-white/80">{vatAmount.toLocaleString()} EGP</span>
            </div>

            <div className="flex justify-between items-end pt-2 border-t border-white/10 mt-1">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Total Due
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-white tracking-tight">
                  {totalDue.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/50 uppercase ml-1">EGP</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-white/10 space-y-2 bg-black/30">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
              Payment Method
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "Cash", label: "Cash", icon: Banknote },
                { id: "Card", label: "Visa / MC", icon: CreditCard },
                { id: "Mada", label: "Mada / Meeza", icon: QrCode },
                { id: "Wallet", label: "Wallet", icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      playBeep();
                    }}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-[#0479E8] to-[#0083FE] border-blue-400 text-white shadow-md shadow-blue-500/20"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "Cash" && (
              <div className="pt-2 flex gap-1.5">
                {[totalDue, totalDue + 50, totalDue + 100, Math.ceil(totalDue / 100) * 100].map(
                  (amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTenderedAmount(amt)}
                      className={`flex-1 py-1 rounded-lg border text-[9px] font-bold transition-all ${
                        tenderedAmount === amt
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {amt}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2 bg-[#050505]">
            <button
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
              className="py-3 px-4 bg-white/5 hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/30 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white/60 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              title="Hold this order and start new transaction"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Hold</span>
            </button>

            <button
              onClick={handleCompletePayment}
              disabled={cart.length === 0 || isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? "Processing..." : `Pay ${totalDue.toLocaleString()} EGP`}</span>
            </button>
          </div>
        </aside>
      </main>

      {/* ══════════════════ MODAL: CUSTOMER ATTACHMENT ══════════════════ */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Attach Customer to POS Order</span>
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/50 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tamer Hosny"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white/50 block mb-1">Phone Number (SMS receipt / points)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +20 100 000 0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white text-xs font-bold shadow-md"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: SIMULATED THERMAL RECEIPT ══════════════════ */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-white text-neutral-900 rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="text-center border-b border-dashed border-neutral-300 pb-4">
              <h2 className="text-base font-black uppercase tracking-tight text-black">
                MATAGER GROUND STORE
              </h2>
              <p className="text-[10px] text-neutral-500">Cairo Heliopolis Branch · Terminal 01</p>
              <p className="text-[10px] text-neutral-500">Tax Reg: 489-210-998</p>
              <div className="mt-2 text-[10px] text-neutral-700 flex justify-between">
                <span>Ref: {completedOrder.id}</span>
                <span>{completedOrder.timeString}</span>
              </div>
              <div className="text-[10px] text-neutral-700 flex justify-between">
                <span>Cashier: {completedOrder.cashierName}</span>
                <span>Cust: {completedOrder.customer_name}</span>
              </div>
            </div>

            <div className="space-y-1.5 py-1 text-[11px]">
              {completedOrder.items.map((line: CartLine, i: number) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-bold">{line.product.name}</p>
                    <p className="text-[9px] text-neutral-500">
                      {line.quantity}x @ {line.product.price} EGP
                    </p>
                  </div>
                  <span className="font-bold">{(line.product.price * line.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-neutral-300 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{completedOrder.subtotal.toFixed(2)} EGP</span>
              </div>
              {completedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discount</span>
                  <span>-{completedOrder.discountAmount.toFixed(2)} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>VAT (14%)</span>
                <span>{completedOrder.vatAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-neutral-800 pt-1 mt-1 text-black">
                <span>TOTAL DUE</span>
                <span>{completedOrder.totalDue.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1">
                <span>Method</span>
                <span className="font-bold">{completedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-neutral-300">
              <div className="h-10 bg-neutral-900 rounded mx-auto flex items-center justify-center text-white text-[9px] tracking-widest">
                |||||| | ||||| |||| |||||| |||
              </div>
              <p className="text-[9px] text-neutral-500 mt-1">Thank you for shopping at Matager!</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Next Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: CLOSE SHIFT / REGISTER ══════════════════ */}
      {showCloseRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Close Register & End Shift</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Terminal {selectedTerminal} · {cashierName}</p>
              </div>
              <button
                onClick={() => setShowCloseRegisterModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Shift Opened:</span>
                  <span className="text-white">{shiftOpenTime}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Opening Cash Float:</span>
                  <span className="text-white">1,000.00 EGP</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Today's In-Store Revenue:</span>
                  <span className="text-emerald-400 font-bold">18,450.00 EGP</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Completed In-Store Orders:</span>
                  <span className="text-white font-bold">24 transactions</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Expected Cash in Drawer:</span>
                  <span className="text-white font-black">11,250.00 EGP</span>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Counted Cash in Drawer (EGP)</label>
                <input
                  type="number"
                  defaultValue="11250"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Shift Handover Notes</label>
                <textarea
                  placeholder="Notes for next cashier shift..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowCloseRegisterModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsShiftActive(false);
                  setShowCloseRegisterModal(false);
                  playBeep();
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Confirm & Lock Register
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── MODAL: INCOMING FASTCART ONLINE ORDERS QUEUE ─── */}
      {showOnlineOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Incoming Online FastCart Orders</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Synchronized in real-time from the customer online storefront.
                </p>
              </div>
              <button
                onClick={() => setShowOnlineOrdersModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {onlineFastCartOrders.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  <Package className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p>No incoming online orders right now.</p>
                  <p className="text-[10px] mt-1">Place an order in the FastCart storefront to see it pop up here instantly.</p>
                </div>
              ) : (
                onlineFastCartOrders.map((ord, idx) => (
                  <div
                    key={ord.id || idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400">{ord.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {ord.status || "Ready for Pickup"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/70">
                      <span>Customer: <strong className="text-white">{ord.customer_name}</strong></span>
                      <span className="text-emerald-400 font-bold">EGP {Number(ord.amount).toLocaleString()}</span>
                    </div>

                    <div className="text-[11px] text-white/50">
                      <span>Delivery: {ord.shipping_address || "Cairo Store Pickup"}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          playBeep();
                          setShowOnlineOrdersModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfill & Mark Dispatched</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowOnlineOrdersModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PosCashierPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center text-xs">
          Loading Matager POS Cashier Terminal...
        </div>
      }
    >
      <PosCashierContent />
    </Suspense>
  );
}
