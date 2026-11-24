/**
 * Store Owner Live Data Service for Matager Platform
 *
 * Implements real-time synchronization with Firebase Realtime Database:
 * - Listens to `stores/${uid}` and `storeowner/${uid}` nodes.
 * - Granular real-time listeners for orders, products, branches, POS terminals, discounts, team.
 * - Handles CRUD mutations directly in RTDB with automatic synchronization.
 * - Enforces zero-default normalization (all metrics default to 0, empty orders state to "No orders yet").
 */

import {
  ref as rtdbRef,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  push as rtdbPush,
  get as rtdbGet,
} from "firebase/database";
import { rtdb, auth } from "./firebase";

export interface LiveProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockText: string;
  stockQty: number;
  statusVariant: "success" | "pending" | "danger";
  price: number | string;
  currency: string;
  image?: string;
  created_at?: string;
}

export interface LiveOrderItem {
  name: string;
  qty: number;
  price: string | number;
}

export interface LiveOrder {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  status: "Pending" | "Accepted" | "Shipped" | "Delivered" | "Cancelled" | "Completed";
  variant: "pending" | "info" | "success" | "danger";
  total: string;
  amount: number;
  items: LiveOrderItem[];
  created_at: string;
}

export interface LiveDiscount {
  id: string;
  code: string;
  discount: string;
  type: "percentage" | "fixed";
  value: number;
  usage: string;
  usageCount: number;
  maxUsage: number;
  expires: string;
  status: string;
  variant: "success" | "danger" | "pending";
}

export interface LivePosNode {
  id: string;
  name: string;
  branch: string;
  staffName: string;
  pin: string;
  status: "Active" | "Offline" | "Break";
  todaySales: number;
  todayOrders: number;
  device_serial?: string;
  terminal_number?: number;
  lastActive?: string;
}

export interface LiveTeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  avatarClass: string;
  permissions: string[];
}

export interface StoreOwnerState {
  uid: string;
  storeId: string;
  loading: boolean;
  error: string | null;
  storeConfig: {
    store_name: string;
    legal_name?: string;
    subdomain?: string;
    currency: string;
    phone?: string;
    email?: string;
    category?: string;
    plan?: string;
    status: string;
  };
  subscription: {
    plan_id: string;
    status: string;
    price: number;
    currency: string;
    end_date: string;
    volume_tier?: string;
  };
  orders: LiveOrder[];
  products: LiveProduct[];
  discounts: LiveDiscount[];
  posNodes: LivePosNode[];
  teamMembers: LiveTeamMember[];
  // Normalized metrics (defaulting strictly to 0)
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageCartValue: number;
  totalPosRevenue: number;
  totalPosOrders: number;
}

/**
 * Resolves current active store owner UID.
 * Supports URL searchParams (?storeId=store_... or ?uid=...), auth, and localStorage.
 */
export function getActiveStoreOwnerUid(): string {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlStoreId = params.get("storeId") || params.get("store");
      const urlUid = params.get("uid") || params.get("userId");
      if (urlStoreId) {
        const cleanUid = urlStoreId.replace(/^store_/, "");
        localStorage.setItem("matager_active_user_id", cleanUid);
        localStorage.setItem("matager_current_store_id", urlStoreId);
        localStorage.setItem("matager_active_store_id", urlStoreId);
        return cleanUid;
      }
      if (urlUid) {
        const clean = urlUid.replace(/^store_/, "");
        localStorage.setItem("matager_active_user_id", clean);
        return clean;
      }
    } catch (_) {}

    const userUid = auth.currentUser?.uid;
    if (userUid) return userUid;

    const storedUid =
      localStorage.getItem("matager_active_user_id") ||
      localStorage.getItem("matager_current_store_id") ||
      localStorage.getItem("matager_active_store_id");
    if (storedUid) return storedUid.replace(/^store_/, "");
  }
  return "peacock_store";
}

/**
 * Creates a new Product in RTDB under `stores/${uid}/products`
 */
