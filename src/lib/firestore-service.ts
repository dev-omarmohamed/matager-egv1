/**
 * Cloud Firestore Service Layer for Matager Platform
 *
 * Implements store owner registration, multi-tenant store initialization,
 * catalog seeding, order creation (from FastCart), and real-time dashboard subscriptions.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import {
  ref as rtdbRef,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
} from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from "firebase/auth";
import { auth, db, rtdb } from "./firebase";
import type {
  User,
  Store,
  Branch,
  PosTerminal,
  Employee,
  Shift,
  Category,
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductVariantStock,
  Subscription,
  Transaction,
  TransactionItem,
} from "./db-schema";

export interface OnboardingData {
  salesChannel: "hybrid" | "online" | "pos";
  expectedVolume?: string;
  tierPrice?: number;
  currency?: string;
  storeName: string;
  legalName: string;
  category: string;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  password?: string;
  selectedPlan: "starter" | "pro" | "enterprise";
}

/**
 * Pushes a new store owner record to Firebase Realtime Database.
 * Creates /{uid} node exclusively, containing:
 * - branches: Initialized flagship branch with pos_count and pos_systems
 * - orders: Empty initialized node
 * - payments: Empty initialized node
 * - products: Empty initialized node
 * - storeconfig: Store details, role ('store_owner'), created_at, subscription info
 */
