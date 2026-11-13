/**
 * MATAGER UNIVERSAL COMMERCE SERVICE (SDK)
 * Injected as an external script. Handles Multi-Store Carts, Universal Checkout,
 * Antigravity UI, Theme & Language synchronization, and POS Cashier Node live sync.
 */
(function () {
  "use strict";

  // ==========================================
  // 1. MULTI-STORE CART MANAGER
  // ==========================================
  class MatagerCartManager {
    constructor() {
      this.cart = this.loadCart();
      this.listeners = [];
      this.syncChannel = null;

      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          this.syncChannel = new BroadcastChannel("matager_pos_sync");
          this.syncChannel.onmessage = (msg) => {
            if (msg.data && msg.data.type === "CART_UPDATED") {
              this.cart = this.loadCart();
              this.notify();
            }
          };
        }
      } catch (e) {
        console.warn("BroadcastChannel not supported:", e);
      }
    }

    loadCart() {
      try {
        const data = localStorage.getItem("matager_universal_cart");
        if (data) {
          return JSON.parse(data);
        }
      } catch (err) {
        console.warn("Failed to load universal cart:", err);
      }
      return {};
    }

    saveCart() {
      try {
        localStorage.setItem("matager_universal_cart", JSON.stringify(this.cart));
      } catch (err) {
        console.warn("Failed to save universal cart:", err);
      }
      this.notify();
      if (this.syncChannel) {
        try {
          this.syncChannel.postMessage({ type: "CART_UPDATED", timestamp: Date.now() });
        } catch (_) {}
      }
    }

    addItem(storeId, storeName, product) {
      if (!this.cart[storeId]) {
        this.cart[storeId] = {
          name: storeName || "Matager Store",
          items: [],
          subtotal: 0,
        };
      }

      const existing = this.cart[storeId].items.find((i) => i.id === product.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        this.cart[storeId].items.push({
          id: product.id,
          title: product.title || product.name || "Product",
          price: Number(product.price) || 0,
          image: product.image || product.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          sku: product.sku || product.id,
          size: product.size || "M",
          color: product.color || "Standard",
          qty: 1,
        });
      }

      this.calculateSubtotal(storeId);
      this.saveCart();
      return this.cart[storeId];
    }

    updateQty(storeId, productId, delta) {
      if (!this.cart[storeId]) return;
      const target = this.cart[storeId].items.find((i) => i.id === productId);
      if (!target) return;

      target.qty += delta;
      if (target.qty <= 0) {
        this.removeItem(storeId, productId);
        return;
      }

      this.calculateSubtotal(storeId);
      this.saveCart();
    }

    removeItem(storeId, productId) {
      if (!this.cart[storeId]) return;
      this.cart[storeId].items = this.cart[storeId].items.filter((i) => i.id !== productId);

      if (this.cart[storeId].items.length === 0) {
        delete this.cart[storeId];
      } else {
        this.calculateSubtotal(storeId);
      }
      this.saveCart();
    }

    clearCart() {
      this.cart = {};
      this.saveCart();
    }

    calculateSubtotal(storeId) {
      if (!this.cart[storeId]) return;
      this.cart[storeId].subtotal = this.cart[storeId].items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
        0
      );
    }

    getGrandTotal() {
      return Object.values(this.cart).reduce(
        (sum, store) => sum + (Number(store.subtotal) || 0),
        0
      );
    }

    getTotalItems() {
      return Object.values(this.cart).reduce(
        (sum, store) =>
          sum + (store.items || []).reduce((s, i) => s + (Number(i.qty) || 1), 0),
        0
      );
    }

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter((cb) => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach((cb) => {
        try {
          cb(this);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  const Cart = new MatagerCartManager();

  // ==========================================
  // 2. THEME & LANGUAGE LOCALIZATION
  // ==========================================
  const I18N = {
    en: {
      dockWelcome: "Matager Universal Dock",
      zeroGravity: "Zero-Gravity Commerce",
      emptyCart: "Your Universal Cart is empty",
      emptyCartSub: "Explore storefront items to add them here across any store in the Matager ecosystem.",
      browseItems: "Browse Catalog",
      checkoutAll: "Checkout All Stores",
      grandTotal: "Grand Total (All Stores):",
      items: "items",
      qty: "Qty",
      ordersTab: "Orders",
      cartTab: "Cart",
      storesTab: "Stores",
      checkoutTitle: "Universal Multi-Store Checkout",
      fullName: "Full Name",
      phone: "Phone Number",
      shippingAddress: "Shipping Address (Cairo / Egypt)",
      paymentMethod: "Payment Method",
      cashOnDelivery: "Cash on Delivery",
      creditCard: "Visa / MasterCard",
      madaApplePay: "Mada / Apple Pay",
      mobileWallet: "Vodafone Cash / Meeza",
      placeOrder: "Confirm & Pay",
      orderSuccess: "Order placed successfully across all stores!",
      orderSyncedPos: "Order synced with in-store POS cashier register!",
      cartMode: "Cart Mode",
      galleryMode: "Gallery Mode",
      themeDark: "Dark",
      themeLight: "Light",
      lang: "English",
      addedToCart: "added to Universal Cart",
      posOnline: "POS Node Synced",
    },
    ar: {
      dockWelcome: "منصة متاجر الموحدة",
      zeroGravity: "تجارة تفاعلية بانعدام الجاذبية",
      emptyCart: "سلة المشتريات الموحدة فارغة",
      emptyCartSub: "تصفح منتجات المتجر لإضافتها هنا من أي متجر في شبكة متاجر.",
      browseItems: "تصفح المنتجات",
      checkoutAll: "إتمام الشراء لجميع المتاجر",
      grandTotal: "الإجمالي الكلي (جميع المتاجر):",
      items: "منتجات",
      qty: "الكمية",
      ordersTab: "الطلبات",
      cartTab: "السلة",
      storesTab: "المتاجر",
      checkoutTitle: "إتمام الشراء الموحد لجميع المتاجر",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      shippingAddress: "عنوان التوصيل (القاهرة / مصر)",
      paymentMethod: "طريقة الدفع",
      cashOnDelivery: "الدفع عند الاستلام (كاش)",
      creditCard: "بطاقة بنكية (فيزا / ماستركارد)",
      madaApplePay: "مدى / أبل باي",
      mobileWallet: "محفظة إلكترونية (فودافون كاش / ميزة)",
      placeOrder: "تأكيد الطلب والدفع",
      orderSuccess: "تم تأكيد طلبك بنجاح عبر جميع المتاجر!",
      orderSyncedPos: "تمت مزامنة الطلب فوراً مع شاشات الكاشير ونقاط البيع POS!",
      cartMode: "وضع السلة",
      galleryMode: "معرض الصور",
      themeDark: "داكن",
      themeLight: "فاتح",
      lang: "العربية",
      addedToCart: "تمت إضافته إلى السلة الموحدة",
      posOnline: "متزامن مع نقاط البيع",
    },
  };

  function getSystemLanguage() {
    try {
      const stored = localStorage.getItem("matager-lang");
      if (stored === "ar" || stored === "en") return stored;
      if (document.documentElement.lang === "ar" || document.documentElement.dir === "rtl") return "ar";
    } catch (_) {}
    return "en";
  }

  function getSystemTheme() {
    try {
      const stored = localStorage.getItem("matager-theme");
      if (stored === "light" || stored === "dark") return stored;
      const docTheme = document.documentElement.getAttribute("data-theme");
      if (docTheme === "light" || docTheme === "dark") return docTheme;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch (_) {}
    return "dark";
  }

  let currentLang = getSystemLanguage();
  let currentTheme = getSystemTheme();

  function t(key) {
    const dict = I18N[currentLang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  // ==========================================
  // 3. ANTIGRAVITY UI STYLES (DARK & LIGHT)
  // ==========================================
  const STYLE_ID = "matager-service-styles";
  const ROOT_ID = "matager-service-root";

  const CSS = `
/* =========================================================
   MATAGER UNIVERSAL SERVICE - ANTIGRAVITY UI
   Dual Theme (Dark / Light) & Arabic RTL Support
   ========================================================= */
:root {
  --hub-bg: rgba(20, 20, 22, 0.78);
  --hub-panel: rgba(28, 28, 32, 0.88);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-inner: rgba(255, 255, 255, 0.04);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-muted: rgba(255, 255, 255, 0.4);
  --accent-color: #3b82f6;
  --accent-gradient: linear-gradient(135deg, #0479e8, #0083fe);
  --card-bg: rgba(255, 255, 255, 0.035);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-hover: rgba(255, 255, 255, 0.06);
  --antigravity-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.85), 
                        0 0 0 1px rgba(255, 255, 255, 0.08) inset;
}

[data-theme="light"], .light, .theme-light {
  --hub-bg: rgba(250, 250, 252, 0.88);
  --hub-panel: rgba(240, 242, 248, 0.94);
  --glass-border: rgba(0, 0, 0, 0.12);
  --glass-inner: rgba(0, 0, 0, 0.02);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --accent-color: #0284c7;
  --accent-gradient: linear-gradient(135deg, #0284c7, #38bdf8);
  --card-bg: rgba(255, 255, 255, 0.75);
  --card-border: rgba(0, 0, 0, 0.08);
  --card-hover: rgba(255, 255, 255, 0.95);
  --antigravity-shadow: 0 30px 70px -15px rgba(15, 23, 42, 0.25), 
                        0 0 0 1px rgba(0, 0, 0, 0.06) inset;
}

/* Floating FastCart Dock */
.sticky-cta {
  position: fixed;
  left: 50%;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  z-index: 9990;
  width: min(430px, calc(100vw - 28px));
  height: min(86vh, 780px);
  background: var(--hub-bg);
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  border-radius: 30px;
  box-shadow: var(--antigravity-shadow);
  border: 1px solid var(--glass-border);
  transform: translate3d(-50%, calc(100% - 64px), 0) scale(0.98);
  opacity: 1;
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.35s ease,
              box-shadow 0.4s ease,
              background 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
}

.sticky-cta.is-expanded {
  transform: translate3d(-50%, 0, 0) scale(1);
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--glass-border) inset;
}

/* 3D Depth-of-field in Gallery Mode */
body.is-gallery-active .sticky-cta {
  transform: translate3d(-50%, 0, 40px) scale(1.02);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 60px 110px -20px rgba(4, 121, 232, 0.35), 0 0 0 1px rgba(59, 130, 246, 0.3) inset;
}

/* Overlay Backdrop */
.sticky-cta-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9980;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.sticky-cta-overlay.is-active {
  opacity: 1;
  pointer-events: auto;
}

/* Promo Banner Header */
.sticky-promo-banner {
  flex-shrink: 0;
  height: 42px;
  padding: 0 16px;
  background: var(--glass-inner);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.sticky-promo-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sticky-promo-badge {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 99px;
  background: #3b82f6;
  color: #fff;
  letter-spacing: 0.08em;
}
.sticky-promo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sticky-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-inner);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
}
.sticky-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

/* Main Scrollable Views Panel */
.sticky-cta-panel {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: var(--hub-panel);
}
.sticky-cta-panel-inner {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}
.sticky-cta-panel-inner::-webkit-scrollbar {
  width: 4px;
}
.sticky-cta-panel-inner::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 99px;
}

/* Multi-Store Cart Grouping */
.cart-store-group {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.15);
}
.cart-store-group:hover {
  background: var(--card-hover);
  border-color: rgba(59, 130, 246, 0.3);
}
.cart-store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--card-border);
}
.cart-store-name {
  font-weight: 800;
  font-size: 12px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 7px;
}
.cart-store-badge {
  font-size: 9px;
  background: var(--accent-gradient);
  color: white;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 700;
}
.cart-store-total {
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  font-family: monospace;
}

/* Cart Item Rows */
.cart-store-items {
  padding: 6px 12px;
}
.cart-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
  gap: 10px;
}
.cart-item-row:last-child {
  border-bottom: none;
}
.cart-item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.cart-item-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  background: #000;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}
.cart-item-info {
  min-width: 0;
}
.cart-item-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item-price {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 2px 0 0;
  font-family: monospace;
}
.cart-qty-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--glass-inner);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 3px 6px;
}
.cart-qty-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s ease;
}
.cart-qty-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.cart-qty-val {
  font-size: 11px;
  font-weight: 800;
  font-family: monospace;
  min-width: 14px;
  text-align: center;
}
.cart-trash-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  border-radius: 6px;
  transition: background 0.15s;
}
.cart-trash-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* Universal Summary Card */
.cart-universal-summary {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}
.cart-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}
.cart-total-row--grand {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  border-top: 1px dashed var(--glass-border);
  padding-top: 8px;
  margin-bottom: 12px;
}
.cart-total-val {
  font-family: monospace;
  font-size: 15px;
  color: #3b82f6;
  font-weight: 900;
}

/* Antigravity Buttons */
.cart-primary-btn {
  width: 100%;
  padding: 12px 18px;
  border-radius: 14px;
  border: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  color: #050505;
  box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.cart-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(255, 255, 255, 0.45);
}
.cart-primary-btn:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 5px 15px -5px rgba(255, 255, 255, 0.2);
}

[data-theme="light"] .cart-primary-btn {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #ffffff;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35);
}

/* Sticky Bottom Controller Bar */
.sticky-cta-bar {
  flex-shrink: 0;
  height: 62px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--glass-inner);
  border-top: 1px solid var(--glass-border);
}
.sticky-cta-toggle, .sticky-cta-back {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--card-bg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sticky-cta-toggle:hover, .sticky-cta-back:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.04);
}
.sticky-cta-primary {
  flex: 1;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: var(--accent-gradient);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 8px 20px -4px rgba(4, 121, 232, 0.45);
  transition: all 0.25s ease;
}
.sticky-cta-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
.sticky-cta-primary:active {
  transform: scale(0.98);
}

/* Empty State */
.search-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
}
.search-empty i {
  font-size: 38px;
  margin-bottom: 12px;
  opacity: 0.4;
  display: block;
}
.search-empty p {
  font-size: 12px;
  margin: 4px 0 16px;
}

/* Checkout Form Inputs */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.checkout-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.checkout-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}
.checkout-input, .checkout-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 11px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.checkout-input:focus, .checkout-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* RTL Support */
html[dir="rtl"] .sticky-cta {
  direction: rtl;
  text-align: right;
}
html[dir="rtl"] .cart-store-header,
html[dir="rtl"] .cart-item-row,
html[dir="rtl"] .cart-total-row {
  direction: rtl;
}
`;

  // ==========================================
  // 4. HTML SKELETON
  // ==========================================
  const ROOT_HTML = `
    <div id="sticky-cta-overlay" class="sticky-cta-overlay"></div>
    <div class="sticky-cta" id="stickyCta" data-current="cart">
      <div class="sticky-promo-banner">
        <div class="sticky-promo-left">
          <span class="sticky-promo-badge" id="serviceBadge">Matager OS</span>
          <span id="serviceBannerTitle" class="truncate">Universal Zero-Gravity Dock</span>
        </div>
        <div class="sticky-promo-actions">
          <button type="button" class="sticky-icon-btn" id="matagerThemeBtn" title="Toggle Light/Dark Theme">
            <i class="bi bi-moon-stars" id="matagerThemeIcon"></i>
          </button>
          <button type="button" class="sticky-icon-btn" id="matagerLangBtn" title="Switch Language">
            <span id="matagerLangLabel" style="font-size:9px;font-weight:900;">EN</span>
          </button>
          <button type="button" class="sticky-icon-btn" id="matagerCloseBtn" title="Minimize Dock">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>

      <div class="sticky-cta-panel">
        <div class="sticky-cta-panel-inner" id="stickyCtaViews">
          <!-- Dynamically populated -->
        </div>
      </div>

      <div class="sticky-cta-bar">
        <button type="button" class="sticky-cta-toggle" id="stickyToggleBtn" title="Expand / Minimize">
          <i class="bi bi-bag-fill" id="stickyToggleIcon"></i>
        </button>
        <button type="button" class="sticky-cta-primary" id="stickyPrimaryCta">
          <span id="stickyPrimaryLabel">Checkout</span>
          <i class="bi bi-arrow-right" id="stickyPrimaryIcon"></i>
        </button>
      </div>
    </div>
  `;

  // Active view state: "cart" | "checkout" | "orders"
  let activeView = "cart";

  // ==========================================
  // 5. VIEW RENDERERS
  // ==========================================
  function renderMultiStoreCart() {
    const storeKeys = Object.keys(Cart.cart);

    if (storeKeys.length === 0) {
      return `
        <div class="search-empty">
          <i class="bi bi-bag-x"></i>
          <p class="font-bold text-sm">${t("emptyCart")}</p>
          <p class="text-xs opacity-70">${t("emptyCartSub")}</p>
          <button type="button" class="cart-primary-btn" onclick="window.MatagerService.closeCart()" style="max-width:220px;margin:12px auto 0;">
            ${t("browseItems")}
          </button>
        </div>
      `;
    }

    let html = `<div class="cart-stores-container">`;

    storeKeys.forEach((storeId) => {
      const store = Cart.cart[storeId];
      const items = store.items || [];
      const subtotal = Number(store.subtotal) || 0;

      html += `
        <div class="cart-store-group">
          <div class="cart-store-header">
            <div class="cart-store-name">
              <i class="bi bi-shop text-blue-400"></i>
              <span>${store.name}</span>
              <span class="cart-store-badge">${items.length} ${t("items")}</span>
            </div>
            <div class="cart-store-total">EGP ${subtotal.toLocaleString()}</div>
          </div>
          <div class="cart-store-items">
            ${items
              .map(
                (item) => `
              <div class="cart-item-row">
                <div class="cart-item-main">
                  <img src="${item.image}" alt="${item.title}" class="cart-item-thumb" />
                  <div class="cart-item-info">
                    <p class="cart-item-title">${item.title}</p>
                    <p class="cart-item-price">EGP ${Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
                <div class="cart-qty-controls">
                  <button type="button" class="cart-qty-btn" onclick="window.MatagerService.updateQty('${storeId}', '${item.id}', -1)">
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="cart-qty-val">${item.qty}</span>
                  <button type="button" class="cart-qty-btn" onclick="window.MatagerService.updateQty('${storeId}', '${item.id}', 1)">
                    <i class="bi bi-plus"></i>
                  </button>
                  <button type="button" class="cart-trash-btn" onclick="window.MatagerService.removeFromCart('${storeId}', '${item.id}')" title="Remove">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    const grandTotal = Cart.getGrandTotal();

    html += `
      <div class="cart-universal-summary">
        <div class="cart-total-row">
          <span>${t("dockWelcome")}</span>
          <span class="text-emerald-400 font-bold flex items-center gap-1">
            <i class="bi bi-patch-check-fill"></i> ${t("posOnline")}
          </span>
        </div>
        <div class="cart-total-row cart-total-row--grand">
          <span>${t("grandTotal")}</span>
          <span class="cart-total-val">EGP ${grandTotal.toLocaleString()}</span>
        </div>
        <button type="button" class="cart-primary-btn" onclick="window.MatagerService.openView('checkout')">
          <span>${t("checkoutAll")}</span>
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>`;

    return html;
  }

  function renderCheckoutView() {
    const grandTotal = Cart.getGrandTotal();
    const storeCount = Object.keys(Cart.cart).length;

    return `
      <div class="checkout-form">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <h4 class="text-xs font-bold uppercase tracking-wider">${t("checkoutTitle")}</h4>
          <span class="cart-store-badge">${storeCount} Stores</span>
        </div>

        <div class="checkout-group">
          <label class="checkout-label">${t("fullName")}</label>
          <input type="text" id="chkCustomerName" class="checkout-input" placeholder="e.g. Mahmoud Ahmed" value="Mohamed Al-Sayed" />
        </div>

        <div class="checkout-group">
          <label class="checkout-label">${t("phone")}</label>
          <input type="tel" id="chkCustomerPhone" class="checkout-input" placeholder="+20 100 000 0000" value="+20 102 345 6789" />
        </div>

        <div class="checkout-group">
          <label class="checkout-label">${t("shippingAddress")}</label>
          <input type="text" id="chkShippingAddress" class="checkout-input" placeholder="Street, Building, Apartment, City" value="12 El-Nile Street, Zamalek, Cairo" />
        </div>

        <div class="checkout-group">
          <label class="checkout-label">${t("paymentMethod")}</label>
          <select id="chkPaymentMethod" class="checkout-select">
            <option value="Cash on Delivery">${t("cashOnDelivery")}</option>
            <option value="Visa / MasterCard">${t("creditCard")}</option>
            <option value="Mada / Apple Pay">${t("madaApplePay")}</option>
            <option value="Mobile Wallet">${t("mobileWallet")}</option>
          </select>
        </div>

        <div class="cart-universal-summary" style="margin-top:10px;">
          <div class="cart-total-row cart-total-row--grand">
            <span>${t("grandTotal")}</span>
            <span class="cart-total-val">EGP ${grandTotal.toLocaleString()}</span>
          </div>
          <button type="button" class="cart-primary-btn" id="chkSubmitBtn" onclick="window.MatagerService.processCheckoutSubmit()">
            <span>${t("placeOrder")}</span>
            <i class="bi bi-shield-lock-fill"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderOrdersView() {
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
    } catch (_) {}

    if (orders.length === 0) {
      return `
        <div class="search-empty">
          <i class="bi bi-receipt-cutoff"></i>
          <p class="font-bold text-sm">No recent orders yet</p>
          <p class="text-xs opacity-70">Orders placed from FastCart will appear here and sync automatically with the Cashier POS.</p>
          <button type="button" class="cart-primary-btn" onclick="window.MatagerService.openView('cart')" style="max-width:200px;margin:12px auto 0;">
            Back to Cart
          </button>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 class="text-xs font-bold uppercase tracking-wider">${t("ordersTab")}</h4>
          <span class="text-[10px] text-emerald-400 font-bold">${orders.length} Synced</span>
        </div>
        ${orders
          .slice(0, 10)
          .map(
            (ord) => `
          <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-400">${ord.id}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${ord.status || "Completed"}
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-white/60">
              <span>${ord.customer_name || "Customer"} · ${ord.items_count || 1} items</span>
              <span class="font-bold text-white">EGP ${(Number(ord.amount) || 0).toLocaleString()}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // ==========================================
  // 6. CHECKOUT PROCESSING & POS SYNC
  // ==========================================
  function startUniversalCheckout() {
    const storeKeys = Object.keys(Cart.cart);
    if (storeKeys.length === 0) {
      if (typeof window.showAlert === "function") {
        window.showAlert("error", t("emptyCart"));
      }
      return;
    }
    openView("checkout");
  }

  function processCheckoutSubmit() {
    const storeKeys = Object.keys(Cart.cart);
    if (storeKeys.length === 0) return;

    const nameInput = document.getElementById("chkCustomerName");
    const phoneInput = document.getElementById("chkCustomerPhone");
    const addressInput = document.getElementById("chkShippingAddress");
    const methodInput = document.getElementById("chkPaymentMethod");

    const customerName = nameInput?.value?.trim() || "Walk-in Guest";
    const customerPhone = phoneInput?.value?.trim() || "+20 100 000 0000";
    const shippingAddress = addressInput?.value?.trim() || "Cairo, Egypt";
    const paymentMethod = methodInput?.value || "Cash on Delivery";

    const submitBtn = document.getElementById("chkSubmitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="bi bi-arrow-repeat animate-spin"></i> Processing Universal Order...`;
    }

    if (window.ShopEaseSounds && typeof window.ShopEaseSounds.play === "function") {
      window.ShopEaseSounds.play("checkout");
    }

    setTimeout(() => {
      const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const grandTotal = Cart.getGrandTotal();
      const totalItems = Cart.getTotalItems();

      const unifiedOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: "Completed",
        channel: "FastCart-Online",
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        amount: grandTotal,
        items_count: totalItems,
        stores: storeKeys.map((id) => ({
          storeId: id,
          name: Cart.cart[id].name,
          items: Cart.cart[id].items,
          subtotal: Cart.cart[id].subtotal,
        })),
      };

      // 1. Save to local storage orders ledger
      try {
        const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
        existing.unshift(unifiedOrder);
        localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));
      } catch (e) {
        console.warn(e);
      }

      // 2. Clear universal cart
      Cart.clearCart();

      // 3. Dispatch Live Events to POS Cashier & Dashboard
      try {
        window.dispatchEvent(new CustomEvent("matager:new_order", { detail: unifiedOrder }));
        window.dispatchEvent(new CustomEvent("matager:storefront_order", { detail: unifiedOrder }));
      } catch (_) {}

      // 4. Broadcast to other open browser tabs (POS cashier, admin dashboard)
      if (Cart.syncChannel) {
        try {
          Cart.syncChannel.postMessage({
            type: "ONLINE_FASTCART_ORDER",
            order: unifiedOrder,
            timestamp: Date.now(),
          });
        } catch (_) {}
      }

      // 5. Connect to MatagerFirebase if present
      if (window.MatagerFirebase && typeof window.MatagerFirebase.submitOrder === "function") {
        window.MatagerFirebase.submitOrder({
          productId: unifiedOrder.id,
          productName: `Universal Order (${storeKeys.length} stores)`,
          total: grandTotal,
          itemsCount: totalItems,
          paymentMethod: paymentMethod,
        }).catch(() => null);
      }

      // 6. User feedback
      if (typeof window.showAlert === "function") {
        window.showAlert("cart", `${t("orderSuccess")} (${orderId})`);
        setTimeout(() => {
          window.showAlert("success", t("orderSyncedPos"));
        }, 1200);
      }

      openView("orders");
    }, 1100);
  }

  function openView(viewName) {
    activeView = viewName;
    const viewsEl = document.getElementById("stickyCtaViews");
    if (!viewsEl) return;

    if (viewName === "checkout") {
      viewsEl.innerHTML = renderCheckoutView();
    } else if (viewName === "orders") {
      viewsEl.innerHTML = renderOrdersView();
    } else {
      viewsEl.innerHTML = renderMultiStoreCart();
    }

    // Ensure dock is expanded
    const cta = document.getElementById("stickyCta");
    const overlay = document.getElementById("sticky-cta-overlay");
    if (cta && !cta.classList.contains("is-expanded")) {
      cta.classList.add("is-expanded");
      if (overlay) overlay.classList.add("is-active");
    }
  }

  // ==========================================
  // 7. SDK EXPOSURE & CONTROLLERS
  // ==========================================
  const MatagerService = {
    cartManager: Cart,

    init: function () {
      if (document.getElementById(ROOT_ID)) return;

      // Inject Styles
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);

      // Inject DOM
      const root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = ROOT_HTML;
      document.body.appendChild(root);

      // Initial theme & language sync
      this.applyTheme(currentTheme);
      this.applyLanguage(currentLang);

      // Setup Listeners
      this.bindEvents();

      // Initial View
      openView("cart");
      this.updateBadges();

      // Expose globally
      window.MatagerService = this;
      window.MATAGER_CART = Cart.cart;

      console.log("⚡ Matager Universal Commerce SDK initialized with Antigravity UI");
    },

    bindEvents: function () {
      const toggleBtn = document.getElementById("stickyToggleBtn");
      const primaryBtn = document.getElementById("stickyPrimaryCta");
      const closeBtn = document.getElementById("matagerCloseBtn");
      const overlay = document.getElementById("sticky-cta-overlay");
      const themeBtn = document.getElementById("matagerThemeBtn");
      const langBtn = document.getElementById("matagerLangBtn");

      toggleBtn?.addEventListener("click", () => this.toggleCart());
      closeBtn?.addEventListener("click", () => this.closeCart());
      overlay?.addEventListener("click", () => this.closeCart());

      primaryBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        const cta = document.getElementById("stickyCta");
        if (!cta.classList.contains("is-expanded")) {
          this.openCart();
        } else {
          startUniversalCheckout();
        }
      });

      themeBtn?.addEventListener("click", () => this.toggleTheme());
      langBtn?.addEventListener("click", () => this.toggleLanguage());

      // Subscribe to cart changes
      Cart.subscribe(() => {
        this.updateBadges();
        if (activeView === "cart") {
          const viewsEl = document.getElementById("stickyCtaViews");
          if (viewsEl) viewsEl.innerHTML = renderMultiStoreCart();
        }
      });
    },

    openCart: function () {
      const cta = document.getElementById("stickyCta");
      const overlay = document.getElementById("sticky-cta-overlay");
      if (cta) cta.classList.add("is-expanded");
      if (overlay) overlay.classList.add("is-active");
      openView("cart");
    },

    closeCart: function () {
      const cta = document.getElementById("stickyCta");
      const overlay = document.getElementById("sticky-cta-overlay");
      if (cta) cta.classList.remove("is-expanded");
      if (overlay) overlay.classList.remove("is-active");
    },

    toggleCart: function () {
      const cta = document.getElementById("stickyCta");
      if (cta && cta.classList.contains("is-expanded")) {
        this.closeCart();
      } else {
        this.openCart();
      }
    },

    updateBadges: function () {
      const count = Cart.getTotalItems();
      const grandTotal = Cart.getGrandTotal();
      const primaryLabel = document.getElementById("stickyPrimaryLabel");
      const bannerTitle = document.getElementById("serviceBannerTitle");

      if (primaryLabel) {
        if (count > 0) {
          primaryLabel.textContent = `${t("checkoutAll")} (${count}) · EGP ${grandTotal.toLocaleString()}`;
        } else {
          primaryLabel.textContent = t("cartTab");
        }
      }

      if (bannerTitle) {
        bannerTitle.textContent = `${t("dockWelcome")} · ${count} ${t("items")}`;
      }
    },

    applyTheme: function (theme) {
      currentTheme = theme;
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
      try {
        localStorage.setItem("matager-theme", theme);
      } catch (_) {}

      const icon = document.getElementById("matagerThemeIcon");
      if (icon) {
        icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
      }
    },

    toggleTheme: function () {
      const next = currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(next);
      if (typeof window.showAlert === "function") {
        window.showAlert("auth", `Theme switched to ${next.toUpperCase()}`);
      }
    },

    applyLanguage: function (lang) {
      currentLang = lang;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      try {
        localStorage.setItem("matager-lang", lang);
      } catch (_) {}

      const label = document.getElementById("matagerLangLabel");
      if (label) {
        label.textContent = lang === "ar" ? "EN" : "عربي";
      }

      this.updateBadges();
      openView(activeView);

      // Trigger global event if dictionary is present
      try {
        if (window.MatagerI18n && typeof window.MatagerI18n.applyLanguage === "function") {
          window.MatagerI18n.applyLanguage(lang);
        }
      } catch (_) {}
    },

    toggleLanguage: function () {
      const next = currentLang === "en" ? "ar" : "en";
      this.applyLanguage(next);
      if (typeof window.showAlert === "function") {
        window.showAlert("auth", next === "ar" ? "تم تغيير اللغة إلى العربية" : "Switched to English");
      }
    },

    openView: openView,
    startUniversalCheckout: startUniversalCheckout,
    processCheckoutSubmit: processCheckoutSubmit,

    // Public API for external stores
    addToCart: function (storeId, storeName, product) {
      Cart.addItem(storeId, storeName, product);

      if (window.ShopEaseSounds && typeof window.ShopEaseSounds.play === "function") {
        window.ShopEaseSounds.play("cart-add");
      }

      if (typeof window.showAlert === "function") {
        window.showAlert("cart", `${product.title || product.name || "Item"} ${t("addedToCart")}`);
      }

      this.openCart();
    },

    removeFromCart: function (storeId, productId) {
      Cart.removeItem(storeId, productId);
      if (window.ShopEaseSounds && typeof window.ShopEaseSounds.play === "function") {
        window.ShopEaseSounds.play("delete");
      }
    },

    updateQty: function (storeId, productId, delta) {
      Cart.updateQty(storeId, productId, delta);
    },

    getCart: function () {
      return Cart.cart;
    },
  };

  // Auto-init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => MatagerService.init());
  } else {
    MatagerService.init();
  }
})();
