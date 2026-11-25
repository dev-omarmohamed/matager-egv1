"use client";

import React, { useMemo, useState } from "react";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import type { CrudFieldConfig } from "./DashboardCrudModal";

type Stage = "Pending" | "Accepted" | "Shipped" | "Delivered" | "Cancelled";
type Tone = "amber" | "blue" | "purple" | "green" | "red";

const inStage = (status: string, stage: Stage) =>
  stage === "Delivered" ? status === "Delivered" || status === "Completed" : status === stage;

const PAGE_SIZE = 8;

/* Static tone → class maps (Tailwind can't build these from template strings). */
const pillToneClasses: Record<Tone, string> = {
  amber: "text-[var(--color-status-amber)] bg-[var(--color-status-amber-bg)] border-[var(--color-status-amber-border)]",
  blue: "text-[var(--color-status-blue)] bg-[var(--color-status-blue-bg)] border-[var(--color-status-blue-border)]",
  purple: "text-[var(--color-status-purple)] bg-[var(--color-status-purple-bg)] border-[var(--color-status-purple-border)]",
  green: "text-[var(--color-status-green)] bg-[var(--color-status-green-bg)] border-[var(--color-status-green-border)]",
  red: "text-[var(--color-status-red)] bg-[var(--color-status-red-bg)] border-[var(--color-status-red-border)]",
};

const statLabelToneClasses: Record<Tone, string> = {
  amber: "text-[var(--color-status-amber)]",
  blue: "text-[var(--color-status-blue)]",
  purple: "text-[var(--color-status-purple)]",
  green: "text-[var(--color-status-green)]",
  red: "text-[var(--color-status-red)]",
};

/* Shared button class strings (inlined from attachment #2). */
const btnPrimaryClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-ui font-bold whitespace-nowrap select-none transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60 px-3.5 py-2 text-xs text-white bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-dark)] hover:-translate-y-[1px] shadow-sm hover:shadow-[0_4px_12px_rgba(0,82,255,0.25)]";

const btnGhostClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-ui font-bold whitespace-nowrap select-none transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60 px-3 py-1.5 text-[11px] text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:-translate-y-[1px]";

const collapseBaseClass =
  "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

