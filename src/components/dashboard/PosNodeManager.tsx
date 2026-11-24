"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import { Panel } from "./ui/Panel";
import { Stat } from "./ui/Stat";
import { EmptyState } from "./ui/EmptyState";
import { TONES } from "./ui/tones";
import { btnPrimary, btnGhost, btnIcon, btnIconDanger, divider, eyebrow } from "./ui/styles";

const MAX_POS_NODES = 6;

export const PosNodeManager: React.FC = () => {
  const { tr } = useDash();
  const { posNodes, totalPosRevenue, totalPosOrders, totalRevenue, addPosNode, removePosNode } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const active = posNodes.filter((n) => n.status === "Active").length;
  const maxed = posNodes.length >= MAX_POS_NODES;
  const gmv = totalPosRevenue + totalRevenue;
  const share = (n: number) => (gmv > 0 ? `${Math.round((n / gmv) * 100)}%` : "0%");

  const openAdd = () => {
    if (maxed) return;
    openCrudModal({
      mode: "create",
      entity: "pos_node",
      title: tr("Provision New POS Node", "تهيئة نقطة بيع POS جديدة"),
      fields: [
        { name: "name", label: tr("Terminal Name", "اسم نقطة البيع"), required: true, placeholder: "e.g. Register 1 - Main Floor" },
        { name: "branch", label: tr("Branch Location", "الفرع"), required: true, placeholder: "e.g. Cairo Flagship" },
        { name: "staffName", label: tr("Assigned Staff", "الموظف المسؤول"), required: true, placeholder: "e.g. Ahmed Ali" },
        { name: "pin", label: tr("Quick PIN", "رمز الدخول السريع (PIN)"), defaultValue: "1234", placeholder: "1234" },
        {
          name: "status",
          label: tr("Status", "الحالة"),
          type: "select",
          defaultValue: "Active",
          options: [
            { label: tr("Active", "نشط"), value: "Active" },
            { label: tr("Offline", "غير متصل"), value: "Offline" },
            { label: tr("Break", "استراحة"), value: "Break" },
          ],
        },
      ],
      onSubmit: async (d) => {
        await addPosNode({ name: d.name, branch: d.branch, staffName: d.staffName, pin: d.pin || "1234", status: d.status || "Active" });
      },
    });
  };

  const openDelete = (node: any) =>
    openCrudModal({
      mode: "delete",
      entity: "pos_node",
      title: tr(`Confirm Deleting POS Node ${node.name}`, `تأكيد حذف نقطة البيع ${node.name}`),
      initialData: { id: node.id, name: `${node.name} (${node.branch})` },
      onDelete: async () => {
        await removePosNode(node.id);
      },
    });

  return (
    <Panel
      title={tr("POS Cashier Terminals", "نقاط بيع الكاشير")}
      subtitle={tr(
        `${active} active · ${posNodes.length} / ${MAX_POS_NODES} configured`,
        `${active} نشط · ${posNodes.length} / ${MAX_POS_NODES} مهيأة`
      )}
      icon="bi-pc-display"
      toggleLabel={tr("Details", "التفاصيل")}
      actions={
        <>
          <Link href={APP_ROUTES.cashier} target="_blank" className={btnGhost} aria-label={tr("Open POS Terminal", "فتح شاشة الكاشير")}>
            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
            <span className="hidden md:inline">{tr("Open POS", "فتح الكاشير")}</span>
          </Link>
          <button type="button" onClick={openAdd} disabled={maxed} className={btnPrimary} aria-label={tr("Add POS Node", "إضافة نقطة POS")}>
            <i className="bi bi-plus-lg" aria-hidden="true" />
            <span className="hidden sm:inline">{maxed ? tr("Max reached", "الحد الأقصى") : tr("Add POS Node", "إضافة نقطة POS")}</span>
          </button>
        </>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        {/* Revenue split */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <Stat
            tone="green"
            icon="bi-cash-coin"
            label={tr("In-store sales", "مبيعات الفرع")}
            value={`${totalPosRevenue.toLocaleString()} EGP`}
            hint={`${totalPosOrders} ${tr("orders", "طلب")} · ${tr("Avg", "متوسط")} ${totalPosOrders > 0 ? Math.round(totalPosRevenue / totalPosOrders) : 0} · ${share(totalPosRevenue)}`}
          />
          <Stat
            tone="blue"
            icon="bi-credit-card"
            label={tr("Online sales", "مبيعات المتجر")}
            value={`${totalRevenue.toLocaleString()} EGP`}
            hint={`0 ${tr("orders", "طلب")} · ${share(totalRevenue)}`}
          />
          <div className={`col-span-2 lg:col-span-1 rounded-xl border px-2.5 py-2 ${TONES.purple.box}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wide font-subtitle ${TONES.purple.text}`}>
              <i className="bi bi-qr-code me-1" aria-hidden="true" />
              {tr("In-store tender mix", "طرق الدفع في الفرع")}
            </p>
            {[
              [tr("Cash register", "نقدي"), TONES.green.bg],
              [tr("Mada / Meeza / QR", "مدى / ميزة / QR"), TONES.blue.bg],
            ].map(([label, bar]) => (
              <div key={label} className="mt-1.5">
                <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)]">
                  <span>{label}</span>
                  <b className="text-[var(--color-text-primary)]">0%</b>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-elevated)] overflow-hidden">
                  <div className={`h-full w-0 ${bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nodes */}
        <div className={`rounded-xl border ${divider} overflow-hidden`}>
          {posNodes.length === 0 ? (
            <EmptyState
              icon="bi-pc-display"
              title={tr("No POS nodes configured yet", "لا توجد نقاط بيع مهيأة بعد")}
              action={
                <button type="button" onClick={openAdd} className={btnPrimary}>
                  {tr("Add POS Node Now", "إضافة نقطة بيع الآن")}
                </button>
              }
            />
          ) : (
            <ul className={`divide-y ${divider}`}>
              {posNodes.map((node) => {
                const on = node.status === "Active";
                const show = revealed[node.id];
                return (
                  <li key={node.id} className="px-3 sm:px-4 py-2.5 grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto_auto_auto] items-center gap-x-3 gap-y-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-primary-light)]">
                        <i className="bi bi-pc-display" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{node.name}</p>
                        <p dir="ltr" className="text-[10px] text-[var(--color-text-muted)] truncate text-start">{node.device_serial}</p>
                      </div>
                    </div>

                    <p className="hidden sm:block text-[11px] text-[var(--color-text-secondary)] truncate">
                      {node.branch} · <b className="text-[var(--color-text-primary)]">{node.staffName}</b>
                    </p>

                    <span className={`justify-self-end inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${on ? `${TONES.green.box} ${TONES.green.text}` : `${TONES.neutral.box} ${TONES.neutral.text}`}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${on ? `${TONES.green.bg} animate-pulse` : TONES.neutral.bg}`} />
                      {node.status}
                    </span>

                    <span className="hidden sm:block text-xs font-bold text-[var(--color-text-primary)]">
                      {node.todaySales.toLocaleString()} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">EGP</span>
                    </span>

                    {/* Second line on phones */}
                    <div className="flex items-center gap-2 sm:contents col-span-2 sm:col-auto">
                      <p className="sm:hidden flex-1 min-w-0 text-[10px] text-[var(--color-text-muted)] truncate">
                        {node.branch} · {node.staffName} · {node.todaySales.toLocaleString()} EGP
                      </p>
                      <button
                        type="button"
                        onClick={() => setRevealed((p) => ({ ...p, [node.id]: !p[node.id] }))}
                        className={`${btnIcon} !w-auto px-2 gap-1 font-mono`}
                        aria-label={tr("Toggle PIN", "إظهار الرمز")}
                        aria-pressed={!!show}
                      >
                        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                        <span dir="ltr" className="text-[11px]">{show ? node.pin : "••••"}</span>
                      </button>
                      <button type="button" onClick={() => openDelete(node)} className={btnIconDanger} aria-label={tr("Delete", "حذف")}>
                        <i className="bi bi-trash3" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
};