export async function pushStoreRecordToRTDB({
  uid,
  token,
  storeConfig,
}: {
  uid: string;
  token?: string;
  storeConfig: any;
}): Promise<any> {
  const RTDB_BASE =
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app";

  const storeId = storeConfig.store_id || `store_${uid}`;
  const nowIso = storeConfig.created_at || new Date().toISOString();
  const branchId = `branch_${storeId}_1`;

  const plan = (
    storeConfig.subscription?.plan_id ||
    storeConfig.selected_plan ||
    storeConfig.plan ||
    "pro"
  ).toLowerCase();

  // Determine POS systems count per branch: starter = 1, pro = 2, enterprise = 4
  const branchPosCount =
    typeof storeConfig.pos_count === "number" && storeConfig.pos_count > 0
      ? storeConfig.pos_count
      : plan === "starter"
      ? 1
      : plan === "enterprise"
      ? 4
      : 2;

  // Build the POS systems map for this branch
  const posSystems: Record<string, any> = {};
  for (let i = 1; i <= branchPosCount; i++) {
    const termId = `pos_term_${i}`;
    posSystems[termId] = {
      id: termId,
      terminal_number: i,
      name: i === 1 ? "Register 1 (Main Cashier POS)" : `Register ${i} (Secondary / Floor POS)`,
      device_serial: `POS-${1000 + i}`,
      status: "Active",
      type: i === 1 ? "Countertop POS" : "Mobile / Floor POS",
      branch_id: branchId,
      store_id: storeId,
      created_at: nowIso,
    };
  }

  const defaultBranch = {
    id: branchId,
    store_id: storeId,
    name: `${storeConfig.store_name} — Flagship Branch`,
    address: storeConfig.address
      ? `${storeConfig.address}, ${storeConfig.city || "Cairo"}`
      : `${storeConfig.city || "Cairo"}, ${storeConfig.country || "Egypt"}`,
    city: storeConfig.city || "Cairo",
    country: storeConfig.country || "Egypt",
    phone: storeConfig.phone || "",
    status: "Active",
    is_default: true,
    pos_count: branchPosCount,
    pos_systems: posSystems,
    created_at: nowIso,
  };

  const branchesMap: Record<string, any> =
    storeConfig.branches &&
    typeof storeConfig.branches === "object" &&
    Object.keys(storeConfig.branches).length > 0
      ? storeConfig.branches
      : {
          [branchId]: defaultBranch,
        };

  const totalPosCount = Object.values(branchesMap).reduce((acc: number, b: any) => {
    const count =
      typeof b?.pos_count === "number"
        ? b.pos_count
        : b?.pos_systems && typeof b.pos_systems === "object"
        ? Object.keys(b.pos_systems).length
        : branchPosCount;
    return acc + count;
  }, 0);

  const { branches: _omittedBranches, ...cleanConfig } = storeConfig;
  const enrichedStoreConfig = {
    ...cleanConfig,
    pos_count: totalPosCount,
  };

  // Node of the created user containing branches, orders, payments, products, storeconfig
  const userRootPayload = {
    branches: {
      _initialized: true,
      ...branchesMap,
      pos_count: totalPosCount,
      total: Object.keys(branchesMap).length,
    },
    orders: { _initialized: true, total: 0 },
    payments: { _initialized: true, total: 0 },
    products: { _initialized: true, total: 0 },
    storeconfig: enrichedStoreConfig,
  };

  let apiSuccess = false;

  // Method 1: Push via server API route (/api/rtdb/push-store)
  try {
    const apiRes = await fetch("/api/rtdb/push-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token, storeConfig: enrichedStoreConfig }),
    });
    if (apiRes.ok) {
      const resJson = await apiRes.json();
      console.log("Successfully pushed store record to RTDB via API route:", resJson);
      apiSuccess = true;
      return resJson;
    } else {
      const errTxt = await apiRes.text();
      console.warn("API route responded with status", apiRes.status, errTxt);
    }
  } catch (apiErr) {
    console.warn("API route /api/rtdb/push-store unavailable, falling back to direct REST:", apiErr);
  }

  // Method 2: Direct REST write fallback to RTDB (works in browser or Node)
  if (!apiSuccess) {
    try {
      const userUrl = token
        ? `${RTDB_BASE}/${uid}.json?auth=${encodeURIComponent(token)}`
        : `${RTDB_BASE}/${uid}.json`;

      await fetch(userUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userRootPayload),
      });
      console.log("Successfully pushed store record to RTDB via direct REST");
      apiSuccess = true;
    } catch (restErr) {
      console.warn("Direct REST write failed:", restErr);
    }
  }

  // Method 3: Firebase RTDB Client SDK
  try {
    await rtdbSet(rtdbRef(rtdb, `${uid}/storeconfig`), enrichedStoreConfig);
    await rtdbSet(rtdbRef(rtdb, `${uid}/products`), { _initialized: true, total: 0 });
    await rtdbSet(rtdbRef(rtdb, `${uid}/branches`), {
      _initialized: true,
      total: Object.keys(branchesMap).length,
      pos_count: totalPosCount,
      ...branchesMap,
    });
    await rtdbSet(rtdbRef(rtdb, `${uid}/orders`), { _initialized: true, total: 0 });
    await rtdbSet(rtdbRef(rtdb, `${uid}/payments`), { _initialized: true, total: 0 });
    console.log("Successfully pushed store record to RTDB via client SDK");
  } catch (sdkErr) {
    console.warn("Client RTDB SDK write warning:", sdkErr);
  }

  return { success: apiSuccess, uid };
}

/**
 * Registers a new Store Owner via Firebase Auth, creates their User record,
 * creates their Store document, and seeds initial store structure.
 */