interface RecentOrdersProps {
  externalFilter?: string;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ externalFilter = "" }) => {
  const { t, tr } = useDash();
  const { orders, addOrder, editOrder, removeOrder } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  /* ── modal field config ── */
  const orderFields = (withCancelled: boolean): CrudFieldConfig[] => [
    { name: "customer", label: tr("Customer Name", "اسم العميل"), required: true, placeholder: "e.g. Omar Mohamed" },
    { name: "phone", label: tr("Phone Number", "رقم الهاتف"), type: "tel", required: true, placeholder: "+20 100 000 0000" },
    { name: "email", label: tr("Email", "البريد الإلكتروني"), type: "email", placeholder: "customer@example.com" },
    { name: "address", label: tr("Shipping Address", "عنوان الشحن"), type: "textarea", placeholder: tr("e.g. 15 El-Tahrir St, Cairo", "مثال: ١٥ شارع التحرير، القاهرة") },
    { name: "amount", label: tr("Total Amount (EGP)", "إجمالي المبلغ (ج.م)"), type: "number", required: true, placeholder: "500" },
    {
      name: "status",
      label: tr("Order Status", "حالة الطلب"),
      type: "select",
      defaultValue: "Pending",
      options: [
        { label: tr("Pending", "قيد الانتظار"), value: "Pending" },
        { label: tr("Accepted", "مقبول"), value: "Accepted" },
        { label: tr("Shipped", "تم الشحن"), value: "Shipped" },
        { label: tr("Delivered", "تم التوصيل"), value: "Delivered" },
        ...(withCancelled ? [{ label: tr("Cancelled", "ملغي"), value: "Cancelled" }] : []),
      ],
    },
  ];

  const openCreate = () =>
    openCrudModal({
      mode: "create",
      entity: "order",
      title: tr("Create New Order", "إنشاء طلب جديد"),
      fields: orderFields(false),
      onSubmit: async (d) => {
        await addOrder({
          customer: d.customer,
          phone: d.phone,
          email: d.email,
          address: d.address,
          amount: Number(d.amount) || 0,
          status: d.status || "Pending",
          total: `EGP ${Number(d.amount || 0).toLocaleString()}`,
        });
      },
    });

  const openEdit = (ord: any) =>
    openCrudModal({
      mode: "edit",
      entity: "order",
      title: tr(`Edit Order ${ord.id}`, `تعديل الطلب ${ord.id}`),
      initialData: {
        customer: ord.customer,
        phone: ord.phone,
        email: ord.email,
        address: ord.address,
        amount: ord.amount,
        status: ord.status,
      },
      fields: orderFields(true),
      onSubmit: async (d) => {
        await editOrder(ord.id, {
          customer: d.customer,
          phone: d.phone,
          email: d.email,
          address: d.address,
          amount: Number(d.amount) || ord.amount,
          status: d.status,
          total: `EGP ${Number(d.amount || ord.amount).toLocaleString()}`,
        });
      },
    });

  const openDelete = (ord: any) =>
    openCrudModal({
      mode: "delete",
      entity: "order",
      title: tr(`Confirm Deleting Order ${ord.id}`, `تأكيد حذف الطلب ${ord.id}`),
      initialData: { id: ord.id, name: `${ord.customer} (${ord.total})` },
      onDelete: async () => {
        await removeOrder(ord.id);
        setExpandedId(null);
      },
    });

  const cancelOrder = (ord: any) => editOrder(ord.id, { status: "Cancelled", variant: "danger" as any });

  /* ── derived data ── */
  const stages: { id: Stage; label: string; tone: Tone }[] = [
    { id: "Pending", label: t.recentOrders.summary.pending, tone: "amber" },
    { id: "Accepted", label: t.recentOrders.summary.accepted, tone: "blue" },
    { id: "Shipped", label: t.recentOrders.summary.shipped, tone: "purple" },
    { id: "Delivered", label: t.recentOrders.summary.delivered, tone: "green" },
    { id: "Cancelled", label: t.recentOrders.summary.returned, tone: "red" },
  ];

  const counts = useMemo(
    () => Object.fromEntries(stages.map((s) => [s.id, orders.filter((o) => inStage(o.status, s.id)).length])) as Record<Stage, number>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders]
  );

  const total = orders.length;
  const fulfillment = total > 0 ? `${Math.round((counts.Delivered / total) * 100)}%` : "0%";

  const filtered = useMemo(() => {
    const q = (s: string) => s.toLowerCase();
    const matches = (o: any, needle: string) =>
      !needle || q(o.customer).includes(q(needle)) || q(o.id).includes(q(needle)) || q(o.status).includes(q(needle));
    return orders.filter((o) => matches(o, externalFilter) && matches(o, query) && (!stage || inStage(o.status, stage)));
  }, [orders, externalFilter, query, stage]);

  const shown = filtered.slice(0, visible);
  const itemPrice = (p: any) => (typeof p === "number" ? `EGP ${p}` : p);

  /* ── render ── */
  return (
    <div className="space-y-3 sm:space-y-5 animate-in fade-in duration-200">
      <section className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-card-hover)] overflow-hidden">
        {/* ── Header ── */}
        <header className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]">
              <i className="bi bi-bag-check text-sm sm:text-base" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)] truncate">
                  {t.recentOrders.title}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                  {total}
                </span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={openCreate} aria-label={tr("New Order", "طلب جديد")} className={btnPrimaryClass}>
              <i className="bi bi-plus-lg" aria-hidden="true" />
              <span className="hidden sm:inline">{tr("New Order", "طلب جديد")}</span>
            </button>
          </div>
        </header>

        {/* ── Body (always open) ── */}
        <div aria-hidden="false" className={`${collapseBaseClass} grid-rows-[1fr] opacity-100`}>
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-[var(--color-border-subtle)]">
              <div className="p-3 sm:p-4 space-y-3">

                {/* ── Pipeline ── */}
                <div className="flex sm:grid sm:grid-cols-5 overflow-scroll rounded-[8px] border border-[var(--color-glass-card-border)]">
                  {stages.map((s) => {
                    const active = stage === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setStage((cur) => (cur === s.id ? null : s.id));
                          setVisible(PAGE_SIZE);
                        }}
                        className={`block min-w-[88px] sm:min-w-0 text-start px-2.5 py-2 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60 active:scale-[0.98] ${active
                          ? "bg-[var(--color-primary-light)]/5 "
                          : "bg-[var(--color-surface-elevated)]"
                          }`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wide truncate font-subtitle ${statLabelToneClasses[s.tone]}`}>
                            {s.label}
                          </span>
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-base sm:text-lg font-bold font-heading leading-none text-[var(--color-text-primary)]">
                          <span className="truncate">{counts[s.id]}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>



                {/* ── Search + active filter ── */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:max-w-sm">
                    <i className="bi bi-search absolute start-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setVisible(PAGE_SIZE);
                      }}
                      placeholder={tr("Search by order ID, customer or status…", "ابحث برقم الطلب أو العميل أو الحالة…")}
                      aria-label={tr("Search by order ID, customer or status…", "ابحث برقم الطلب أو العميل أو الحالة…")}
                      className="w-full rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-3.5 py-2.5 text-[16px] sm:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-ui transition-all focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-[var(--color-primary-light)]/20 disabled:opacity-60 ps-8"
                    />
                  </div>
                  {stage && (
                    <button type="button" onClick={() => setStage(null)} className={`${btnGhostClass} shrink-0`}>
                      {stages.find((s) => s.id === stage)?.label}
                      <i className="bi bi-x-lg text-[9px]" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* ── Orders table ── */}
                <div className="rounded-[8px] border border-[var(--color-border-subtle)] overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[88px_minmax(0,1fr)_120px_100px_96px_16px] gap-x-3 px-4 py-2 bg-[var(--color-surface-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                    <span>{t.recentOrders.originalTable.thOrderId}</span>
                    <span>{t.recentOrders.originalTable.thCustomer}</span>
                    <span>{tr("Date", "التاريخ")}</span>
                    <span>{t.recentOrders.originalTable.thStatus}</span>
                    <span className="text-end">{t.recentOrders.originalTable.thTotal}</span>
                    <span />
                  </div>

                  {shown.length === 0 ? (
                    <div className="p-6 flex flex-col items-center justify-center text-center gap-2">
                      <i className="bi bi-bag text-2xl text-[var(--color-text-muted)]" aria-hidden="true" />
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{tr("No orders yet", "لا توجد طلبات بعد")}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {tr("Orders placed by customers appear here in real time.", "الطلبات الجديدة ستظهر هنا فور إتمام الشراء.")}
                      </p>
                      {total === 0 && (
                        <button type="button" onClick={openCreate} className={btnPrimaryClass}>
                          <i className="bi bi-plus-circle" aria-hidden="true" />
                          {tr("Create Test Order", "إنشاء طلب تجريبي")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="divide-y border-[var(--color-border-subtle)]">
                      {shown.map((ord) => {
                        const open = expandedId === ord.id;
                        const variant = (ord.variant || "amber") as Tone;
                        const pillClass = pillToneClasses[variant] ?? pillToneClasses.amber;
                        return (
                          <li key={ord.id} className={open ? "bg-[var(--color-surface-elevated)]/50" : ""}>
                            <button
                              type="button"
                              onClick={() => setExpandedId(open ? null : ord.id)}
                              aria-expanded={open}
                              className="w-full grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[88px_minmax(0,1fr)_120px_100px_96px_16px] items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-2.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60"
                            >
                              <span className="min-w-0 sm:contents">
                                <span dir="ltr" className="block sm:inline text-[10px] sm:text-xs font-mono text-[var(--color-text-muted)] text-start truncate">
                                  {ord.id}
                                </span>
                                <span className="block text-xs font-bold text-[var(--color-text-primary)] truncate">{ord.customer}</span>
                              </span>
                              <span className="flex flex-col-reverse items-end gap-1 sm:contents">
                                <span className="hidden sm:block text-[11px] text-[var(--color-text-muted)]">
                                  {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "—"}
                                </span>
                                <span>
                                  <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-normal select-none ${pillClass}`}>
                                    {ord.status}
                                  </span>
                                </span>
                                <span className="text-xs font-bold text-[var(--color-text-primary)] sm:text-end">{ord.total}</span>
                              </span>
                              <i
                                className={`hidden sm:block bi bi-chevron-down text-[10px] text-[var(--color-text-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                                aria-hidden="true"
                              />
                            </button>

                            {/* ── Collapse ── */}
                            <div
                              aria-hidden={!open}
                              inert={!open}
                              className={`${collapseBaseClass} ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div className="px-3 sm:px-4 pb-3 pt-1 grid gap-4 md:grid-cols-3 border-t border-[var(--color-border-subtle)]">
                                  {/* Customer */}
                                  <div className="pt-3 space-y-1">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                                      {tr("Customer Details", "بيانات العميل")}
                                    </h5>
                                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{ord.customer}</p>
                                    {ord.email && (
                                      <p dir="ltr" className="text-xs text-[var(--color-text-secondary)] text-start break-all">
                                        {ord.email}
                                      </p>
                                    )}
                                    {ord.phone && (
                                      <p dir="ltr" className="text-xs text-[var(--color-text-secondary)] text-start">
                                        {ord.phone}
                                      </p>
                                    )}
                                    {ord.address && <p className="text-xs text-[var(--color-text-secondary)]">{ord.address}</p>}
                                    {ord.phone && (
                                      <a href={`tel:${ord.phone}`} className={`${btnGhostClass} mt-2`}>
                                        <i className="bi bi-telephone" aria-hidden="true" />
                                        {tr("Call", "اتصال")}
                                      </a>
                                    )}
                                  </div>

                                  {/* Manifest */}
                                  <div className="pt-3 md:border-s border-[var(--color-border-subtle)] md:ps-4">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-2">
                                      {tr("Order Manifest", "تفاصيل المنتجات")}
                                    </h5>
                                    <ul className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                                      {ord.items?.map((item: any, i: number) => (
                                        <li
                                          key={i}
                                          className="flex justify-between gap-2 text-xs pb-1.5 border-b border-[var(--color-border-subtle)] last:border-0"
                                        >
                                          <span className="min-w-0">
                                            <span className="block font-medium text-[var(--color-text-primary)] truncate">{item.name}</span>
                                            <span className="text-[10px] text-[var(--color-text-muted)]">× {item.qty}</span>
                                          </span>
                                          <span className="font-bold text-[var(--color-text-primary)] shrink-0">{itemPrice(item.price)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
                                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{tr("Total", "الإجمالي")}</span>
                                      <span className="text-sm font-black text-[var(--color-status-green)]">{ord.total}</span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="pt-1 md:pt-3 md:border-s border-[var(--color-border-subtle)] md:ps-4">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-2">
                                      {tr("Order Actions", "إجراءات الطلب")}
                                    </h5>
                                    <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openEdit(ord)}
                                        className={`${btnGhostClass} !text-[var(--color-status-blue)]`}
                                      >
                                        <i className="bi bi-pencil" aria-hidden="true" />
                                        {tr("Edit", "تعديل")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => cancelOrder(ord)}
                                        disabled={ord.status === "Cancelled" || ord.status === "Delivered"}
                                        className={`${btnGhostClass} !text-[var(--color-status-amber)]`}
                                      >
                                        <i className="bi bi-x-circle" aria-hidden="true" />
                                        {tr("Cancel", "إلغاء")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openDelete(ord)}
                                        className={`${btnGhostClass} !text-[var(--color-status-red)]`}
                                      >
                                        <i className="bi bi-trash3" aria-hidden="true" />
                                        {tr("Delete", "حذف")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {filtered.length > visible && (
                  <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={`${btnGhostClass} w-full`}>
                    {tr(`Show more (${filtered.length - visible})`, `عرض المزيد (${filtered.length - visible})`)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};