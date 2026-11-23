"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { Percent, Search, PlusCircle, Trash2 } from "lucide-react";

export const Discounts: React.FC = () => {
  const { t, locale, dir } = useDashboardLanguage();
  const isRtl = dir === "rtl" || locale === "ar";
  const { discounts, addDiscount, removeDiscount } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [activeTab, setActiveTab] = useState<"promo" | "sitewide" | "gift">("promo");
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreateDiscount = () => {
    openCrudModal({
      mode: "create",
      entity: "discount",
      title: isRtl ? "إنشاء كود خصم جديد" : "Create New Discount Code",
      fields: [
        { name: "code", label: isRtl ? "كود الخصم (البروموكود)" : "Promo Code", required: true, placeholder: "e.g. SUMMER25" },
        {
          name: "type",
          label: isRtl ? "نوع الخصم" : "Discount Type",
          type: "select",
          defaultValue: "percentage",
          options: [
            { label: isRtl ? "نسبة مئوية (%)" : "Percentage (%)", value: "percentage" },
            { label: isRtl ? "مبلغ ثابت (ج.م)" : "Fixed Amount (EGP)", value: "fixed" },
          ],
        },
        { name: "value", label: isRtl ? "قيمة الخصم" : "Discount Value", type: "number", required: true, placeholder: "25" },
        { name: "maxUsage", label: isRtl ? "الحد الأقصى للاستخدام" : "Max Usage Limit", type: "number", defaultValue: 100, placeholder: "100" },
        { name: "expires", label: isRtl ? "تاريخ الانتهاء" : "Expiration Date", type: "text", placeholder: "YYYY-MM-DD (e.g. 2026-12-31)" },
      ],
      onSubmit: async (data) => {
        const val = Number(data.value) || 10;
        const discText = data.type === "fixed" ? `${val} EGP Off` : `${val}% Off`;
        await addDiscount({
          code: data.code.toUpperCase(),
          discount: discText,
          type: data.type || "percentage",
          value: val,
          maxUsage: Number(data.maxUsage) || 100,
          expires: data.expires || "2026-12-31",
          status: "Active",
        });
      },
    });
  };

  const handleOpenDeleteDiscount = (d: any) => {
    openCrudModal({
      mode: "delete",
      entity: "discount",
      title: isRtl ? `تأكيد حذف كود الخصم ${d.code}` : `Confirm Deleting Discount ${d.code}`,
      initialData: {
        id: d.id,
        name: `${d.code} (${d.discount})`,
      },
      onDelete: async () => {
        await removeDiscount(d.id);
      },
    });
  };

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
              {t.discounts.title}
            </h3>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              {t.discounts.subtitle}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            {discounts.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none"
        >
          <span className="tracking-wide">{t.discounts.showDetails}</span>
          <i
            className={`bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] text-[10px] ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable Body */}
      <div
        className={`transition-all duration-500 ease-in-out bg-[var(--color-surface-elevated)]/20 ${
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 space-y-4">
          {/* Search + Create New */}
          <div className="flex justify-between items-center gap-3">
            <div className="relative flex-1 max-w-[240px]">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.discounts.searchPlaceholder}
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenCreateDiscount}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] hover:opacity-95 text-white rounded-lg text-xs font-bold font-ui transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.discounts.createNew}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-5 border-b border-[var(--color-border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("promo")}
              className={`font-bold uppercase tracking-wider pb-2 transition-all ${
                activeTab === "promo"
                  ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.discounts.tabPromo}
            </button>
          </div>

          {/* Codes List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-subtitle">
                <div className="flex flex-col items-center justify-center gap-1">
                  <Percent className="w-5 h-5 text-[var(--color-text-muted)]" />
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {isRtl ? "لا توجد أكواد خصم بعد" : "No discount codes yet"}
                  </span>
                  <span>
                    {isRtl ? "أنشئ كود الخصم الأول لمتجرك الآن" : "Create promo codes to reward your customers"}
                  </span>
                </div>
              </div>
            ) : (
              filtered.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)]/10 border border-[var(--color-primary-light)]/20 flex items-center justify-center text-[var(--color-primary-light)]">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold font-mono text-sm text-[var(--color-text-primary)]">{d.code}</span>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                        {d.discount} • {d.usage} used • Exp: {d.expires}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusPill variant={d.variant}>{d.status}</StatusPill>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteDiscount(d)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
