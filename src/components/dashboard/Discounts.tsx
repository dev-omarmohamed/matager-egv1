"use client";

import React, { useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import { Panel } from "./ui/Panel";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput } from "./ui/SearchInput";
import { btnPrimary, btnIconDanger, divider } from "./ui/styles";

export const Discounts: React.FC = () => {
  const { t, tr } = useDash();
  const { discounts, addDiscount, removeDiscount } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();
  const [search, setSearch] = useState("");

  const list = discounts.filter((d) => d.code.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () =>
    openCrudModal({
      mode: "create",
      entity: "discount",
      title: tr("Create New Discount Code", "إنشاء كود خصم جديد"),
      fields: [
        { name: "code", label: tr("Promo Code", "كود الخصم (البروموكود)"), required: true, placeholder: "e.g. SUMMER25" },
        {
          name: "type",
          label: tr("Discount Type", "نوع الخصم"),
          type: "select",
          defaultValue: "percentage",
          options: [
            { label: tr("Percentage (%)", "نسبة مئوية (%)"), value: "percentage" },
            { label: tr("Fixed Amount (EGP)", "مبلغ ثابت (ج.م)"), value: "fixed" },
          ],
        },
        { name: "value", label: tr("Discount Value", "قيمة الخصم"), type: "number", required: true, placeholder: "25" },
        { name: "maxUsage", label: tr("Max Usage Limit", "الحد الأقصى للاستخدام"), type: "number", defaultValue: 100, placeholder: "100" },
        { name: "expires", label: tr("Expiration Date", "تاريخ الانتهاء"), placeholder: "YYYY-MM-DD" },
      ],
      onSubmit: async (d) => {
        const val = Number(d.value) || 10;
        await addDiscount({
          code: d.code.toUpperCase(),
          discount: d.type === "fixed" ? `${val} EGP Off` : `${val}% Off`,
          type: d.type || "percentage",
          value: val,
          maxUsage: Number(d.maxUsage) || 100,
          expires: d.expires || "2026-12-31",
          status: "Active",
        });
      },
    });

  const openDelete = (d: any) =>
    openCrudModal({
      mode: "delete",
      entity: "discount",
      title: tr(`Confirm Deleting Discount ${d.code}`, `تأكيد حذف كود الخصم ${d.code}`),
      initialData: { id: d.id, name: `${d.code} (${d.discount})` },
      onDelete: async () => {
        await removeDiscount(d.id);
      },
    });

  return (
    <Panel
      title={t.discounts.title}
      subtitle={t.discounts.subtitle}
      icon="bi-percent"
      badge={discounts.length}
      toggleLabel={t.discounts.showDetails}
      actions={
        <button type="button" onClick={openCreate} className={btnPrimary} aria-label={t.discounts.createNew}>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          <span className="hidden sm:inline">{t.discounts.createNew}</span>
        </button>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        {discounts.length > 4 && (
          <SearchInput value={search} onChange={setSearch} placeholder={t.discounts.searchPlaceholder} className="sm:max-w-xs" />
        )}

        <div className={`rounded-xl border ${divider} overflow-hidden`}>
          {list.length === 0 ? (
            <EmptyState
              icon="bi-percent"
              title={tr("No discount codes yet", "لا توجد أكواد خصم بعد")}
              desc={tr("Create promo codes to reward your customers", "أنشئ كود الخصم الأول لمتجرك الآن")}
            />
          ) : (
            <ul className={`divide-y ${divider} max-h-[360px] overflow-y-auto custom-scrollbar`}>
              {list.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
                  <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]">
                    <i className="bi bi-percent" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="font-mono font-bold text-sm text-[var(--color-text-primary)] truncate text-start">{d.code}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      {d.discount} · {d.usage} {tr("used", "استخدام")} · {tr("Exp", "ينتهي")}: {d.expires}
                    </p>
                  </div>
                  <StatusPill variant={d.variant}>{d.status}</StatusPill>
                  <button type="button" onClick={() => openDelete(d)} className={btnIconDanger} aria-label={tr("Delete", "حذف")}>
                    <i className="bi bi-trash3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
};
