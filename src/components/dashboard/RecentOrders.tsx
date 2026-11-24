"use client";

import React, { useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import type { CrudFieldConfig } from "./DashboardCrudModal";
import { Panel } from "./ui/Panel";
import { Stat } from "./ui/Stat";
import { Collapse } from "./ui/Collapse";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput } from "./ui/SearchInput";
import { Tone } from "./ui/tones";
import { btnPrimary, btnGhost, divider, eyebrow, focusRing, scrollNone } from "./ui/styles";

type Stage = "Pending" | "Accepted" | "Shipped" | "Delivered" | "Cancelled";

const inStage = (status: string, stage: Stage) =>
  stage === "Delivered" ? status === "Delivered" || status === "Completed" : status === stage;

const PAGE_SIZE = 8;
const ROW_GRID = "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[88px_minmax(0,1fr)_120px_100px_96px_16px]";

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

  /* ── modal field config (one source for create + edit) ── */
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

  return (
    <Panel
      title={t.recentOrders.title}
      icon="bi-bag-check"
      badge={total}
      collapsible={false}
      actions={
        <button type="button" onClick={openCreate} className={btnPrimary} aria-label={tr("New Order", "طلب جديد")}>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          <span className="hidden sm:inline">{tr("New Order", "طلب جديد")}</span>
        </button>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        {/* Pipeline: tap a stage to filter the list */}
        <div className={`-mx-3 px-3 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto snap-x ${scrollNone}`}>
          {stages.map((s) => (
            <Stat
              key={s.id}
              tone={s.tone}
              label={s.label}
              value={counts[s.id]}
              active={stage === s.id}
              onClick={() => {
                setStage((cur) => (cur === s.id ? null : s.id));
                setVisible(PAGE_SIZE);
              }}
              className="min-w-[88px] sm:min-w-0 snap-start"
            />
          ))}
        </div>

        {/* Quick summary */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
          <span>
            <b className="font-heading text-sm text-[var(--color-text-primary)]">{total}</b> {t.recentOrders.summary.active}
          </span>
          <span>
            {t.recentOrders.summary.fulfillment} <b className="text-[var(--color-status-green)]">{fulfillment}</b>
          </span>
          <span>
            {t.recentOrders.summary.avgTime} <b className="text-[var(--color-status-blue)]">{total > 0 ? "4.2h" : "--"}</b>
          </span>
        </p>

        {/* Search + active filter */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setVisible(PAGE_SIZE);
            }}
            placeholder={tr("Search by order ID, customer or status…", "ابحث برقم الطلب أو العميل أو الحالة…")}
            className="flex-1 sm:max-w-sm"
          />
          {stage && (
            <button type="button" onClick={() => setStage(null)} className={`${btnGhost} shrink-0`}>
              {stages.find((s) => s.id === stage)?.label}
              <i className="bi bi-x-lg text-[9px]" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Orders list */}
        <div className={`rounded-xl border ${divider} overflow-hidden`}>
          <div className={`hidden sm:grid ${ROW_GRID} gap-x-3 px-4 py-2 bg-[var(--color-surface-elevated)] ${eyebrow}`}>
            <span>{t.recentOrders.originalTable.thOrderId}</span>
            <span>{t.recentOrders.originalTable.thCustomer}</span>
            <span>{tr("Date", "التاريخ")}</span>
            <span>{t.recentOrders.originalTable.thStatus}</span>
            <span className="text-end">{t.recentOrders.originalTable.thTotal}</span>
            <span />
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon="bi-bag"
              title={tr("No orders yet", "لا توجد طلبات بعد")}
              desc={tr("Orders placed by customers appear here in real time.", "الطلبات الجديدة ستظهر هنا فور إتمام الشراء.")}
              action={
                total === 0 ? (
                  <button type="button" onClick={openCreate} className={btnPrimary}>
                    <i className="bi bi-plus-circle" aria-hidden="true" />
                    {tr("Create Test Order", "إنشاء طلب تجريبي")}
                  </button>
                ) : undefined
              }
            />
          ) : (
            <ul className={`divide-y ${divider}`}>
              {shown.map((ord) => {
                const open = expandedId === ord.id;
                return (
                  <li key={ord.id} className={open ? "bg-[var(--color-surface-elevated)]/50" : ""}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : ord.id)}
                      aria-expanded={open}
                      className={`w-full grid ${ROW_GRID} items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-2.5 text-start ${focusRing}`}
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
                          <StatusPill variant={ord.variant}>{ord.status}</StatusPill>
                        </span>
                        <span className="text-xs font-bold text-[var(--color-text-primary)] sm:text-end">{ord.total}</span>
                      </span>
                      <i
                        className={`hidden sm:block bi bi-chevron-down text-[10px] text-[var(--color-text-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    <Collapse open={open}>
                      <div className={`px-3 sm:px-4 pb-3 pt-1 grid gap-4 md:grid-cols-3 border-t ${divider}`}>
                        {/* Customer */}
                        <div className="pt-3 space-y-1">
                          <h5 className={eyebrow}>{tr("Customer Details", "بيانات العميل")}</h5>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">{ord.customer}</p>
                          {ord.email && <p dir="ltr" className="text-xs text-[var(--color-text-secondary)] text-start break-all">{ord.email}</p>}
                          {ord.phone && <p dir="ltr" className="text-xs text-[var(--color-text-secondary)] text-start">{ord.phone}</p>}
                          {ord.address && <p className="text-xs text-[var(--color-text-secondary)]">{ord.address}</p>}
                          {ord.phone && (
                            <a href={`tel:${ord.phone}`} className={`${btnGhost} mt-2`}>
                              <i className="bi bi-telephone" aria-hidden="true" />
                              {tr("Call", "اتصال")}
                            </a>
                          )}
                        </div>

                        {/* Manifest */}
                        <div className={`pt-3 md:border-s ${divider} md:ps-4`}>
                          <h5 className={`${eyebrow} mb-2`}>{tr("Order Manifest", "تفاصيل المنتجات")}</h5>
                          <ul className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                            {ord.items?.map((item: any, i: number) => (
                              <li key={i} className={`flex justify-between gap-2 text-xs pb-1.5 border-b ${divider} last:border-0`}>
                                <span className="min-w-0">
                                  <span className="block font-medium text-[var(--color-text-primary)] truncate">{item.name}</span>
                                  <span className="text-[10px] text-[var(--color-text-muted)]">× {item.qty}</span>
                                </span>
                                <span className="font-bold text-[var(--color-text-primary)] shrink-0">{itemPrice(item.price)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className={`mt-2 pt-2 border-t ${divider} flex justify-between items-center`}>
                            <span className="text-xs font-bold text-[var(--color-text-muted)]">{tr("Total", "الإجمالي")}</span>
                            <span className="text-sm font-black text-[var(--color-status-green)]">{ord.total}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={`pt-1 md:pt-3 md:border-s ${divider} md:ps-4`}>
                          <h5 className={`${eyebrow} mb-2`}>{tr("Order Actions", "إجراءات الطلب")}</h5>
                          <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                            <button type="button" onClick={() => openEdit(ord)} className={`${btnGhost} !text-[var(--color-status-blue)]`}>
                              <i className="bi bi-pencil" aria-hidden="true" />
                              {tr("Edit", "تعديل")}
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelOrder(ord)}
                              disabled={ord.status === "Cancelled" || ord.status === "Delivered"}
                              className={`${btnGhost} !text-[var(--color-status-amber)]`}
                            >
                              <i className="bi bi-x-circle" aria-hidden="true" />
                              {tr("Cancel", "إلغاء")}
                            </button>
                            <button type="button" onClick={() => openDelete(ord)} className={`${btnGhost} !text-[var(--color-status-red)]`}>
                              <i className="bi bi-trash3" aria-hidden="true" />
                              {tr("Delete", "حذف")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {filtered.length > visible && (
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={`${btnGhost} w-full`}>
            {tr(`Show more (${filtered.length - visible})`, `عرض المزيد (${filtered.length - visible})`)}
          </button>
        )}
      </div>
    </Panel>
  );
};
