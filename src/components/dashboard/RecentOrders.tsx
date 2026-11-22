"use client";

import React, { useState, useEffect } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { subscribeToOrders, getActiveStoreId } from "@/lib/firestore-service";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  XCircle,
  Phone,
  MessageCircle,
  FileText
} from "lucide-react";

interface RecentOrdersProps {
  externalFilter?: string;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ externalFilter = "" }) => {
  const { t } = useDashboardLanguage();
  const [stuckSearch, setStuckSearch] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const sendCartReminder = (name: string, phone: string, total: string) => {
    const cartLink = "https://yourstore.com/cart";
    const message = `*Wait, don't leave your items behind!* 🛒\n\n` +
      `Hi *${name}*, we noticed you left some items in your cart totaling *${total} EGP*.\n\n` +
      `Items in our shop move fast! Complete your checkout now to secure your order.\n\n` +
      `🔗 *Check out here:* ${cartLink}\n\n` +
      `If you have any questions, we're here to help!`;
    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const initialOrders = [
    {
      id: "#ORD-8822",
      customer: "John Doe",
      email: "john@example.com",
      phone: "+20 101 234 5678",
      address: "123 Nile St, Cairo",
      status: "Pending",
      variant: "pending" as const,
      total: "EGP 5,200",
      items: [
        { name: "Wireless Headphones", qty: 2, price: "EGP 2,500" },
        { name: "Phone Case", qty: 1, price: "EGP 200" }
      ]
    },
    {
      id: "#ORD-8823",
      customer: "Jane Smith",
      email: "jane@example.com",
      phone: "+20 102 345 6789",
      address: "45 Pyramids Rd, Giza",
      status: "Shipped",
      variant: "info" as const,
      total: "EGP 1,290",
      items: [
        { name: "Smart Watch", qty: 1, price: "EGP 1,290" }
      ]
    },
    {
      id: "#ORD-8824",
      customer: "Ahmed Kamal",
      email: "ahmed@example.com",
      phone: "+20 103 456 7890",
      address: "78 Corniche, Alexandria",
      status: "Delivered",
      variant: "success" as const,
      total: "EGP 3,450",
      items: [
        { name: "Bluetooth Speaker", qty: 1, price: "EGP 1,450" },
        { name: "Power Bank", qty: 2, price: "EGP 1,000" }
      ]
    },
  ];

  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const storeId = getActiveStoreId();
    const unsub = subscribeToOrders(storeId, (liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        const mapped = liveOrders.map((t) => ({
          id: t.id.startsWith("#") ? t.id : `#${t.id.slice(-6).toUpperCase()}`,
          customer: t.customer_name || "Guest Customer",
          email: "guest@example.com",
          phone: "+20 100 000 0000",
          address: "Unknown Address",
          status: t.status,
          variant: (t.status === "Completed" ? "success" : t.status === "Pending" ? "pending" : "info") as any,
          total: `EGP ${Number(t.amount).toLocaleString()}`,
          items: [{ name: "Live Item", qty: 1, price: `EGP ${Number(t.amount).toLocaleString()}` }]
        }));
        setOrders([...mapped, ...initialOrders]);
      }
    });

    const handleLocalNewOrder = (e: any) => {
      const t = e.detail;
      if (t) {
        setOrders((prev) => [
          {
            id: `#${t.id.slice(-6).toUpperCase()}`,
            customer: t.customer_name || "Guest Customer",
            email: "guest@example.com",
            phone: "+20 100 000 0000",
            address: "Unknown Address",
            status: t.status,
            variant: "success" as const,
            total: `EGP ${Number(t.amount).toLocaleString()}`,
            items: [{ name: "New Order Item", qty: 1, price: `EGP ${Number(t.amount).toLocaleString()}` }]
          },
          ...prev,
        ]);
      }
    };

    window.addEventListener("matager:new_order", handleLocalNewOrder);

    return () => {
      unsub();
      window.removeEventListener("matager:new_order", handleLocalNewOrder);
    };
  }, []);

  // Mock actions for order management
  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setExpandedOrderId(null);
    }
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "Cancelled", variant: "danger" as any } : o
      )
    );
  };

  const handleEditOrder = (id: string) => {
    alert(`Initiate edit flow for Order ${id}`);
  };

  const stuckCarts = [
    {
      id: "sc-1",
      name: "John Doe",
      email: "j.doe@example.com",
      value: "147.50 EGP",
      items: "02 Items",
      phone: "201010773587",
      totalNum: "147.50",
    },
    {
      id: "sc-2",
      name: "Jane Smith",
      email: "jane.s@example.com",
      value: "89.00 EGP",
      items: "01 Items",
      phone: "201010773587",
      totalNum: "89.00",
    },
  ];

  // Combined Filter (External + Local Search)
  const filteredOrders = orders.filter((ord) => {
    const matchExternal =
      ord.customer.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.id.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.status.toLowerCase().includes(externalFilter.toLowerCase());

    const matchLocal =
      ord.customer.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.status.toLowerCase().includes(orderSearchQuery.toLowerCase());

    return matchExternal && matchLocal;
  });

  const filteredStuck = stuckCarts.filter(
    (cart) =>
      cart.name.toLowerCase().includes(stuckSearch.toLowerCase()) ||
      cart.email.toLowerCase().includes(stuckSearch.toLowerCase())
  );

  const toggleRow = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200">
      {/* Pure-CSS Checkboxes for 3 Stacked Sections */}
      <input type="checkbox" id="toggle-order-summary" className="peer/summary hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-latest-order" className="peer/latest hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-stuck-carts" className="peer/stuckcart hidden" aria-hidden="true" />

      {/* Main Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
          {t.recentOrders.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Toggle 1: Summary */}
          <label
            htmlFor="toggle-order-summary"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/summary:[&_.summary-chevron]:rotate-180"
          >
            <span>{t.recentOrders.showDetails}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:text-[var(--color-text-primary)] summary-chevron" />
          </label>

          {/* Toggle 2: Latest Order */}
          <label
            htmlFor="toggle-latest-order"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/latest:[&_.latest-chevron]:rotate-180"
          >
            <span>{t.recentOrders.showLatestOrder}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:text-[var(--color-text-primary)] latest-chevron" />
          </label>

          {/* Toggle 3: Stuck Carts */}
          <label
            htmlFor="toggle-stuck-carts"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/stuckcart:[&_.cart-chevron]:rotate-180"
          >
            <span>{t.recentOrders.showStuckCarts}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:text-[var(--color-text-primary)] cart-chevron" />
          </label>

          <button
            type="button"
            className="text-[11px] font-bold text-[var(--color-primary-light)] hover:underline"
          >
            {t.recentOrders.viewAll}
          </button>
        </div>
      </div>

      {/* 1. RECENT ORDERS SUMMARY DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/summary:max-h-[220px] bg-slate-50 dark:bg-white/[0.02] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold font-heading text-[var(--color-text-primary)] text-lg leading-none">
                  150
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                  {t.recentOrders.summary.active}
                </span>
              </div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--color-text-muted)]">{t.recentOrders.summary.fulfillment}</span>
                <span className="text-[var(--color-status-green)] font-bold">98.2%</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--color-text-muted)]">{t.recentOrders.summary.avgTime}</span>
                <span className="text-[var(--color-status-blue)] font-bold">4.2h</span>
              </div>
            </div>

            <button
              type="button"
              className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] underline decoration-[var(--color-border)] underline-offset-2 transition-colors font-ui"
            >
              {t.recentOrders.summary.fullLedger}
            </button>
          </div>

          {/* 5-Column Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: t.recentOrders.summary.pending, count: "04", pct: "3%", color: "amber" },
              { label: t.recentOrders.summary.accepted, count: "25", pct: "17%", color: "blue" },
              { label: t.recentOrders.summary.shipped, count: "65", pct: "43%", color: "purple" },
              { label: t.recentOrders.summary.delivered, count: "56", pct: "37%", color: "green" },
              { label: t.recentOrders.summary.returned, count: "12", pct: "8%", color: "red" }
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col p-2.5 bg-[var(--color-status-${stat.color}-bg)] rounded-xl border border-[var(--color-status-${stat.color}-border)]`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[8px] font-black uppercase tracking-wider text-[var(--color-status-${stat.color})]`}>
                    {stat.label}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full bg-[var(--color-status-${stat.color})]`} />
                </div>
                <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                  {stat.count}
                </span>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className={`bg-[var(--color-status-${stat.color})] h-full`} style={{ width: stat.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LATEST ORDER DETAILS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/latest:max-h-[320px] bg-slate-50 dark:bg-white/[0.02] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1: Customer */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                {t.recentOrders.latestOrder.customer}
              </p>
              <p className="text-sm font-bold font-ui text-[var(--color-text-primary)] mb-0.5">
                {t.recentOrders.latestOrder.customerName}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-2">
                {t.recentOrders.latestOrder.orderId}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mb-1">
                {t.recentOrders.latestOrder.phone}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {t.recentOrders.latestOrder.address}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <a
                href={`tel:${t.recentOrders.latestOrder.phone}`}
                className="flex-1 py-1.5 text-center border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {t.recentOrders.latestOrder.call}
              </a>
              <button
                type="button"
                onClick={() => sendCartReminder(t.recentOrders.latestOrder.customerName, "201234567890", "147.50")}
                className="flex-1 py-1.5 border border-[var(--color-border-subtle)] hover:border-[var(--color-status-green)] text-[var(--color-status-green)] rounded text-[10px] font-bold transition-colors"
              >
                {t.recentOrders.latestOrder.whatsapp}
              </button>
            </div>
          </div>

          {/* Col 2: Order Summary */}
          <div className="flex flex-col justify-between md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-6 rtl:md:pl-0 rtl:md:pr-6">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                {t.recentOrders.latestOrder.orderSummary}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">
                {t.recentOrders.latestOrder.totalAmount}
              </p>
              <p className="text-xl font-bold font-heading text-[var(--color-status-green)] mb-2">
                {t.recentOrders.latestOrder.totalValue}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                {t.recentOrders.latestOrder.date}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="flex-1 py-1.5 border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                {t.recentOrders.latestOrder.invoice}
              </button>
              <button type="button" className="flex-1 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded text-[10px] font-bold transition-all shadow-sm">
                {t.recentOrders.latestOrder.process}
              </button>
            </div>
          </div>

          {/* Col 3: Manifest */}
          <div className="flex flex-col md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-6 rtl:md:pl-0 rtl:md:pr-6">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
              {t.recentOrders.latestOrder.manifestTitle}
            </p>
            <div className="space-y-2 overflow-y-auto pr-1 max-h-[140px] custom-scrollbar">
              {t.recentOrders.latestOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-[11px] border-b border-[var(--color-border-subtle)] pb-1.5 last:border-b-0">
                  <div>
                    <p className="text-[var(--color-text-primary)] font-medium">{item.name}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">{item.meta}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--color-text-primary)]">{item.qty}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STUCK CARTS TABLE DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/stuckcart:max-h-[350px] bg-slate-50 dark:bg-white/[0.02] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={stuckSearch}
              onChange={(e) => setStuckSearch(e.target.value)}
              placeholder={t.recentOrders.stuckCarts.searchPlaceholder}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-[var(--color-border-subtle)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui transition-colors"
            />
          </div>

          <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-[10px]">
              <thead>
                <tr className="text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thCustomer}</th>
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thValue}</th>
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thStatus}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">{t.recentOrders.stuckCarts.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {filteredStuck.map((cart) => (
                  <tr key={cart.id} className="hover:bg-slate-100 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5">
                      <p className="font-bold text-[var(--color-text-primary)]">{cart.name}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">{cart.email}</p>
                    </td>
                    <td className="py-2.5">
                      <p className="font-bold text-[var(--color-text-primary)]">{cart.value}</p>
                      <p className="text-[9px] text-[var(--color-status-orange)]">{cart.items}</p>
                    </td>
                    <td className="py-2.5">
                      <StatusPill variant="orange">{t.recentOrders.stuckCarts.statusBadge}</StatusPill>
                    </td>
                    <td className="py-2.5 text-right rtl:text-left space-x-1 rtl:space-x-reverse">
                      <button
                        type="button"
                        onClick={() => sendCartReminder(cart.name, cart.phone, cart.totalNum)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-[var(--color-border-subtle)] hover:border-[var(--color-status-green)] hover:text-[var(--color-status-green)] rounded text-[9px] font-bold text-[var(--color-text-secondary)] transition-colors"
                      >
                        {t.recentOrders.stuckCarts.remindBtn}
                      </button>
                      <a
                        href={`tel:${cart.phone}`}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[9px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-block"
                      >
                        {t.recentOrders.stuckCarts.callBtn}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MAIN ORDERS TABLE WITH INLINE EXPANSION & SEARCH ─── */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] bg-slate-50/50 dark:bg-transparent">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer, or Status..."
            className="w-full bg-white dark:bg-[var(--color-bg)] border border-slate-200 dark:border-[var(--color-border-subtle)] rounded-xl py-2 pl-9 pr-4 rtl:pl-4 rtl:pr-9 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]/50 transition-all font-ui"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse min-w-[700px]">
          <thead>
            <tr className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)] bg-slate-50/50 dark:bg-white/[0.01]">
              <th className="p-4 font-medium w-12"></th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thOrderId}</th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thCustomer}</th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thStatus}</th>
              <th className="p-4 font-medium text-right rtl:text-left">{t.recentOrders.originalTable.thTotal}</th>
            </tr>
          </thead>
          <tbody className="text-xs font-ui divide-y divide-[var(--color-border-subtle)]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">
                  No orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const isExpanded = expandedOrderId === ord.id;
                return (
                  <React.Fragment key={ord.id}>
                    {/* Main Row */}
                    <tr
                      onClick={() => toggleRow(ord.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group ${isExpanded ? "bg-slate-50 dark:bg-white/[0.02]" : ""
                        }`}
                    >
                      <td className="p-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)] font-medium">
                        {ord.id}
                      </td>
                      <td className="p-4 text-[var(--color-text-primary)] font-bold customer-name">
                        {ord.customer}
                      </td>
                      <td className="p-4">
                        <StatusPill variant={ord.variant}>{ord.status}</StatusPill>
                      </td>
                      <td className="p-4 text-[var(--color-text-primary)] font-bold text-right rtl:text-left">
                        {ord.total}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-[#0a0a0a]/50">
                        <td colSpan={5} className="p-0 border-b border-[var(--color-border-subtle)]">
                          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">

                            {/* Customer Info */}
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                                  Customer Details
                                </h5>
                                <p className="text-sm font-bold text-[var(--color-text-primary)]">{ord.customer}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{ord.email}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{ord.phone}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{ord.address}</p>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <a href={`tel:${ord.phone}`} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                  <Phone className="w-3 h-3" /> Call
                                </a>
                                <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-status-green)] hover:border-[var(--color-status-green)]/50 transition-all">
                                  <MessageCircle className="w-3 h-3" /> WhatsApp
                                </button>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="lg:border-l lg:border-slate-200 dark:lg:border-white/10 lg:pl-6">
                              <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                                Order Manifest
                              </h5>
                              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                {ord.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                    <div>
                                      <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                                      <p className="text-[10px] text-[var(--color-text-muted)]">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-bold text-[var(--color-text-primary)]">{item.price}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <span className="text-xs font-bold text-[var(--color-text-muted)]">Total</span>
                                <span className="text-sm font-black text-[var(--color-status-green)]">{ord.total}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="lg:border-l lg:border-slate-200 dark:lg:border-white/10 lg:pl-6 flex flex-col justify-between">
                              <div>
                                <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                                  Order Actions
                                </h5>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleEditOrder(ord.id)}
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Edit Items
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(ord.id)}
                                    disabled={ord.status === "Cancelled" || ord.status === "Delivered"}
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Cancel Order
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="w-full mt-4 sm:mt-0 py-2 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Order
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};