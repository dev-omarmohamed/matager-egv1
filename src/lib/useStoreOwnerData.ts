"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ref as rtdbRef,
  onValue,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";
import { rtdb } from "./firebase";
import {
  getActiveStoreOwnerUid,
  StoreOwnerState,
  LiveOrder,
  LiveProduct,
  LiveDiscount,
  LivePosNode,
  LiveTeamMember,
  createLiveProduct,
  updateLiveProduct,
  deleteLiveProduct,
  createLiveOrder,
  updateLiveOrder,
  deleteLiveOrder,
  createLiveDiscount,
  deleteLiveDiscount,
  createLivePosNode,
  deleteLivePosNode,
  createLiveTeamMember,
  deleteLiveTeamMember,
} from "./storeowner-service";

export function useStoreOwnerData(customUid?: string) {
  const [uid, setUid] = useState<string>(customUid || "");
  const [state, setState] = useState<StoreOwnerState>({
    uid: customUid || "",
    storeId: "",
    loading: true,
    error: null,
    storeConfig: {
      store_name: "My Store",
      currency: "EGP",
      status: "Active",
    },
    subscription: {
      plan_id: "starter",
      status: "Active",
      price: 0,
      currency: "EGP",
      end_date: "",
    },
    orders: [],
    products: [],
    discounts: [],
    posNodes: [],
    teamMembers: [],
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageCartValue: 0,
    totalPosRevenue: 0,
    totalPosOrders: 0,
  });

  // Resolve UID from client storage on mount
  useEffect(() => {
    if (!customUid && typeof window !== "undefined") {
      const resolved = getActiveStoreOwnerUid();
      setUid(resolved);
    }
  }, [customUid]);

  // Set up real-time RTDB listeners for storeowner data
  useEffect(() => {
    if (!uid) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const cleanUid = uid.replace(/^store_/, "");
    const storeIdFull = uid.startsWith("store_") ? uid : `store_${uid}`;

    // Reference primary nodes: stores/<cleanUid>, stores/<storeIdFull>, store/<cleanUid>, storeowner/<cleanUid>, client/<cleanUid>
    const storeRef = rtdbRef(rtdb, `stores/${cleanUid}`);
    const storeFullRef = rtdbRef(rtdb, `stores/${storeIdFull}`);
    const storeAltRef = rtdbRef(rtdb, `store/${cleanUid}`);
    const storeOwnerRef = rtdbRef(rtdb, `storeowner/${cleanUid}`);
    const clientRef = rtdbRef(rtdb, `client/${cleanUid}`);

    let activeData: any = null;

    const handleDataSnapshot = (snapVal: any) => {
      if (!snapVal) return;
      activeData = { ...(activeData || {}), ...snapVal };

      // 1. Parse orders
      const rawOrders = activeData.orders || {};
      const parsedOrders: LiveOrder[] = Object.entries(rawOrders)
        .filter(([k]) => k !== "_initialized" && k !== "total")
        .map(([key, val]: [string, any]) => {
          const amt = Number(val.amount) || Number(val.total?.toString().replace(/[^0-9.]/g, "")) || 0;
          return {
            id: val.id || `#ORD-${key}`,
            customer: val.customer || val.customer_name || "Guest Customer",
            email: val.email || "guest@example.com",
            phone: val.phone || "+20 100 000 0000",
            address: val.address || "Cairo, Egypt",
            status: val.status || "Pending",
            variant: (val.status === "Delivered" || val.status === "Completed"
              ? "success"
              : val.status === "Cancelled"
              ? "danger"
              : "pending") as any,
            total: val.total || `EGP ${amt.toLocaleString()}`,
            amount: amt,
            items: Array.isArray(val.items)
              ? val.items
              : val.items && typeof val.items === "object"
              ? Object.values(val.items)
              : [{ name: "Order Item", qty: 1, price: amt }],
            created_at: val.created_at || new Date().toISOString(),
          };
        });

      // 2. Parse products
      const rawProducts = activeData.products || {};
      const parsedProducts: LiveProduct[] = Object.entries(rawProducts)
        .filter(([k]) => k !== "_initialized" && k !== "total")
        .map(([key, val]: [string, any]) => {
          const qty = Number(val.stockQty) || 0;
          return {
            id: val.id || key,
            name: val.name || "Product",
            sku: val.sku || `SKU-${key.slice(-4)}`,
            category: val.category || "General",
            price: val.price !== undefined ? val.price : 0,
            currency: val.currency || "EGP",
            stockQty: qty,
            stockText: val.stockText || `${qty} in Stock`,
            statusVariant: (qty > 5 ? "success" : qty > 0 ? "pending" : "danger") as any,
            image: val.image || "",
            created_at: val.created_at || "",
          };
        });

      // 3. Parse POS nodes
      const rawPos =
        activeData.branches?.default?.pos_systems ||
        activeData.pos_systems ||
        (activeData.branches ? Object.values(activeData.branches)[0] as any : null)?.pos_systems ||
        {};
      const parsedPosNodes: LivePosNode[] = Object.entries(rawPos)
        .filter(([k]) => k !== "_initialized")
        .map(([key, val]: [string, any]) => ({
          id: val.id || key,
          name: val.name || "POS Register",
          branch: val.branch || "Flagship Branch",
          staffName: val.staffName || "Staff Member",
          pin: val.pin || "1234",
          status: val.status || "Active",
          todaySales: Number(val.todaySales) || 0,
          todayOrders: Number(val.todayOrders) || 0,
          device_serial: val.device_serial || `POS-${key.slice(-4)}`,
          lastActive: val.lastActive || "Just now",
        }));

      // 4. Parse discounts
      const rawDiscounts = activeData.discounts || {};
      const parsedDiscounts: LiveDiscount[] = Object.entries(rawDiscounts)
        .filter(([k]) => k !== "_initialized")
        .map(([key, val]: [string, any]) => ({
          id: val.id || key,
          code: val.code || key,
          discount: val.discount || `${val.value || 10}% Off`,
          type: val.type || "percentage",
          value: Number(val.value) || 10,
          usage: val.usage || `${val.usageCount || 0}/${val.maxUsage || 100}`,
          usageCount: Number(val.usageCount) || 0,
          maxUsage: Number(val.maxUsage) || 100,
          expires: val.expires || "2026-12-31",
          status: val.status || "Active",
          variant: (val.status === "Active" ? "success" : "danger") as any,
        }));

      // 5. Parse team
      const rawTeam = activeData.team || {};
      const parsedTeam: LiveTeamMember[] = Object.entries(rawTeam)
        .filter(([k]) => k !== "_initialized")
        .map(([key, val]: [string, any]) => ({
          id: val.id || key,
          name: val.name || "Staff Member",
          email: val.email || "staff@matager.com",
          initials: val.initials || "SM",
          role: val.role || "Manager",
          avatarClass: val.avatarClass || "bg-blue-100 text-blue-700 dark:bg-blue-500/15",
          permissions: val.permissions || ["Orders"],
        }));

      // 6. Metrics Normalization (strictly 0 if empty)
      const totalRev = parsedOrders.reduce((acc, o) => acc + (o.amount || 0), 0);
      const totalOrd = parsedOrders.length;
      const totalProd = parsedProducts.length;

      // Unique customers set from orders
      const uniqueCusts = new Set(parsedOrders.map((o) => o.phone || o.email || o.customer)).size;
      const avgCart = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;
      const posRev = parsedPosNodes.reduce((acc, p) => acc + (p.todaySales || 0), 0);
      const posOrd = parsedPosNodes.reduce((acc, p) => acc + (p.todayOrders || 0), 0);

      // Store config & subscription
      const cfg = activeData.storeconfig || {};
      const sub = activeData.subscription || {};

      setState({
        uid,
        storeId: cfg.store_id || `store_${uid}`,
        loading: false,
        error: null,
        storeConfig: {
          store_name: cfg.store_name || "My Store",
          legal_name: cfg.legal_name || cfg.store_name,
          subdomain: cfg.subdomain || `${uid}.matager.com`,
          currency: cfg.currency || "EGP",
          phone: cfg.phone || "",
          email: cfg.email || "",
          category: cfg.category || "General",
          plan: cfg.role || sub.plan_id || "starter",
          status: cfg.status || "Active",
        },
        subscription: {
          plan_id: sub.plan_id || "starter",
          status: sub.status || "Active",
          price: Number(sub.price) || 0,
          currency: sub.currency || "EGP",
          end_date: sub.end_date || "",
          volume_tier: sub.volume_tier || "",
        },
        orders: parsedOrders,
        products: parsedProducts,
        discounts: parsedDiscounts,
        posNodes: parsedPosNodes,
        teamMembers: parsedTeam,
        totalRevenue: totalRev,
        totalOrders: totalOrd,
        totalProducts: totalProd,
        totalCustomers: uniqueCusts,
        averageCartValue: avgCart,
        totalPosRevenue: posRev,
        totalPosOrders: posOrd,
      });
    };

    // Listen to stores/<cleanUid>
    onValue(storeRef, (snap) => {
      if (snap.exists()) handleDataSnapshot(snap.val());
      else setState((prev) => ({ ...prev, loading: false }));
    }, (err) => console.warn("RTDB store listener error:", err));

    // Listen to stores/<storeIdFull>
    onValue(storeFullRef, (snap) => {
      if (snap.exists()) handleDataSnapshot(snap.val());
    }, (err) => console.warn("RTDB storeFull listener error:", err));

    // Listen to store/<cleanUid>
    onValue(storeAltRef, (snap) => {
      if (snap.exists()) handleDataSnapshot(snap.val());
    }, (err) => console.warn("RTDB storeAlt listener error:", err));

    // Listen to storeowner/<cleanUid>
    onValue(storeOwnerRef, (snap) => {
      if (snap.exists()) handleDataSnapshot(snap.val());
    }, (err) => console.warn("RTDB storeowner listener error:", err));

    // Listen to client/<cleanUid>
    onValue(clientRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === "object") {
          setState((prev) => ({
            ...prev,
            storeId: val.store_id || prev.storeId,
            storeConfig: {
              ...prev.storeConfig,
              store_name: val.name || prev.storeConfig.store_name,
              email: val.email || prev.storeConfig.email,
              phone: val.phone || prev.storeConfig.phone,
            },
          }));
        }
      }
    }, (err) => console.warn("RTDB client listener error:", err));

    return () => {
      off(storeRef);
      off(storeFullRef);
      off(storeAltRef);
      off(storeOwnerRef);
      off(clientRef);
    };
  }, [uid]);

  // Mutation wrappers bound to this store
  const addProduct = useCallback(
    async (product: Partial<LiveProduct>) => {
      if (!uid) return;
      return createLiveProduct(uid, product);
    },
    [uid]
  );

  const editProduct = useCallback(
    async (productId: string, updates: Partial<LiveProduct>) => {
      if (!uid) return;
      return updateLiveProduct(uid, productId, updates);
    },
    [uid]
  );

  const removeProduct = useCallback(
    async (productId: string) => {
      if (!uid) return;
      return deleteLiveProduct(uid, productId);
    },
    [uid]
  );

  const addOrder = useCallback(
    async (order: Partial<LiveOrder>) => {
      if (!uid) return;
      return createLiveOrder(uid, order);
    },
    [uid]
  );

  const editOrder = useCallback(
    async (orderId: string, updates: Partial<LiveOrder>) => {
      if (!uid) return;
      return updateLiveOrder(uid, orderId, updates);
    },
    [uid]
  );

  const removeOrder = useCallback(
    async (orderId: string) => {
      if (!uid) return;
      return deleteLiveOrder(uid, orderId);
    },
    [uid]
  );

  const addDiscount = useCallback(
    async (discount: Partial<LiveDiscount>) => {
      if (!uid) return;
      return createLiveDiscount(uid, discount);
    },
    [uid]
  );

  const removeDiscount = useCallback(
    async (discountId: string) => {
      if (!uid) return;
      return deleteLiveDiscount(uid, discountId);
    },
    [uid]
  );

  const addPosNode = useCallback(
    async (node: Partial<LivePosNode>) => {
      if (!uid) return;
      return createLivePosNode(uid, node);
    },
    [uid]
  );

  const removePosNode = useCallback(
    async (nodeId: string) => {
      if (!uid) return;
      return deleteLivePosNode(uid, nodeId);
    },
    [uid]
  );

  const addTeamMember = useCallback(
    async (member: Partial<LiveTeamMember>) => {
      if (!uid) return;
      return createLiveTeamMember(uid, member);
    },
    [uid]
  );

  const removeTeamMember = useCallback(
    async (memberId: string) => {
      if (!uid) return;
      return deleteLiveTeamMember(uid, memberId);
    },
    [uid]
  );

  return {
    ...state,
    addProduct,
    editProduct,
    removeProduct,
    addOrder,
    editOrder,
    removeOrder,
    addDiscount,
    removeDiscount,
    addPosNode,
    removePosNode,
    addTeamMember,
    removeTeamMember,
  };
}