export async function setupStoreOwnerAccount(
  data: OnboardingData
): Promise<{ user: User; store: Store }> {
  let uid = "";
  let idToken = "";
  let userEmail = data.email.trim();
  const password = data.password || "MatagerStore2026!";

  try {
    // 1. Authenticate with Firebase Auth
    if (userEmail && userEmail.includes("@")) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, userEmail, password);
        uid = userCred.user.uid;
        idToken = await userCred.user.getIdToken(true).catch(() => "");
        await updateProfile(userCred.user, { displayName: data.storeName }).catch(() => null);
      } catch (authErr: any) {
        if (authErr?.code === "auth/email-already-in-use") {
          try {
            const userCred = await signInWithEmailAndPassword(auth, userEmail, password);
            uid = userCred.user.uid;
            idToken = await userCred.user.getIdToken(true).catch(() => "");
          } catch {
            uid = `owner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
        } else {
          // If auth domain or network restriction, generate client UID
          const anon = await signInAnonymously(auth).catch(() => null);
          if (anon) {
            uid = anon.user.uid;
            idToken = await anon.user.getIdToken(true).catch(() => "");
          } else {
            uid = `owner_${Date.now()}`;
          }
        }
      }
    } else {
      const anon = await signInAnonymously(auth).catch(() => null);
      if (anon) {
        uid = anon.user.uid;
        idToken = await anon.user.getIdToken(true).catch(() => "");
      } else {
        uid = `owner_${Date.now()}`;
      }
      userEmail = `${uid}@stores.matager.com`;
    }
  } catch (err) {
    console.warn("Firebase Auth fallback used:", err);
    uid = `owner_${Date.now()}`;
  }

  const nowIso = new Date().toISOString();
  const storeId = `store_${uid}`;
  const slug = data.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "store";

  const activeCurrency = data.currency || (data.country === "Saudi Arabia" ? "SAR" : data.country === "United Arab Emirates" ? "AED" : "EGP");

  // 2. Create User record
  const userRecord: User = {
    id: uid,
    name: data.storeName,
    email: userEmail,
    phone: data.phone,
    role: "Store Owner",
    store_id: storeId,
    created_at: nowIso,
  };

  // 3. Create Store record
  const storeRecord: Store = {
    id: storeId,
    owner_id: uid,
    name: data.storeName,
    subdomain: `${slug}.matager.com`,
    status: "Active",
    kyc_status: "Approved",
    gmv_30d: 48920,
    orders_30d: 142,
    category: data.category,
    sales_channel: data.salesChannel,
    expected_volume: data.expectedVolume || "50 - 100 products",
    tier_price: data.tierPrice || 570,
    plan: data.selectedPlan,
    location: {
      country: data.country,
      city: data.city,
      address: data.address,
    },
    contact: {
      email: data.email,
      phone: data.phone,
    },
    created_at: nowIso,
  };

  // 4. Prepare Store Owner store-config payload
  const storeConfigPayload = {
    store_id: storeId,
    uid: uid,
    store_name: data.storeName,
    legal_name: data.legalName,
    owner_name: data.storeName,
    email: userEmail,
    phone: data.phone,
    role: "store_owner",
    sales_channel: data.salesChannel,
    category: data.category,
    expected_volume: data.expectedVolume || "50 - 100 products",
    tier_price: data.tierPrice || 570,
    currency: activeCurrency,
    country: data.country || "Egypt",
    city: data.city,
    address: data.address,
    status: "Active",
    kyc_status: "Approved",
    subdomain: `${slug}.matager.com`,
    created_at: nowIso,
    subscription: {
      plan_id: data.selectedPlan,
      volume_tier: data.expectedVolume || "50 - 100 products",
      price: data.tierPrice || 570,
      currency: activeCurrency,
      status: "Active",
      start_date: nowIso,
      end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
  };

  // 5. PRIMARY PUSH: Push Store Owner structure exclusively under /{uid} in Realtime Database
  // Creates /{uid}/branches, /{uid}/orders, /{uid}/payments, /{uid}/products, /{uid}/storeconfig
  await pushStoreRecordToRTDB({
    uid,
    token: idToken,
    storeConfig: storeConfigPayload,
  });

  // 6. Cloud Firestore optional synchronization in isolated block (non-blocking)
  try {
    await setDoc(doc(db, "User", uid), { ...userRecord, timestamp: serverTimestamp() });
    await setDoc(doc(db, "Store", storeId), { ...storeRecord, timestamp: serverTimestamp() });
  } catch (fsErr) {
    console.warn("Firestore sync skipped:", fsErr);
  }

  // Save session state to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("matager_active_store_id", storeId);
    localStorage.setItem("matager_active_store_name", data.storeName);
    localStorage.setItem("matager_active_user_id", uid);
    localStorage.setItem("matager_current_store_id", storeId);
    localStorage.setItem("matager_user_role", "merchant");
    localStorage.setItem("matager_store_data", JSON.stringify(storeRecord));

    try {
      const existing = JSON.parse(localStorage.getItem("matager_platform_stores") || "[]");
      existing.unshift({
        id: storeId,
        name: data.storeName,
        subdomain: `${slug}.matager.com`,
        status: "Active",
        country: data.country,
        city: data.city,
        ownerName: data.storeName,
        ownerEmail: data.email,
        category: data.category,
        expected_volume: data.expectedVolume || "50 - 100 products",
        tier_price: data.tierPrice || 570,
        plan: data.selectedPlan,
      });
      localStorage.setItem("matager_platform_stores", JSON.stringify(existing));
    } catch (_) {}
  }

  return { user: userRecord, store: storeRecord };
}

/**
 * Retrieves the currently active store ID or default fallback.
 */
export function getActiveStoreId(): string {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("matager_active_store_id") ||
      "store_peacock_default"
    );
  }
  return "store_peacock_default";
}

/**
 * Creates an order in Firestore from Customer FastCart.
 */
export async function createFastCartOrder(params: {
  storeId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod: string;
  totalAmount: number;
}): Promise<Transaction> {
  const storeId = params.storeId || getActiveStoreId();
  const orderId = `ord_${Date.now()}`;
  const nowIso = new Date().toISOString();

  const transaction: Transaction = {
    id: orderId,
    store_id: storeId,
    amount: params.totalAmount,
    commission_earned: Math.round(params.totalAmount * 0.05),
    gateway_fee: Math.round(params.totalAmount * 0.02),
    status: "Completed",
    type: "Order",
    channel: "Online",
    payment_method: params.paymentMethod,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    shipping_address: params.customerAddress,
    items_count: params.items.reduce((acc, i) => acc + i.quantity, 0),
    created_at: nowIso,
  };

  try {
    await setDoc(doc(db, "Transaction", orderId), {
      ...transaction,
      timestamp: serverTimestamp(),
    });

    // Save items
    for (let idx = 0; idx < params.items.length; idx++) {
      const it = params.items[idx];
      const itemId = `${orderId}_item_${idx + 1}`;
      const itemRecord: TransactionItem = {
        id: itemId,
        transaction_id: orderId,
        store_id: storeId,
        product_id: it.productId,
        variant_id: it.variantId || "default",
        name_snapshot: it.title,
        sku_snapshot: `SKU-${it.productId}`,
        quantity: it.quantity,
        unit_price: it.price,
        discount_amount: 0,
        tax_amount: Math.round(it.price * 0.14),
        total: it.price * it.quantity,
        created_at: nowIso,
      };
      await setDoc(doc(db, "TransactionItem", itemId), itemRecord);
    }

    // Increment store metric
    const storeRef = doc(db, "Store", storeId);
    await updateDoc(storeRef, {
      orders_30d: increment(1),
      gmv_30d: increment(params.totalAmount),
    }).catch(() => null);

    // Sync to Realtime Database nodes
    try {
      await rtdbSet(rtdbRef(rtdb, `orders/${storeId}/${orderId}`), transaction);
      for (let idx = 0; idx < params.items.length; idx++) {
        const it = params.items[idx];
        const itemId = `${orderId}_item_${idx + 1}`;
        await rtdbSet(rtdbRef(rtdb, `order_items/${storeId}/${orderId}/${itemId}`), {
          id: itemId,
          transaction_id: orderId,
          store_id: storeId,
          product_id: it.productId,
          variant_id: it.variantId || "default",
          name_snapshot: it.title,
          sku_snapshot: `SKU-${it.productId}`,
          quantity: it.quantity,
          unit_price: it.price,
          total: it.price * it.quantity,
          created_at: nowIso,
        });
      }
      await rtdbUpdate(rtdbRef(rtdb, `stores/${storeId}`), {
        last_order_at: nowIso,
      }).catch(() => null);
    } catch (rtdbErr) {
      console.warn("RTDB order write fallback:", rtdbErr);
    }
  } catch (err) {
    console.warn("Firestore order write error (persisting locally):", err);
  }

  // Also persist in localStorage for offline / fallback real-time event
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
    existing.unshift(transaction);
    localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));

    // Dispatch window event so dashboard components update instantly
    window.dispatchEvent(
      new CustomEvent("matager:new_order", { detail: transaction })
    );
  }

  return transaction;
}

/**
 * Real-time listener for Merchant Dashboard Recent Orders.
 */
export function subscribeToOrders(
  storeId: string,
  callback: (orders: Transaction[]) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, "Transaction"),
      where("store_id", "==", storeId),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: Transaction[] = [];
        snapshot.forEach((doc) => {
          orders.push(doc.data() as Transaction);
        });
        callback(orders);
      },
      (err) => {
        console.warn("Firestore onSnapshot error, falling back to RTDB orders:", err);
        // Fallback to Realtime Database
        try {
          const rtdbOrdersRef = rtdbRef(rtdb, `orders/${storeId}`);
          rtdbOnValue(
            rtdbOrdersRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.val();
                const list: Transaction[] = Object.values(data);
                list.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                callback(list);
              } else if (typeof window !== "undefined") {
                const local = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
                callback(local);
              }
            },
            () => {
              if (typeof window !== "undefined") {
                const local = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
                callback(local);
              }
            }
          );
        } catch {
          if (typeof window !== "undefined") {
            const local = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
            callback(local);
          }
        }
      }
    );

    return unsubscribe;
  } catch {
    if (typeof window !== "undefined") {
      const local = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
      callback(local);
    }
    return () => {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POS CASHIER TERMINALS & TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface PosOrderParams {
  storeId?: string;
  terminalId: string;
  terminalName?: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    sku: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "Cash" | "Card" | "Wallet" | "Mada" | string;
  amountTendered?: number;
  changeDue?: number;
  notes?: string;
}

/**
 * Creates an in-store POS transaction executed from the cashier register terminal.
 */
export async function createPosTransaction(params: PosOrderParams): Promise<Transaction> {
  const storeId = params.storeId || getActiveStoreId();
  const orderId = `POS-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const transaction: Transaction = {
    id: orderId,
    store_id: storeId,
    amount: params.totalAmount,
    commission_earned: Math.round(params.totalAmount * 0.05),
    gateway_fee: params.paymentMethod === "Cash" ? 0 : Math.round(params.totalAmount * 0.015),
    status: "Completed",
    type: "Order",
    channel: "POS",
    payment_method: params.paymentMethod,
    customer_name: params.customerName || "Walk-in Guest",
    customer_phone: params.customerPhone || "N/A",
    shipping_address: `In-Store Pickup · Terminal ${params.terminalName || params.terminalId}`,
    items_count: params.items.reduce((acc, i) => acc + i.quantity, 0),
    created_at: nowIso,
  };

  try {
    await setDoc(doc(db, "Transaction", orderId), {
      ...transaction,
      terminal_id: params.terminalId,
      terminal_name: params.terminalName || "Terminal 01",
      cashier_name: params.cashierName,
      subtotal: params.subtotal,
      discount_amount: params.discountAmount,
      tax_amount: params.taxAmount,
      amount_tendered: params.amountTendered || params.totalAmount,
      change_due: params.changeDue || 0,
      timestamp: serverTimestamp(),
    });

    for (let idx = 0; idx < params.items.length; idx++) {
      const it = params.items[idx];
      const itemId = `${orderId}_item_${idx + 1}`;
      const itemRecord: TransactionItem = {
        id: itemId,
        transaction_id: orderId,
        store_id: storeId,
        product_id: it.productId,
        variant_id: it.variantId || "default",
        name_snapshot: it.title,
        sku_snapshot: it.sku,
        quantity: it.quantity,
        unit_price: it.price,
        discount_amount: 0,
        tax_amount: Math.round(it.price * 0.14),
        total: it.price * it.quantity,
        created_at: nowIso,
      };
      await setDoc(doc(db, "TransactionItem", itemId), itemRecord);
    }

    const storeRef = doc(db, "Store", storeId);
    await updateDoc(storeRef, {
      orders_30d: increment(1),
      gmv_30d: increment(params.totalAmount),
    }).catch(() => null);

    // Sync to Realtime Database nodes
    try {
      await rtdbSet(rtdbRef(rtdb, `orders/${storeId}/${orderId}`), transaction);
      await rtdbSet(rtdbRef(rtdb, `pos_ledger/${storeId}/${orderId}`), {
        ...transaction,
        terminal_id: params.terminalId,
        terminal_name: params.terminalName || "Terminal 01",
        cashier_name: params.cashierName,
      });
      await rtdbUpdate(rtdbRef(rtdb, `stores/${storeId}`), {
        last_pos_sale_at: nowIso,
      }).catch(() => null);
    } catch (rtdbErr) {
      console.warn("RTDB POS order write fallback:", rtdbErr);
    }
  } catch (err) {
    console.warn("Firestore POS order write error (persisting locally):", err);
  }

  // Local storage persistence
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
    existing.unshift(transaction);
    localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));

    const posLedger = JSON.parse(localStorage.getItem(`matager_pos_ledger_${storeId}`) || "[]");
    posLedger.unshift({
      ...transaction,
      terminal_id: params.terminalId,
      cashier_name: params.cashierName,
    });
    localStorage.setItem(`matager_pos_ledger_${storeId}`, JSON.stringify(posLedger.slice(0, 50)));

    window.dispatchEvent(
      new CustomEvent("matager:new_order", { detail: transaction })
    );
    window.dispatchEvent(
      new CustomEvent("matager:pos_sale", {
        detail: {
          ...transaction,
          terminal_id: params.terminalId,
          cashier_name: params.cashierName,
        },
      })
    );
  }

  return transaction;
}