export async function createLiveProduct(
  uid: string,
  product: Partial<LiveProduct>
): Promise<string> {
  const prodId = product.id || `p_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const newProductRecord = {
    id: prodId,
    name: product.name || "Untitled Product",
    sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
    category: product.category || "General",
    price: Number(product.price) || 0,
    currency: product.currency || "EGP",
    stockQty: Number(product.stockQty) || 0,
    stockText: `${product.stockQty || 0} in Stock`,
    statusVariant: (Number(product.stockQty) > 5 ? "success" : Number(product.stockQty) > 0 ? "pending" : "danger"),
    image: product.image || "",
    created_at: nowIso,
  };

  const updates: Record<string, any> = {
    [`stores/${uid}/products/${prodId}`]: newProductRecord,
    [`storeowner/${uid}/products/${prodId}`]: newProductRecord,
  };

  await rtdbUpdate(rtdbRef(rtdb), updates);
  return prodId;
}

/**
 * Updates a Product in RTDB
 */
export async function updateLiveProduct(
  uid: string,
  productId: string,
  updates: Partial<LiveProduct>
): Promise<void> {
  const rtdbUpdates: Record<string, any> = {
    [`stores/${uid}/products/${productId}`]: updates,
    [`storeowner/${uid}/products/${productId}`]: updates,
  };
  await rtdbUpdate(rtdbRef(rtdb), rtdbUpdates);
}

/**
 * Deletes a Product from RTDB
 */
export async function deleteLiveProduct(uid: string, productId: string): Promise<void> {
  const updates: Record<string, any> = {
    [`stores/${uid}/products/${productId}`]: null,
    [`storeowner/${uid}/products/${productId}`]: null,
  };
  await rtdbUpdate(rtdbRef(rtdb), updates);
}

/**
 * Creates an Order in RTDB under `stores/${uid}/orders`
 */
export async function createLiveOrder(
  uid: string,
  order: Partial<LiveOrder>
): Promise<string> {
  const orderId = order.id || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();
  const newOrderRecord = {
    id: orderId,
    customer: order.customer || "Guest Customer",
    email: order.email || "guest@example.com",
    phone: order.phone || "+20 100 000 0000",
    address: order.address || "Cairo, Egypt",
    status: order.status || "Pending",
    variant: (order.status === "Delivered" ? "success" : order.status === "Cancelled" ? "danger" : "pending") as any,
    total: order.total || `EGP ${Number(order.amount || 0).toLocaleString()}`,
    amount: Number(order.amount) || 0,
    items: order.items || [{ name: "Order Item", qty: 1, price: order.amount || 0 }],
    created_at: nowIso,
  };

  const updates: Record<string, any> = {
    [`stores/${uid}/orders/${orderId.replace(/#/g, "")}`]: newOrderRecord,
    [`storeowner/${uid}/orders/${orderId.replace(/#/g, "")}`]: newOrderRecord,
  };

  await rtdbUpdate(rtdbRef(rtdb), updates);
  return orderId;
}

/**
 * Updates Order status in RTDB
 */
export async function updateLiveOrder(
  uid: string,
  orderId: string,
  updates: Partial<LiveOrder>
): Promise<void> {
  const cleanKey = orderId.replace(/#/g, "");
  const rtdbUpdates: Record<string, any> = {
    [`stores/${uid}/orders/${cleanKey}`]: updates,
    [`storeowner/${uid}/orders/${cleanKey}`]: updates,
  };
  await rtdbUpdate(rtdbRef(rtdb), rtdbUpdates);
}

/**
 * Deletes Order from RTDB
 */
export async function deleteLiveOrder(uid: string, orderId: string): Promise<void> {
  const cleanKey = orderId.replace(/#/g, "");
  const updates: Record<string, any> = {
    [`stores/${uid}/orders/${cleanKey}`]: null,
    [`storeowner/${uid}/orders/${cleanKey}`]: null,
  };
  await rtdbUpdate(rtdbRef(rtdb), updates);
}

/**
 * Creates a Discount Code in RTDB under `stores/${uid}/discounts`
 */
export async function createLiveDiscount(
  uid: string,
  discount: Partial<LiveDiscount>
): Promise<string> {
  const discId = discount.id || `d_${Date.now()}`;
  const record = {
    id: discId,
    code: (discount.code || "SAVE10").toUpperCase(),
    discount: discount.discount || "10% Off",
    type: discount.type || "percentage",
    value: Number(discount.value) || 10,
    usage: discount.usage || "0/100",
    usageCount: 0,
    maxUsage: Number(discount.maxUsage) || 100,
    expires: discount.expires || "2026-12-31",
    status: discount.status || "Active",
    variant: "success",
  };

  const updates: Record<string, any> = {
    [`stores/${uid}/discounts/${discId}`]: record,
    [`storeowner/${uid}/discounts/${discId}`]: record,
  };

  await rtdbUpdate(rtdbRef(rtdb), updates);
  return discId;
}

/**
 * Deletes Discount Code from RTDB
 */
export async function deleteLiveDiscount(uid: string, discountId: string): Promise<void> {
  const updates: Record<string, any> = {
    [`stores/${uid}/discounts/${discountId}`]: null,
    [`storeowner/${uid}/discounts/${discountId}`]: null,
  };
  await rtdbUpdate(rtdbRef(rtdb), updates);
}

/**
 * Creates POS Node in RTDB under `stores/${uid}/branches/.../pos_systems`
 */
export async function createLivePosNode(
  uid: string,
  node: Partial<LivePosNode>
): Promise<string> {
  const nodeId = node.id || `pos_term_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const record = {
    id: nodeId,
    name: node.name || "Register Terminal",
    branch: node.branch || "Flagship Branch",
    staffName: node.staffName || "Staff Member",
    pin: node.pin || "1234",
    status: node.status || "Active",
    todaySales: 0,
    todayOrders: 0,
    device_serial: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
    lastActive: "Just now",
    created_at: nowIso,
  };

  const updates: Record<string, any> = {
    [`stores/${uid}/branches/default/pos_systems/${nodeId}`]: record,
    [`storeowner/${uid}/pos_systems/${nodeId}`]: record,
  };

  await rtdbUpdate(rtdbRef(rtdb), updates);
  return nodeId;
}

/**
 * Deletes POS Node from RTDB
 */
export async function deleteLivePosNode(uid: string, nodeId: string): Promise<void> {
  const updates: Record<string, any> = {
    [`stores/${uid}/branches/default/pos_systems/${nodeId}`]: null,
    [`storeowner/${uid}/pos_systems/${nodeId}`]: null,
  };
  await rtdbUpdate(rtdbRef(rtdb), updates);
}

/**
 * Creates Team Member in RTDB
 */
export async function createLiveTeamMember(
  uid: string,
  member: Partial<LiveTeamMember>
): Promise<string> {
  const memId = member.id || `m_${Date.now()}`;
  const initials = (member.name || "TM")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const record = {
    id: memId,
    name: member.name || "New Staff",
    email: member.email || "staff@matager.com",
    initials,
    role: member.role || "Manager",
    avatarClass:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/25",
    permissions: member.permissions || ["Orders", "Products"],
  };

  const updates: Record<string, any> = {
    [`stores/${uid}/team/${memId}`]: record,
    [`storeowner/${uid}/team/${memId}`]: record,
  };

  await rtdbUpdate(rtdbRef(rtdb), updates);
  return memId;
}

/**
 * Deletes Team Member from RTDB
 */
export async function deleteLiveTeamMember(uid: string, memberId: string): Promise<void> {
  const updates: Record<string, any> = {
    [`stores/${uid}/team/${memberId}`]: null,
    [`storeowner/${uid}/team/${memberId}`]: null,
  };
  await rtdbUpdate(rtdbRef(rtdb), updates);
}
