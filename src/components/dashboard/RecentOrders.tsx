"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  XCircle,
  Phone,
  PlusCircle,
  Package,
} from "lucide-react";

interface RecentOrdersProps {
  externalFilter?: string;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ externalFilter = "" }) => {
  const { t, locale, dir } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { orders, addOrder, editOrder, removeOrder } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleOpenCreateOrder = () => {
    openCrudModal({
      mode: "create",
      entity: "order",
      title: isRtl ? "إنشاء طلب جديد" : "Create New Order",
      fields: [
        { name: "customer", label: isRtl ? "اسم العميل" : "Customer Name", required: true, placeholder: "e.g. Omar Mohamed" },
        { name: "phone", label: isRtl ? "رقم الهاتف" : "Phone Number", type: "tel", required: true, placeholder: "+20 100 000 0000" },
        { name: "email", label: isRtl ? "البريد الإلكتروني" : "Email", type: "email", placeholder: "customer@example.com" },
        { name: "address", label: isRtl ? "عنوان الشحن" : "Shipping Address", type: "textarea", placeholder: "e.g. 15 El-Tahrir St, Cairo" },
        { name: "amount", label: isRtl ? "إجمالي المبلغ (ج.م)" : "Total Amount (EGP)", type: "number", required: true, placeholder: "500" },
        {
          name: "status",
          label: isRtl ? "حالة الطلب" : "Order Status",
          type: "select",
          defaultValue: "Pending",
          options: [
            { label: isRtl ? "قيد الانتظار (Pending)" : "Pending", value: "Pending" },
            { label: isRtl ? "مقبول (Accepted)" : "Accepted", value: "Accepted" },
            { label: isRtl ? "تم الشحن (Shipped)" : "Shipped", value: "Shipped" },
            { label: isRtl ? "تم التوصيل (Delivered)" : "Delivered", value: "Delivered" },
          ],
        },
      ],
      onSubmit: async (data) => {
        await addOrder({
          customer: data.customer,
          phone: data.phone,
          email: data.email,
          address: data.address,
          amount: Number(data.amount) || 0,
          status: data.status || "Pending",
          total: `EGP ${Number(data.amount || 0).toLocaleString()}`,
        });
      },
    });
  };

  const handleOpenEditOrder = (ord: any) => {
    openCrudModal({
      mode: "edit",
      entity: "order",
      title: isRtl ? `تعديل الطلب ${ord.id}` : `Edit Order ${ord.id}`,
      initialData: {
        customer: ord.customer,
        phone: ord.phone,
        email: ord.email,
        address: ord.address,
        amount: ord.amount,
        status: ord.status,
      },
      fields: [
        { name: "customer", label: isRtl ? "اسم العميل" : "Customer Name", required: true },
        { name: "phone", label: isRtl ? "رقم الهاتف" : "Phone Number", type: "tel", required: true },
        { name: "email", label: isRtl ? "البريد الإلكتروني" : "Email", type: "email" },
        { name: "address", label: isRtl ? "عنوان الشحن" : "Shipping Address", type: "textarea" },
        { name: "amount", label: isRtl ? "إجمالي المبلغ (ج.م)" : "Total Amount (EGP)", type: "number", required: true },
        {
          name: "status",
          label: isRtl ? "حالة الطلب" : "Order Status",
          type: "select",
          options: [
            { label: "Pending", value: "Pending" },
            { label: "Accepted", value: "Accepted" },
            { label: "Shipped", value: "Shipped" },
            { label: "Delivered", value: "Delivered" },
            { label: "Cancelled", value: "Cancelled" },
          ],
        },
      ],
      onSubmit: async (data) => {
        await editOrder(ord.id, {
          customer: data.customer,
          phone: data.phone,
          email: data.email,
          address: data.address,
          amount: Number(data.amount) || ord.amount,
          status: data.status,
          total: `EGP ${Number(data.amount || ord.amount).toLocaleString()}`,
        });
      },
    });
  };

  const handleOpenDeleteOrder = (ord: any) => {
    openCrudModal({
      mode: "delete",
      entity: "order",
      title: isRtl ? `تأكيد حذف الطلب ${ord.id}` : `Confirm Deleting Order ${ord.id}`,
      initialData: {
        id: ord.id,
        name: `${ord.customer} (${ord.total})`,
      },
      onDelete: async () => {
        await removeOrder(ord.id);
        setExpandedOrderId(null);
      },
    });
  };

  const handleCancelOrder = async (ord: any) => {
    await editOrder(ord.id, { status: "Cancelled", variant: "danger" as any });
  };

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const matchExternal =
      !externalFilter ||
      ord.customer.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.id.toLowerCase().includes(externalFilter.toLowerCase()) ||
      ord.status.toLowerCase().includes(externalFilter.toLowerCase());

    const matchLocal =
      !orderSearchQuery ||
      ord.customer.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.status.toLowerCase().includes(orderSearchQuery.toLowerCase());

    return matchExternal && matchLocal;
  });

  const toggleRow = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const totalActive = orders.length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered" || o.status === "Completed").length;
  const fulfillmentRate = totalActive > 0 ? `${Math.round((deliveredCount / totalActive) * 100)}%` : "0%";

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const acceptedCount = orders.filter((o) => o.status === "Accepted").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const returnedCount = orders.filter((o) => o.status === "Cancelled").length;

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200">
      {/* Pure-CSS Checkboxes for 3 Stacked Sections */}
      <input type="checkbox" id="toggle-order-summary" className="peer/summary hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-latest-order" className="peer/latest hidden" aria-hidden="true" />
      <input type="checkbox" id="toggle-stuck-carts" className="peer/stuckcart hidden" aria-hidden="true" />

      {/* Main Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.recentOrders.title}
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            {orders.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Create Order Button */}
          <button
            type="button"
            onClick={handleOpenCreateOrder}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-[10px] font-bold font-ui shadow-sm hover:opacity-95 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isRtl ? "طلب جديد" : "New Order"}</span>
          </button>

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
        </div>
      </div>

      {/* 1. RECENT ORDERS SUMMARY DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/summary:max-h-[220px] bg-[var(--color-surface-elevated)]/40 border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold font-heading text-[var(--color-text-primary)] text-lg leading-none">
                  {totalActive}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                  {t.recentOrders.summary.active}
                </span>
              </div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--color-text-muted)]">{t.recentOrders.summary.fulfillment}</span>
                <span className="text-[var(--color-status-green)] font-bold">{fulfillmentRate}</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--color-text-muted)]">{t.recentOrders.summary.avgTime}</span>
                <span className="text-[var(--color-status-blue)] font-bold">{totalActive > 0 ? "4.2h" : "--"}</span>
              </div>
            </div>
          </div>

          {/* 5-Column Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: t.recentOrders.summary.pending, count: pendingCount, color: "amber" },
              { label: t.recentOrders.summary.accepted, count: acceptedCount, color: "blue" },
              { label: t.recentOrders.summary.shipped, count: shippedCount, color: "purple" },
              { label: t.recentOrders.summary.delivered, count: deliveredCount, color: "green" },
              { label: t.recentOrders.summary.returned, count: returnedCount, color: "red" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col p-2.5 bg-[var(--color-status-${stat.color}-bg)] rounded-xl border border-[var(--color-status-${stat.color}-border)]`}
              >
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
                  <div
                    className={`bg-[var(--color-status-${stat.color})] h-full`}
                    style={{ width: totalActive > 0 ? `${(stat.count / totalActive) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LATEST ORDER DETAILS DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/latest:max-h-[320px] bg-[var(--color-surface-elevated)]/40 border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5">
          {orders.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
              {isRtl ? "لا توجد طلبات بعد" : "No orders yet"}
            </div>
          ) : (
            (() => {
              const latest = orders[0];
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Col 1: Customer */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                        {t.recentOrders.latestOrder.customer}
                      </p>
                      <p className="text-sm font-bold font-ui text-[var(--color-text-primary)] mb-0.5">
                        {latest.customer}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mb-2">{latest.id}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mb-1">{latest.phone}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">{latest.address}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a
                        href={`tel:${latest.phone}`}
                        className="flex-1 py-1.5 text-center border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] rounded text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {t.recentOrders.latestOrder.call}
                      </a>
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
                        {latest.total}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                        {latest.created_at ? new Date(latest.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>

                  {/* Col 3: Items */}
                  <div className="flex flex-col md:border-l rtl:md:border-l-0 rtl:md:border-r border-[var(--color-border-subtle)] md:pl-6 rtl:md:pl-0 rtl:md:pr-6">
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                      {t.recentOrders.latestOrder.manifestTitle}
                    </p>
                    <div className="space-y-2 overflow-y-auto pr-1 max-h-[140px] custom-scrollbar">
                      {latest.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-[11px] border-b border-[var(--color-border-subtle)] pb-1.5 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-[var(--color-text-primary)] font-medium">{item.name}</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">Qty: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[var(--color-text-primary)]">
                              {typeof item.price === "number" ? `EGP ${item.price}` : item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* 3. STUCK CARTS TABLE DRAWER */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/stuckcart:max-h-[350px] bg-[var(--color-surface-elevated)]/40 border-b border-[var(--color-border-subtle)]/30">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="py-6 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
            {isRtl ? "لا توجد سلات متروكة حالياً" : "No stuck carts at this time"}
          </div>
        </div>
      </div>

      {/* ─── MAIN ORDERS TABLE WITH INLINE EXPANSION & SEARCH ─── */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/20">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            placeholder={isRtl ? "البحث برقم الطلب، العميل، أو الحالة..." : "Search by Order ID, Customer, or Status..."}
            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-4 rtl:pl-4 rtl:pr-9 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] transition-all font-ui"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse min-w-[700px]">
          <thead>
            <tr className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/30">
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
                <td colSpan={5} className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center mx-auto text-[var(--color-text-muted)]">
                      <Package className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">
                      {isRtl ? "لا توجد طلبات بعد" : "No orders yet"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] font-subtitle">
                      {isRtl
                        ? "الطلبات الجديدة ستظهر هنا فور إتمام الشراء، أو يمكنك إنشاء طلب تجريبي الآن."
                        : "Orders placed by customers will automatically appear here in real-time."}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleOpenCreateOrder}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-white text-xs font-bold font-ui hover:opacity-95 shadow-sm inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{isRtl ? "إنشاء طلب تجريبي" : "Create Test Order"}</span>
                      </button>
                    </div>
                  </div>
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
                      className={`hover:bg-[var(--color-surface-elevated)]/60 transition-colors cursor-pointer group ${
                        isExpanded ? "bg-[var(--color-surface-elevated)]/60" : ""
                      }`}
                    >
                      <td className="p-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)] font-medium">
                        {ord.id}
                      </td>
                      <td className="p-4 text-[var(--color-text-primary)] font-bold">
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
                      <tr className="bg-[var(--color-surface-elevated)]/40">
                        <td colSpan={5} className="p-0 border-b border-[var(--color-border-subtle)]">
                          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                            {/* Customer Info */}
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 font-subtitle">
                                  {isRtl ? "بيانات العميل" : "Customer Details"}
                                </h5>
                                <p className="text-sm font-bold text-[var(--color-text-primary)]">{ord.customer}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{ord.email}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{ord.phone}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{ord.address}</p>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <a
                                  href={`tel:${ord.phone}`}
                                  className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                                >
                                  <Phone className="w-3 h-3" /> {isRtl ? "اتصال" : "Call"}
                                </a>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-[var(--color-border-subtle)] lg:pl-6 rtl:lg:pl-0 rtl:lg:pr-6">
                              <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 font-subtitle">
                                {isRtl ? "تفاصيل المنتجات" : "Order Manifest"}
                              </h5>
                              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                {ord.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-xs border-b border-[var(--color-border-subtle)] pb-2 last:border-0 last:pb-0"
                                  >
                                    <div>
                                      <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                                      <p className="text-[10px] text-[var(--color-text-muted)]">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-bold text-[var(--color-text-primary)]">
                                      {typeof item.price === "number" ? `EGP ${item.price}` : item.price}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
                                <span className="text-xs font-bold text-[var(--color-text-muted)]">{isRtl ? "الإجمالي" : "Total"}</span>
                                <span className="text-sm font-black text-[var(--color-status-green)]">{ord.total}</span>
                              </div>
                            </div>

                            {/* Actions (Triggering the Reusable CRUD Modal) */}
                            <div className="lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-[var(--color-border-subtle)] lg:pl-6 rtl:lg:pl-0 rtl:lg:pr-6 flex flex-col justify-between">
                              <div>
                                <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 font-subtitle">
                                  {isRtl ? "إجراءات الطلب" : "Order Actions"}
                                </h5>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleOpenEditOrder(ord)}
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> {isRtl ? "تعديل الطلب" : "Edit Order"}
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(ord)}
                                    disabled={ord.status === "Cancelled" || ord.status === "Delivered"}
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> {isRtl ? "إلغاء الطلب" : "Cancel Order"}
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenDeleteOrder(ord)}
                                className="w-full mt-4 sm:mt-0 py-2 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> {isRtl ? "حذف الطلب" : "Delete Order"}
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