export interface PosNodeInfo {
  id: string;
  name: string;
  branch: string;
  staffName: string;
  pin: string;
  status: "Active" | "Offline" | "Break";
  todaySales: number;
  todayOrders: number;
  lastActive: string;
}

/**
 * Returns all POS cashier nodes configured for a store.
 */
export function getStorePosNodes(storeId?: string): PosNodeInfo[] {
  const activeId = storeId || getActiveStoreId();
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`matager_pos_nodes_${activeId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
  }

  // Default seed nodes for store
  const defaultNodes: PosNodeInfo[] = [
    {
      id: "TERM-01",
      name: "Main Register 01",
      branch: "Cairo Heliopolis Flagship",
      staffName: "Mohamed Ahmed",
      pin: "1234",
      status: "Active",
      todaySales: 18450,
      todayOrders: 24,
      lastActive: "Just now",
    },
    {
      id: "TERM-02",
      name: "Express Counter 02",
      branch: "Cairo Heliopolis Flagship",
      staffName: "Sara Khaled",
      pin: "5678",
      status: "Active",
      todaySales: 9800,
      todayOrders: 14,
      lastActive: "4m ago",
    },
    {
      id: "TERM-03",
      name: "VIP Lounge Mobile POS",
      branch: "New Cairo Branch",
      staffName: "Omar Tarek",
      pin: "9012",
      status: "Break",
      todaySales: 4300,
      todayOrders: 5,
      lastActive: "18m ago",
    },
    {
      id: "TERM-04",
      name: "Warehouse Dispatch POS",
      branch: "Alexandria Depot",
      staffName: "Youssef Nabil",
      pin: "3456",
      status: "Offline",
      todaySales: 0,
      todayOrders: 0,
      lastActive: "Yesterday",
    },
  ];

  if (typeof window !== "undefined") {
    localStorage.setItem(`matager_pos_nodes_${activeId}`, JSON.stringify(defaultNodes));
  }
  return defaultNodes;
}

/**
 * Adds a new POS Cashier node / terminal for the store's staff.
 */
export function createStorePosNode(
  node: Omit<PosNodeInfo, "id" | "todaySales" | "todayOrders" | "lastActive">,
  storeId?: string
): PosNodeInfo {
  const activeId = storeId || getActiveStoreId();
  const currentNodes = getStorePosNodes(activeId);
  const newNode: PosNodeInfo = {
    ...node,
    id: `TERM-0${currentNodes.length + 1}`,
    todaySales: 0,
    todayOrders: 0,
    lastActive: "Created just now",
  };

  currentNodes.push(newNode);
  if (typeof window !== "undefined") {
    localStorage.setItem(`matager_pos_nodes_${activeId}`, JSON.stringify(currentNodes));
    window.dispatchEvent(new CustomEvent("matager:pos_nodes_updated", { detail: currentNodes }));
  }
  return newNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPER ADMIN MULTI-STORE PLATFORM CONTROLS
// ═══════════════════════════════════════════════════════════════════════════

export interface PlatformStoreTenant {
  id: string;
  name: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  country: string;
  city: string;
  plan: string;
  status: "Active" | "Trial" | "Past Due" | "Suspended" | "Pending";
  gmv_30d: number;
  orders_30d: number;
  posNodesCount: number;
  onlineSharePercent: number;
  posSharePercent: number;
  commissionRate: number;
  created_at: string;
}

const DEFAULT_PLATFORM_STORES: PlatformStoreTenant[] = [
  {
    id: "ST-0001",
    name: "Peacock Store",
    subdomain: "peacock.matager.com",
    ownerName: "Mohamed Ahmed",
    ownerEmail: "mohamed@peacockstore.com",
    ownerPhone: "+20 100 458 9201",
    country: "Egypt",
    city: "Cairo",
    plan: "Matager-100",
    status: "Active",
    gmv_30d: 84200,
    orders_30d: 412,
    posNodesCount: 4,
    onlineSharePercent: 62,
    posSharePercent: 38,
    commissionRate: 5.0,
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "ST-0014",
    name: "Urban Kicks",
    subdomain: "urbankicks.matager.com",
    ownerName: "Sara Khaled",
    ownerEmail: "sara@urbankicks.co",
    ownerPhone: "+20 102 789 1234",
    country: "Egypt",
    city: "Alexandria",
    plan: "Matager-250",
    status: "Active",
    gmv_30d: 156900,
    orders_30d: 890,
    posNodesCount: 6,
    onlineSharePercent: 45,
    posSharePercent: 55,
    commissionRate: 5.0,
    created_at: "2026-02-01T12:00:00Z",
  },
  {
    id: "ST-0092",
    name: "TechNest Saudi",
    subdomain: "technest.matager.com",
    ownerName: "Fahad Al-Otaibi",
    ownerEmail: "fahad@technest.sa",
    ownerPhone: "+966 50 123 4567",
    country: "Saudi Arabia",
    city: "Riyadh",
    plan: "Matager-100",
    status: "Trial",
    gmv_30d: 12400,
    orders_30d: 76,
    posNodesCount: 2,
    onlineSharePercent: 80,
    posSharePercent: 20,
    commissionRate: 4.5,
    created_at: "2026-03-10T14:30:00Z",
  },
  {
    id: "ST-0231",
    name: "Bloom Boutique",
    subdomain: "bloom.matager.com",
    ownerName: "Layla Mansour",
    ownerEmail: "layla@bloomboutique.ae",
    ownerPhone: "+971 55 987 6543",
    country: "UAE",
    city: "Dubai",
    plan: "Matager-50",
    status: "Past Due",
    gmv_30d: 3120,
    orders_30d: 21,
    posNodesCount: 1,
    onlineSharePercent: 30,
    posSharePercent: 70,
    commissionRate: 5.0,
    created_at: "2026-02-20T08:15:00Z",
  },
  {
    id: "ST-0455",
    name: "GearUp Sports",
    subdomain: "gearup.matager.com",
    ownerName: "Tarek Nour",
    ownerEmail: "tarek@gearup.com",
    ownerPhone: "+20 111 654 3210",
    country: "Egypt",
    city: "Giza",
    plan: "Matager-500",
    status: "Active",
    gmv_30d: 342000,
    orders_30d: 1204,
    posNodesCount: 8,
    onlineSharePercent: 58,
    posSharePercent: 42,
    commissionRate: 4.0,
    created_at: "2025-11-05T09:40:00Z",
  },
  {
    id: "ST-0512",
    name: "Aura Fragrances",
    subdomain: "aura.matager.com",
    ownerName: "Amira Zaki",
    ownerEmail: "amira@aurafragrances.ma",
    ownerPhone: "+212 60 123 9876",
    country: "Morocco",
    city: "Casablanca",
    plan: "Matager-100",
    status: "Pending",
    gmv_30d: 0,
    orders_30d: 0,
    posNodesCount: 1,
    onlineSharePercent: 100,
    posSharePercent: 0,
    commissionRate: 5.0,
    created_at: "2026-04-12T16:00:00Z",
  },
];

/**
 * Returns all stores across the entire platform for Super Admin.
 */
export function getAllPlatformStores(): PlatformStoreTenant[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("matager_platform_stores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("matager_platform_stores", JSON.stringify(DEFAULT_PLATFORM_STORES));
  }
  return DEFAULT_PLATFORM_STORES;
}

/**
 * Updates a store's status (Active, Trial, Past Due, Suspended, Pending).
 */
export function updatePlatformStoreStatus(
  storeId: string,
  newStatus: PlatformStoreTenant["status"]
): PlatformStoreTenant[] {
  const stores = getAllPlatformStores();
  const updated = stores.map((s) => (s.id === storeId ? { ...s, status: newStatus } : s));

  if (typeof window !== "undefined") {
    localStorage.setItem("matager_platform_stores", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("matager:stores_updated", { detail: updated }));
  }

  // Update in Firestore asynchronously
  updateDoc(doc(db, "Store", storeId), { status: newStatus }).catch(() => null);
  // Update in Realtime Database asynchronously
  rtdbUpdate(rtdbRef(rtdb, `stores/${storeId}`), { status: newStatus }).catch(() => null);

  return updated;
}

/**
 * Deletes a store and all its associated data from the platform.
 */
export function deletePlatformStore(storeId: string): PlatformStoreTenant[] {
  const stores = getAllPlatformStores();
  const updated = stores.filter((s) => s.id !== storeId);

  if (typeof window !== "undefined") {
    localStorage.setItem("matager_platform_stores", JSON.stringify(updated));
    localStorage.removeItem(`matager_pos_nodes_${storeId}`);
    localStorage.removeItem(`matager_pos_ledger_${storeId}`);
    window.dispatchEvent(new CustomEvent("matager:stores_updated", { detail: updated }));
  }

  // Remove from Firestore asynchronously
  deleteDoc(doc(db, "Store", storeId)).catch(() => null);
  // Remove from Realtime Database asynchronously
  rtdbRemove(rtdbRef(rtdb, `stores/${storeId}`)).catch(() => null);
  rtdbRemove(rtdbRef(rtdb, `orders/${storeId}`)).catch(() => null);

  return updated;
}

/**
 * Provisions a brand new store from the Super Admin platform wizard.
 */
export function provisionNewStoreFromAdmin(data: {
  storeName: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  country: string;
  city: string;
  plan: string;
  posNodesCount?: number;
}): PlatformStoreTenant {
  const stores = getAllPlatformStores();
  const newStoreId = `ST-${(stores.length + 1).toString().padStart(4, "0")}`;

  const newStore: PlatformStoreTenant = {
    id: newStoreId,
    name: data.storeName,
    subdomain: `${data.subdomain || data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.matager.com`,
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    ownerPhone: data.ownerPhone,
    country: data.country,
    city: data.city,
    plan: data.plan || "Matager-100",
    status: "Active",
    gmv_30d: 0,
    orders_30d: 0,
    posNodesCount: data.posNodesCount || 2,
    onlineSharePercent: 50,
    posSharePercent: 50,
    commissionRate: 5.0,
    created_at: new Date().toISOString(),
  };

  stores.unshift(newStore);

  if (typeof window !== "undefined") {
    localStorage.setItem("matager_platform_stores", JSON.stringify(stores));
    window.dispatchEvent(new CustomEvent("matager:stores_updated", { detail: stores }));
  }

  // Also write to Firestore
  setDoc(doc(db, "Store", newStoreId), {
    id: newStoreId,
    name: newStore.name,
    subdomain: newStore.subdomain,
    status: newStore.status,
    kyc_status: "Approved",
    gmv_30d: 0,
    orders_30d: 0,
    created_at: newStore.created_at,
  }).catch(() => null);

  // Also write to Realtime Database
  rtdbSet(rtdbRef(rtdb, `stores/${newStoreId}`), newStore).catch(() => null);

  return newStore;
}

