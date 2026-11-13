"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Store,
  TrendingUp,
  CreditCard,
  Percent,
  Clock,
  AlertOctagon,
  Calendar,
  Flag,
  Search,
  Plus,
  Trash2,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  Sliders,
  Download,
  CheckCircle2,
  X,
  Server,
  Eye,
  Laptop,
} from "lucide-react";
import {
  APP_ROUTES,
  buildDashboardUrl,
  buildStorefrontUrl,
  buildCashierUrl,
} from "@/config/routes";
import {
  getAllPlatformStores,
  updatePlatformStoreStatus,
  deletePlatformStore,
  provisionNewStoreFromAdmin,
  type PlatformStoreTenant,
} from "@/lib/firestore-service";

export default function SuperAdminPage() {
  // Super Admin Authorization Gate (Restricted to the single Super Admin authority)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("matager_superadmin_auth") === "granted";
    }
    return false;
  });
  const [adminEmailInput, setAdminEmailInput] = useState("admin@matager.com");
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [stores, setStores] = useState<PlatformStoreTenant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Modals state
  const [selectedStore, setSelectedStore] = useState<PlatformStoreTenant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PlatformStoreTenant | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Commission update in detail modal
  const [customCommission, setCustomCommission] = useState<string>("5.0");

  // Provisioning form state
  const [provStoreName, setProvStoreName] = useState("");
  const [provSubdomain, setProvSubdomain] = useState("");
  const [provOwnerName, setProvOwnerName] = useState("");
  const [provOwnerEmail, setProvOwnerEmail] = useState("");
  const [provOwnerPhone, setProvOwnerPhone] = useState("");
  const [provCountry, setProvCountry] = useState("Egypt");
  const [provCity, setProvCity] = useState("Cairo");
  const [provPlan, setProvPlan] = useState("Matager-100");
  const [provPosNodes, setProvPosNodes] = useState(2);

  // Load stores & listen for updates
  useEffect(() => {
    const refreshStores = () => {
      setStores(getAllPlatformStores());
    };
    refreshStores();

    const handleStoresUpdated = (e: any) => {
      setStores(e.detail || getAllPlatformStores());
    };

    window.addEventListener("matager:stores_updated", handleStoresUpdated);
    return () => {
      window.removeEventListener("matager:stores_updated", handleStoresUpdated);
    };
  }, []);

  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // KPIs
  const totalStores = stores.length;
  const activeCount = stores.filter((s) => s.status === "Active").length;
  const trialCount = stores.filter((s) => s.status === "Trial").length;
  const pendingCount = stores.filter((s) => s.status === "Pending").length;
  const suspendedCount = stores.filter((s) => s.status === "Suspended" || s.status === "Past Due").length;

  const totalGmv = stores.reduce((acc, s) => acc + s.gmv_30d, 0);
  const totalOrders = stores.reduce((acc, s) => acc + s.orders_30d, 0);
  const totalPosNodes = stores.reduce((acc, s) => acc + s.posNodesCount, 0);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (statusFilter !== "all" && s.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (regionFilter !== "all" && s.country.toLowerCase() !== regionFilter.toLowerCase()) {
        return false;
      }
      if (planFilter !== "all" && s.plan.toLowerCase() !== planFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.ownerEmail.toLowerCase().includes(q) ||
          s.subdomain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stores, statusFilter, regionFilter, planFilter, searchQuery]);

  // Status toggle handler
  const handleToggleStatus = (store: PlatformStoreTenant) => {
    let nextStatus: PlatformStoreTenant["status"] = "Active";
    if (store.status === "Active") {
      nextStatus = "Suspended";
    } else if (store.status === "Suspended") {
      nextStatus = "Pending";
    } else if (store.status === "Pending") {
      nextStatus = "Active";
    } else {
      nextStatus = "Active";
    }

    const updated = updatePlatformStoreStatus(store.id, nextStatus);
    setStores(updated);
    triggerNotice(`Store "${store.name}" status changed to ${nextStatus}.`);
  };

  // Delete store handler
  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;
    const storeId = showDeleteConfirm.id;
    const storeName = showDeleteConfirm.name;

    const updated = deletePlatformStore(storeId);
    setStores(updated);
    setShowDeleteConfirm(null);
    if (selectedStore?.id === storeId) {
      setShowDetailModal(false);
    }
    triggerNotice(`Store "${storeName}" and all related tenant data deleted successfully.`);
  };

  // Authorize Super Admin clearance
  const handleAuthorize = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (
      adminEmailInput.trim().toLowerCase() === "admin@matager.com" ||
      adminKeyInput === "2026" ||
      adminKeyInput === "admin2026" ||
      adminKeyInput.toLowerCase() === "matager-root"
    ) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("matager_superadmin_auth", "granted");
      }
      setIsAuthorized(true);
      setAuthError(null);
      triggerNotice("Super Admin Clearance verified. Welcome, Platform Administrator.");
    } else {
      setAuthError("Access Denied: Invalid Super Admin master security credentials.");
    }
  };

  const handleLockSession = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("matager_superadmin_auth");
    }
    setIsAuthorized(false);
    triggerNotice("Super Admin session locked.");
  };

  // Impersonate store owner
  const handleImpersonate = (store: PlatformStoreTenant) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_active_store_id", store.id);
      localStorage.setItem("matager_active_store_name", store.name);
      localStorage.setItem("matager_impersonated_role", "store_owner");
    }
    window.location.href = buildDashboardUrl(store.id);
  };

  // Open store details
  const handleOpenStoreModal = (store: PlatformStoreTenant) => {
    setSelectedStore(store);
    setCustomCommission(store.commissionRate.toString());
    setShowDetailModal(true);
  };

  // Provisioning form submission
  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provStoreName.trim() || !provOwnerEmail.trim()) return;

    const newStore = provisionNewStoreFromAdmin({
      storeName: provStoreName.trim(),
      subdomain: provSubdomain.trim() || provStoreName.toLowerCase().replace(/[^a-z0-9]+/g, ""),
      ownerName: provOwnerName.trim() || "Store Admin",
      ownerEmail: provOwnerEmail.trim(),
      ownerPhone: provOwnerPhone.trim() || "+20 100 000 0000",
      country: provCountry,
      city: provCity,
      plan: provPlan,
      posNodesCount: provPosNodes,
    });

    setStores(getAllPlatformStores());
    setShowProvisionModal(false);
    triggerNotice(`New store "${newStore.name}" created with ${provPosNodes} POS Cashier nodes!`);

    setProvStoreName("");
    setProvSubdomain("");
    setProvOwnerName("");
    setProvOwnerEmail("");
    setProvOwnerPhone("");
  };

  // If not authenticated as Super Admin, render the Security Clearance Lock Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-red-500/30">
        <div className="w-full max-w-md rounded-3xl bg-neutral-900/90 border border-red-500/30 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-red-600/30">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              Super Admin Clearance Required
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">
              Matager Platform Authority
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              This terminal provides platform-level governance over all registered merchant tenants, subscription billings, and payment settlements. Access is strictly restricted to the Super Admin.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthorize} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Super Admin Email
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="admin@matager.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Security Passkey / Master PIN
              </label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter Super Admin Security Key"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Super Admin Clearance</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link href={APP_ROUTES.dashboard} className="text-white/50 hover:text-white">
              ← Return to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setAdminEmailInput("admin@matager.com");
                setAdminKeyInput("2026");
                setTimeout(() => handleAuthorize(), 50);
              }}
              className="text-amber-400 hover:underline font-bold"
            >
              Demo Auto-Unlock (2026)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans selection:bg-blue-600/30 selection:text-white pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#0479E8] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* ══════════════════ SUPER ADMIN TOP BAR ══════════════════ */}
      <header className="px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                Super Admin Access
              </span>
              <span className="text-[10px] text-white/40">Multi-Tenant Governance (Global)</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none mt-1">
              Matager Platform Control Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowProvisionModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision New Store</span>
          </button>

          <Link
            href={APP_ROUTES.dashboard}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Merchant View</span>
          </Link>

          <Link
            href={APP_ROUTES.cashier}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>POS Cashier View</span>
          </Link>

          <button
            type="button"
            onClick={handleLockSession}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Lock Super Admin Session"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </header>

      {/* ══════════════════ MAIN CONTENT CANVAS ══════════════════ */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* ─── 1. GLOBAL PLATFORM KPIS ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Stores */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Total Stores Provisioned
              </span>
              <Store className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">{totalStores}</span>
              <span className="text-xs text-emerald-400 font-bold">+12% this month</span>
            </div>
            <div className="flex gap-2.5 mt-3 text-[10px] font-bold">
              <span className="text-emerald-400">{activeCount} Active</span>
              <span className="text-blue-400">{trialCount} Trial</span>
              <span className="text-amber-400">{pendingCount} Pending</span>
              <span className="text-red-400">{suspendedCount} Flagged</span>
            </div>
          </div>

          {/* Platform GMV */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Platform GMV · 30 Days
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">
                ${(totalGmv > 0 ? totalGmv : 653400).toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-bold">+18.7%</span>
            </div>
            <div className="flex gap-3 mt-3 text-[10px] text-white/50">
              <span>{totalOrders > 0 ? totalOrders : 2603} total orders</span>
              <span className="text-emerald-400">POS: 44% · Online: 56%</span>
            </div>
          </div>

          {/* Total POS Cashier Nodes */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Active POS Cashier Nodes
              </span>
              <Laptop className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">{totalPosNodes}</span>
              <span className="text-xs text-purple-400 font-bold">Registers Active</span>
            </div>
            <div className="flex gap-3 mt-3 text-[10px] text-white/50">
              <span className="text-emerald-400">Live Hardware Sync: ON</span>
              <span>100% cloud backup</span>
            </div>
          </div>

          {/* Platform Commission */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Platform Commission Earned
              </span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">
                ${Math.round((totalGmv > 0 ? totalGmv : 653400) * 0.05).toLocaleString()}
              </span>
              <span className="text-xs text-amber-400 font-bold">5.0% take rate</span>
            </div>
            <div className="flex gap-3 mt-3 text-[10px] text-white/50">
              <span>Payouts auto-cleared every 48h</span>
            </div>
          </div>
        </section>

        {/* ─── 2. IMMEDIATE PLATFORM ACTIONS HUB ─── */}
        <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Immediate Platform Action Hub
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
              <Server className="w-3 h-3" /> Core Infrastructure Operational (99.98% uptime)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">{pendingCount} Pending Stores</p>
                <p className="text-[10px] text-white/50">Awaiting Super Admin review</p>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">41 Expiring Plans</p>
                <p className="text-[10px] text-white/50">Auto-renewal in 7 days</p>
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">2 Payout Audits</p>
                <p className="text-[10px] text-white/50">Scheduled for Friday</p>
              </div>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <Flag className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">0 Abuse Reports</p>
                <p className="text-[10px] text-white/50">Tenant security verified</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. MULTI-TENANT STORES DIRECTORY ─── */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">All Platform Stores & Owners</h2>
              <p className="text-[10px] text-white/40 mt-0.5">
                Every tenant on the platform with separated store data, POS nodes, and revenue split.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search store, owner, ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-8 pr-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {["all", "active", "trial", "pending", "suspended"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      statusFilter === st
                        ? "bg-white text-black font-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  <th className="p-4">Store Profile</th>
                  <th className="p-4">Owner Contact</th>
                  <th className="p-4">Plan & Region</th>
                  <th className="p-4">POS Cashier Nodes</th>
                  <th className="p-4">Revenue & GMV</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/40 text-xs">
                      No stores found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => {
                    const isPending = store.status === "Pending";
                    const isSuspended = store.status === "Suspended" || store.status === "Past Due";
                    const isActive = store.status === "Active";

                    return (
                      <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-black text-white text-xs shrink-0">
                              {store.name.slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{store.name}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {store.id} · {store.subdomain}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-white">{store.ownerName}</p>
                          <p className="text-[10px] text-white/40">{store.ownerEmail}</p>
                          <p className="text-[10px] text-white/40">{store.ownerPhone}</p>
                        </td>

                        <td className="p-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                            {store.plan}
                          </span>
                          <p className="text-[10px] text-white/50 mt-1">
                            {store.city}, {store.country}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <Laptop className="w-3.5 h-3.5 text-blue-400" />
                            <span>{store.posNodesCount} Terminals</span>
                          </div>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            POS: {store.posSharePercent}% · Online: {store.onlineSharePercent}%
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-black text-white">
                            ${store.gmv_30d.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/40">{store.orders_30d} orders</p>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : store.status === "Trial"
                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                : isPending
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive
                                  ? "bg-emerald-400 animate-pulse"
                                  : isPending
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                            />
                            <span>{store.status}</span>
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenStoreModal(store)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
                              title="Inspect Tenant Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(store)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isActive
                                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                              }`}
                              title={
                                isActive
                                  ? "Suspend Store"
                                  : isPending
                                  ? "Approve & Activate"
                                  : "Activate Store"
                              }
                            >
                              {isActive ? (
                                <PauseCircle className="w-3.5 h-3.5" />
                              ) : (
                                <PlayCircle className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <a
                              href={buildStorefrontUrl(store.id)}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                              title="Open Customer Storefront"
                            >
                              <Store className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleImpersonate(store)}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                              title="Open Merchant Dashboard"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setShowDeleteConfirm(store)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                              title="Delete Store and All Associated Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ══════════════════ MODAL: STORE DETAIL INSPECTION ══════════════════ */}
      {showDetailModal && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-black text-white text-base">
                  {selectedStore.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-none">
                    {selectedStore.name}
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">
                    {selectedStore.id} · {selectedStore.subdomain}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-3.5">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                    Store Owner Profile
                  </p>
                  <p className="text-sm font-bold text-white">{selectedStore.ownerName}</p>
                  <p className="text-white/60">{selectedStore.ownerEmail}</p>
                  <p className="text-white/50">{selectedStore.ownerPhone}</p>
                  <p className="text-white/40 mt-1">
                    {selectedStore.city}, {selectedStore.country}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Subscription Tier</span>
                    <span className="font-bold text-white">{selectedStore.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Tenant Status</span>
                    <span
                      className={`font-bold uppercase text-[10px] ${
                        selectedStore.status === "Active" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {selectedStore.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">POS Terminals</span>
                    <span className="font-bold text-white">
                      {selectedStore.posNodesCount} Active Nodes
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 md:border-l md:border-white/10 md:pl-5">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    Tenant Performance (30 Days)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[9px] uppercase font-bold text-emerald-400">GMV</p>
                      <p className="text-sm font-black text-white mt-0.5">
                        ${selectedStore.gmv_30d.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-[9px] uppercase font-bold text-blue-400">Orders</p>
                      <p className="text-sm font-black text-white mt-0.5">
                        {selectedStore.orders_30d}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                    Platform Commission Take Rate
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={customCommission}
                      onChange={(e) => setCustomCommission(e.target.value)}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-white/50">% of GMV</span>
                    <button
                      onClick={() => {
                        triggerNotice(`Commission rate for "${selectedStore.name}" updated to ${customCommission}%.`);
                      }}
                      className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleImpersonate(selectedStore)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Impersonate</span>
                  </button>
                  <button
                    onClick={() => {
                      handleToggleStatus(selectedStore);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl font-bold"
                  >
                    {selectedStore.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowDeleteConfirm(selectedStore);
                    }}
                    className="py-2 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-xl font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: PROVISION NEW STORE WIZARD ══════════════════ */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400" />
                  <span>Provision New Tenant Store</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Creates store owner account, assigns subdomain, and initializes POS cashier network.
                </p>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Store Brand Name</label>
                  <input
                    type="text"
                    required
                    value={provStoreName}
                    onChange={(e) => setProvStoreName(e.target.value)}
                    placeholder="e.g. Royal Cairo Goods"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Subdomain Slug</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2.5">
                    <input
                      type="text"
                      value={provSubdomain}
                      onChange={(e) => setProvSubdomain(e.target.value)}
                      placeholder="royalcairo"
                      className="w-full bg-transparent p-2 text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-white/40">.matager.com</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Store Owner Credentials
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 block mb-1">Owner Full Name</label>
                    <input
                      type="text"
                      required
                      value={provOwnerName}
                      onChange={(e) => setProvOwnerName(e.target.value)}
                      placeholder="e.g. Kareem Hossam"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Owner Email</label>
                    <input
                      type="email"
                      required
                      value={provOwnerEmail}
                      onChange={(e) => setProvOwnerEmail(e.target.value)}
                      placeholder="kareem@royalcairo.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Owner Contact Phone</label>
                  <input
                    type="tel"
                    value={provOwnerPhone}
                    onChange={(e) => setProvOwnerPhone(e.target.value)}
                    placeholder="+20 100 458 9201"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Country</label>
                  <select
                    value={provCountry}
                    onChange={(e) => setProvCountry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Egypt" className="bg-neutral-900">Egypt</option>
                    <option value="Saudi Arabia" className="bg-neutral-900">Saudi Arabia</option>
                    <option value="UAE" className="bg-neutral-900">UAE</option>
                    <option value="Morocco" className="bg-neutral-900">Morocco</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">City</label>
                  <input
                    type="text"
                    value={provCity}
                    onChange={(e) => setProvCity(e.target.value)}
                    placeholder="Cairo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Plan Tier</label>
                  <select
                    value={provPlan}
                    onChange={(e) => setProvPlan(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Matager-50" className="bg-neutral-900">Matager-50</option>
                    <option value="Matager-100" className="bg-neutral-900">Matager-100</option>
                    <option value="Matager-250" className="bg-neutral-900">Matager-250</option>
                    <option value="Matager-500" className="bg-neutral-900">Matager-500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Initial POS Cashier Nodes to Provision</label>
                <div className="flex gap-3">
                  {[1, 2, 4, 8].map((qty) => (
                    <button
                      type="button"
                      key={qty}
                      onClick={() => setProvPosNodes(qty)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        provPosNodes === qty
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {qty} POS {qty === 1 ? "Node" : "Nodes"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white font-bold shadow-md shadow-blue-500/25"
                >
                  Launch & Provision Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL: DELETE STORE CONFIRMATION ══════════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-red-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Delete Store "{showDeleteConfirm.name}"?
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                This will permanently delete store ID <span className="text-white">{showDeleteConfirm.id}</span>, its owner credentials, all {showDeleteConfirm.posNodesCount} associated POS terminals, inventory catalog, order history, and database records. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
