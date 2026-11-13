"use client";

import React, { useState, useEffect } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { subscribeToOrders, getActiveStoreId } from "@/lib/firestore-service";

interface RecentOrdersProps {
  externalFilter?: string;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ externalFilter = "" }) => {
  const { t } = useDashboardLanguage();
  const [stuckSearch, setStuckSearch] = useState("");

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
      status: "Pending",
      variant: "pending" as const,
      total: "EGP 5,200",
    },
    {
      id: "#ORD-8823",
      customer: "Jane Smith",
      status: "Shipped",
      variant: "info" as const,
      total: "EGP 1,290",
    },
    {
      id: "#ORD-8824",
      customer: "Ahmed Kamal",
      status: "Delivered",
      variant: "success" as const,
      total: "EGP 3,450",
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
          status: t.status,
          variant: (t.status === "Completed" ? "success" : t.status === "Pending" ? "pending" : "info") as any,
          total: `EGP ${Number(t.amount).toLocaleString()}`,
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
            status: t.status,
            variant: "success" as const,
            total: `EGP ${Number(t.amount).toLocaleString()}`,
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

  const filteredOrders = orders.filter(
    (ord) =>
      ord.customer.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.id.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.status.toLowerCase().includes(externalFilter.toLowerCase())
  );

  const filteredStuck = stuckCarts.filter(
    (cart) =>
      cart.name.toLowerCase().includes(stuckSearch.toLowerCase()) ||
      cart.email.toLowerCase().includes(stuckSearch.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
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
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] summary-chevron text-[10px]" />
          </label>

          {/* Toggle 2: Latest Order */}
          <label
            htmlFor="toggle-latest-order"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/latest:[&_.latest-chevron]:rotate-180"
          >
            <span>{t.recentOrders.showLatestOrder}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] latest-chevron text-[10px]" />
          </label>

          {/* Toggle 3: Stuck Carts */}
          <label
            htmlFor="toggle-stuck-carts"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/stuckcart:[&_.cart-chevron]:rotate-180"
          >
            <span>{t.recentOrders.showStuckCarts}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] cart-chevron text-[10px]" />
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
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/summary:max-h-[220px] bg-white/[0.01] border-b border-[var(--color-border-subtle)]/30">
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
            {/* Pending */}
            <div className="flex flex-col p-2.5 bg-[var(--color-status-amber-bg)] rounded-xl border border-[var(--color-status-amber-border)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-status-amber)]">
                  {t.recentOrders.summary.pending}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-amber)]" />
              </div>
              <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                04
              </span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--color-status-amber)] h-full w-[3%]" />
              </div>
            </div>

            {/* Accepted */}
            <div className="flex flex-col p-2.5 bg-[var(--color-status-blue-bg)] rounded-xl border border-[var(--color-status-blue-border)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-status-blue)]">
                  {t.recentOrders.summary.accepted}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-blue)]" />
              </div>
              <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                25
              </span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--color-status-blue)] h-full w-[17%]" />
              </div>
            </div>

            {/* Shipped */}
            <div className="flex flex-col p-2.5 bg-[var(--color-status-purple-bg)] rounded-xl border border-[var(--color-status-purple-border)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-status-purple)]">
                  {t.recentOrders.summary.shipped}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-purple)]" />
              </div>
              <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                65
              </span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--color-status-purple)] h-full w-[43%]" />
              </div>
            </div>

            {/* Delivered */}
            <div className="flex flex-col p-2.5 bg-[var(--color-status-green-bg)] rounded-xl border border-[var(--color-status-green-border)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-status-green)]">
                  {t.recentOrders.summary.delivered}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)]" />
              </div>
              <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                56
              </span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--color-status-green)] h-full w-[37%]" />
              </div>
            </div>

            {/* Returned */}
            <div className="flex flex-col p-2.5 bg-[var(--color-status-red-bg)] rounded-xl border border-[var(--color-status-red-border)] col-span-2 sm:col-span-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-status-red)]">
                  {t.recentOrders.summary.returned}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-red)]" />
              </div>
              <span className="text-sm font-bold font-heading text-[var(--color-text-primary)] mb-1">
                12
              </span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--color-status-red)] h-full w-[8%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LATEST ORDER DETAILS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/latest:max-h-[320px] bg-white/[0.01] border-b border-[var(--color-border-subtle)]/30">
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
                onClick={() =>
                  sendCartReminder(
                    t.recentOrders.latestOrder.customerName,
                    "201234567890",
                    "147.50"
                  )
                }
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
              <button
                type="button"
                className="flex-1 py-1.5 border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {t.recentOrders.latestOrder.invoice}
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded text-[10px] font-bold transition-all shadow-sm"
              >
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
              {t.recentOrders.latestOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[11px] border-b border-[var(--color-border-subtle)] pb-1.5 last:border-b-0"
                >
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
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/stuckcart:max-h-[350px] bg-white/[0.01] border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="relative w-full max-w-xs">
            <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={stuckSearch}
              onChange={(e) => setStuckSearch(e.target.value)}
              placeholder={t.recentOrders.stuckCarts.searchPlaceholder}
              className="w-full bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
            />
          </div>

          <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-[10px]">
              <thead>
                <tr className="text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thCustomer}</th>
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thValue}</th>
                  <th className="pb-2 font-medium">{t.recentOrders.stuckCarts.thStatus}</th>
                  <th className="pb-2 font-medium text-right rtl:text-left">
                    {t.recentOrders.stuckCarts.thActions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {filteredStuck.map((cart) => (
                  <tr key={cart.id} className="hover:bg-white/[0.02]">
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
                        className="px-2.5 py-1 bg-white/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-status-green)] hover:text-[var(--color-status-green)] rounded text-[9px] font-bold text-[var(--color-text-secondary)] transition-colors"
                      >
                        {t.recentOrders.stuckCarts.remindBtn}
                      </button>
                      <a
                        href={`tel:${cart.phone}`}
                        className="px-2.5 py-1 bg-white/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[9px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-block"
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

      {/* ORIGINAL 3-ROW ORDERS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thOrderId}</th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thCustomer}</th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thStatus}</th>
              <th className="p-4 font-medium">{t.recentOrders.originalTable.thTotal}</th>
            </tr>
          </thead>
          <tbody className="text-xs font-ui divide-y divide-[var(--color-border-subtle)]">
            {filteredOrders.map((ord) => (
              <tr
                key={ord.id}
                className="hover:bg-white/[0.02] transition-colors order-row"
              >
                <td className="p-4 text-[var(--color-text-secondary)] order-id">
                  {ord.id}
                </td>
                <td className="p-4 text-[var(--color-text-primary)] font-bold customer-name">
                  {ord.customer}
                </td>
                <td className="p-4">
                  <StatusPill variant={ord.variant}>{ord.status}</StatusPill>
                </td>
                <td className="p-4 text-[var(--color-text-primary)] font-bold">
                  {ord.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
