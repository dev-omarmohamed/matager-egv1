"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Laptop,
  Plus,
  ArrowUpRight,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDashboardLanguage } from "@/lib/i18n";

const MAX_POS_NODES = 6;

export const PosNodeManager: React.FC = () => {
  const { dir, locale } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { posNodes, totalPosRevenue, totalPosOrders, totalRevenue, addPosNode, removePosNode } =
    useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [showPinMap, setShowPinMap] = useState<Record<string, boolean>>({});

  const activeNodesCount = posNodes.filter((n) => n.status === "Active").length;
  const isMaxNodesReached = posNodes.length >= MAX_POS_NODES;

  const togglePinVisibility = (id: string) => {
    setShowPinMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddNode = () => {
    if (isMaxNodesReached) return;
    openCrudModal({
      mode: "create",
      entity: "pos_node",
      title: isRtl ? "تهيئة نقطة بيع POS جديدة" : "Provision New POS Node",
      fields: [
        { name: "name", label: isRtl ? "اسم نقطة البيع" : "Terminal Name", required: true, placeholder: "e.g. Register 1 - Main Floor" },
        { name: "branch", label: isRtl ? "الفرع" : "Branch Location", required: true, placeholder: "e.g. Cairo Flagship" },
        { name: "staffName", label: isRtl ? "الموظف المسؤول" : "Assigned Staff", required: true, placeholder: "e.g. Ahmed Ali" },
        { name: "pin", label: isRtl ? "رمز الدخول السريع (PIN)" : "Quick PIN", type: "text", defaultValue: "1234", placeholder: "1234" },
        {
          name: "status",
          label: isRtl ? "الحالة" : "Status",
          type: "select",
          defaultValue: "Active",
          options: [
            { label: isRtl ? "نشط (Active)" : "Active", value: "Active" },
            { label: isRtl ? "غير متصل (Offline)" : "Offline", value: "Offline" },
            { label: isRtl ? "استراحة (On Break)" : "Break", value: "Break" },
          ],
        },
      ],
      onSubmit: async (data) => {
        await addPosNode({
          name: data.name,
          branch: data.branch,
          staffName: data.staffName,
          pin: data.pin || "1234",
          status: data.status || "Active",
        });
      },
    });
  };

  const handleOpenDeleteNode = (node: any) => {
    openCrudModal({
      mode: "delete",
      entity: "pos_node",
      title: isRtl ? `تأكيد حذف نقطة البيع ${node.name}` : `Confirm Deleting POS Node ${node.name}`,
      initialData: {
        id: node.id,
        name: `${node.name} (${node.branch})`,
      },
      onDelete: async () => {
        await removePosNode(node.id);
      },
    });
  };

  return (
    <section className="carbon-card p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 transition-all duration-300">
      {/* ─── Header & Primary POS Action Buttons ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/30 flex items-center gap-1 font-subtitle">
              <Laptop className="w-3 h-3" /> POS Terminal Nodes
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-ui">
              {activeNodesCount} Active · {posNodes.length} / {MAX_POS_NODES} Configured
            </span>
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight font-heading">
            {isRtl ? "نقاط بيع الكاشير وتوزيع إيرادات الفروع" : "Staff POS Cashier Terminals & Revenue Split"}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-2xl font-subtitle">
            {isRtl
              ? "إدارة أجهزة الكاشير داخل المتجر، والموظفين المخصصين، ورموز PIN، وسجلات المبيعات المباشرة."
              : "Manage physical in-store cashier registers, assigned staff members, PIN credentials, and simulated live sales."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleOpenAddNode}
            disabled={isMaxNodesReached}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isMaxNodesReached
                ? "bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white hover:opacity-95 shadow-sm active:scale-95"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isMaxNodesReached ? (isRtl ? "تم بلوغ الحد الأقصى" : "Max Nodes Reached") : isRtl ? "إضافة نقطة POS" : "Add POS Node"}</span>
          </button>

          <Link
            href={APP_ROUTES.cashier}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isRtl ? "فتح شاشة الكاشير" : "Open POS Terminal"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </Link>
        </div>
      </div>

      {/* ─── Revenue Split: POS In-Store vs Online Storefront (Normalized to 0) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total In-Store POS Revenue */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)]/60 border border-[var(--color-border-subtle)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
              POS In-Store Sales (Today)
            </span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[var(--color-text-primary)] font-heading">
              {totalPosRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] font-ui">EGP</span>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center ms-auto">
              <ArrowUpRight className="w-3 h-3" /> {totalPosOrders} orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-[var(--color-text-muted)] flex justify-between font-subtitle">
            <span>Avg Ticket: {totalPosOrders > 0 ? Math.round(totalPosRevenue / totalPosOrders) : 0} EGP</span>
            <span className="text-emerald-500 font-bold">
              {totalPosRevenue + totalRevenue > 0
                ? `${Math.round((totalPosRevenue / (totalPosRevenue + totalRevenue)) * 100)}% of Daily GMV`
                : "0% of Daily GMV"}
            </span>
          </div>
        </div>

        {/* Online Storefront Revenue */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)]/60 border border-[var(--color-border-subtle)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
              Online FastCart Sales (Today)
            </span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[var(--color-text-primary)] font-heading">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] font-ui">EGP</span>
            <span className="text-[10px] font-bold text-blue-500 flex items-center ms-auto">
              <ArrowUpRight className="w-3 h-3" /> 0 orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-[var(--color-text-muted)] flex justify-between font-subtitle">
            <span>Online Conv: 0%</span>
            <span className="text-blue-500 font-bold">
              {totalPosRevenue + totalRevenue > 0
                ? `${Math.round((totalRevenue / (totalPosRevenue + totalRevenue)) * 100)}% of Daily GMV`
                : "0% of Daily GMV"}
            </span>
          </div>
        </div>

        {/* POS Payment Methods Distribution */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)]/60 border border-[var(--color-border-subtle)] flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
              In-Store Tender Mix
            </span>
            <QrCode className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-2 text-[10px]">
            <div>
              <div className="flex justify-between text-[var(--color-text-secondary)] mb-1">
                <span>Cash Register</span>
                <span className="font-bold text-[var(--color-text-primary)]">0%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-0" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[var(--color-text-secondary)] mb-1">
                <span>Mada / Meeza / QR</span>
                <span className="font-bold text-[var(--color-text-primary)]">0%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── POS Cashier Nodes Roster Table ─── */}
      <div className="overflow-hidden border border-[var(--color-border-subtle)] rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/40 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                <th className="p-3.5 whitespace-nowrap">Terminal Node</th>
                <th className="p-3.5 whitespace-nowrap">Branch Location</th>
                <th className="p-3.5 whitespace-nowrap">Assigned Staff</th>
                <th className="p-3.5 whitespace-nowrap">Quick PIN</th>
                <th className="p-3.5 whitespace-nowrap">Shift Status</th>
                <th className="p-3.5 whitespace-nowrap">Today Sales</th>
                <th className="p-3.5 text-right rtl:text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] font-ui">
              {posNodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-[var(--color-text-muted)]" />
                      <p className="font-bold text-xs text-[var(--color-text-primary)]">
                        {isRtl ? "لا توجد نقاط بيع مهيأة بعد" : "No POS nodes configured yet"}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddNode}
                        className="mt-1 px-3 py-1 bg-[var(--color-primary-light)] text-white rounded-lg text-xs font-bold"
                      >
                        {isRtl ? "إضافة نقطة بيع الآن" : "Add POS Node Now"}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                posNodes.map((node) => {
                  const isPinVisible = showPinMap[node.id];
                  return (
                    <tr key={node.id} className="hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary-light)] shrink-0">
                            <Laptop className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-text-primary)]">{node.name}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">{node.device_serial}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-[var(--color-text-secondary)]">{node.branch}</td>
                      <td className="p-3.5 font-medium text-[var(--color-text-primary)]">{node.staffName}</td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(node.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[11px] font-mono hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          {isPinVisible ? (
                            <>
                              <EyeOff className="w-3 h-3 text-[var(--color-text-muted)]" />
                              <span className="font-bold text-[var(--color-text-primary)]">{node.pin}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-[var(--color-text-muted)]" />
                              <span className="text-[var(--color-text-muted)]">••••</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            node.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              node.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {node.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[var(--color-text-primary)]">
                        {node.todaySales.toLocaleString()} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">EGP</span>
                      </td>
                      <td className="p-3.5 text-right rtl:text-left">
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteNode(node)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
