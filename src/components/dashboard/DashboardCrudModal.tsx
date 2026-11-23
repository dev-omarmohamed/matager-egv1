"use client";

import React, { useEffect, useState, useId } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { useTheme } from "@/theme/useTheme";
import {
  X,
  AlertTriangle,
  Check,
  Trash2,
  Edit,
  Eye,
  PlusCircle,
  Loader2,
  Package,
  ShoppingCart,
  Percent,
  Monitor,
  Users,
  Info,
} from "lucide-react";

export type CrudMode = "create" | "edit" | "delete" | "view";

export type CrudEntity =
  | "product"
  | "order"
  | "discount"
  | "pos_node"
  | "team_member"
  | "customer"
  | "custom";

export interface CrudFieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox" | "email" | "tel";
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

export interface DashboardCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: CrudMode;
  entity: CrudEntity | string;
  title?: string;
  description?: string;
  initialData?: Record<string, any>;
  fields?: CrudFieldConfig[];
  onSubmit?: (formData: Record<string, any>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  product: Package,
  order: ShoppingCart,
  discount: Percent,
  pos_node: Monitor,
  team_member: Users,
  customer: Users,
  custom: Info,
};

export const DashboardCrudModal: React.FC<DashboardCrudModalProps> = ({
  isOpen,
  onClose,
  mode,
  entity,
  title,
  description,
  initialData = {},
  fields = [],
  onSubmit,
  onDelete,
  children,
  loading: externalLoading = false,
  error: externalError = null,
}) => {
  const { locale, dir } = useDashboardLanguage();
  const { theme } = useTheme();
  const isRtl = dir === "rtl" || locale === "ar";
  const titleId = useId();
  const descId = useId();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Sync formData whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      const defaultState: Record<string, any> = { ...initialData };
      fields.forEach((f) => {
        if (defaultState[f.name] === undefined && f.defaultValue !== undefined) {
          defaultState[f.name] = f.defaultValue;
        }
      });
      setFormData(defaultState);
      setInternalError(null);
    }
  }, [isOpen, initialData, fields]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isBusy = externalLoading || internalLoading;
  const currentError = externalError || internalError;

  const EntityIcon = ENTITY_ICONS[entity] || Info;

  // Localized default titles
  const getDefaultTitle = () => {
    if (title) return title;
    const entityLabels: Record<string, { en: string; ar: string }> = {
      product: { en: "Product", ar: "منتج" },
      order: { en: "Order", ar: "طلب" },
      discount: { en: "Discount Code", ar: "كوبون خصم" },
      pos_node: { en: "POS Terminal", ar: "نقطة بيع POS" },
      team_member: { en: "Team Member", ar: "عضو فريق" },
      customer: { en: "Customer", ar: "عميل" },
      custom: { en: "Record", ar: "سجل" },
    };
    const e = entityLabels[entity] || { en: entity, ar: entity };

    if (isRtl) {
      switch (mode) {
        case "create":
          return `إضافة ${e.ar} جديد`;
        case "edit":
          return `تعديل ${e.ar}`;
        case "delete":
          return `تأكيد حذف ${e.ar}`;
        case "view":
          return `تفاصيل ${e.ar}`;
      }
    } else {
      switch (mode) {
        case "create":
          return `Add New ${e.en}`;
        case "edit":
          return `Edit ${e.en}`;
        case "delete":
          return `Delete ${e.en}`;
        case "view":
          return `${e.en} Details`;
      }
    }
  };

  const getDefaultDescription = () => {
    if (description) return description;
    if (isRtl) {
      switch (mode) {
        case "create":
          return "أدخل البيانات المطلوبة لإنشاء السجل في قاعدة البيانات الحية.";
        case "edit":
          return "قم بتحديث الحقول واضغط على حفظ لتطبيق التغييرات فوراً.";
        case "delete":
          return "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.";
        case "view":
          return "عرض كامل لبيانات السجل الحالي من نظام متجر.";
      }
    } else {
      switch (mode) {
        case "create":
          return "Fill in the required fields to create this entry in live database.";
        case "edit":
          return "Update the fields and save to apply changes immediately.";
        case "delete":
          return "Are you sure you want to delete this item? This action cannot be undone.";
        case "view":
          return "Full view of this record from Matager Realtime Database.";
      }
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }
    if (mode === "delete") {
      if (onDelete) {
        try {
          setInternalLoading(true);
          setInternalError(null);
          await onDelete();
          onClose();
        } catch (err: any) {
          setInternalError(err?.message || "Failed to delete record.");
        } finally {
          setInternalLoading(false);
        }
      } else {
        onClose();
      }
      return;
    }

    if (onSubmit) {
      try {
        setInternalLoading(true);
        setInternalError(null);
        await onSubmit(formData);
        onClose();
      } catch (err: any) {
        setInternalError(err?.message || "Failed to save record.");
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      dir={dir}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* ─── BACKDROP (Reactive to Store Owner's Active Theme) ─── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
        aria-hidden="true"
      />

      {/* ─── MODAL PANEL (Direction-Aware & Responsive) ───
          Desktop (md: >= 768px):
            - Takes half the viewport width (50%): w-full md:w-1/2
            - LTR: Anchored right-0, slides in from right (translate-x-full -> translate-x-0)
            - RTL: Anchored left-0, slides in from left (-translate-x-full -> translate-x-0)
            - Full height drawer: top-0 bottom-0 h-full
          Mobile (< 768px):
            - Spans full width: w-full
            - Slides in from top: top-0 inset-x-0 max-h-[92vh] (-translate-y-full -> translate-y-0)
      */}
      <div
        className={`fixed top-0 bottom-0 z-50 flex flex-col w-full md:w-1/2 bg-[var(--color-surface)] border-[var(--color-border)] shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-transform ${
          isRtl
            ? "left-0 border-r md:border-r border-y md:border-y-0"
            : "right-0 border-l md:border-l border-y md:border-y-0"
        } max-md:max-h-[92vh] max-md:rounded-b-[24px] max-md:border-b max-md:border-x-0 max-md:top-0 max-md:inset-x-0 animate-in ${
          isRtl ? "slide-in-from-left max-md:slide-in-from-top" : "slide-in-from-right max-md:slide-in-from-top"
        }`}
        style={{
          boxShadow:
            theme === "light"
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border)"
              : "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--color-border-subtle)",
        }}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                mode === "delete"
                  ? "bg-red-500/10 border-red-500/25 text-red-500"
                  : "bg-[var(--color-primary-light)]/10 border-[var(--color-primary-light)]/25 text-[var(--color-primary-light)]"
              }`}
            >
              {mode === "delete" ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <EntityIcon className="w-5 h-5" />
              )}
            </div>
            <div className="truncate">
              <h2
                id={titleId}
                className="text-base sm:text-lg font-bold font-heading text-[var(--color-text-primary)] tracking-tight truncate"
              >
                {getDefaultTitle()}
              </h2>
              <p
                id={descId}
                className="text-xs text-[var(--color-text-muted)] font-subtitle truncate mt-0.5"
              >
                {getDefaultDescription()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isRtl ? "إغلاق النافذة" : "Close modal"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] border border-transparent hover:border-[var(--color-border-subtle)] transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── ERROR BANNER (IF ANY) ─── */}
        {currentError && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{currentError}</span>
          </div>
        )}

        {/* ─── MODAL BODY (SCROLLABLE) ─── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {children ? (
            children
          ) : mode === "delete" ? (
            /* DELETE CONFIRMATION STATE */
            <div className="p-4 sm:p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
              <div className="flex items-center gap-2.5 text-red-500 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{isRtl ? "تحذير: هذا الإجراء دائم" : "Warning: This action is permanent"}</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {getDefaultDescription()}
              </p>
              {initialData && Object.keys(initialData).length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1">
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    {initialData.name || initialData.title || initialData.code || initialData.id}
                  </div>
                  {initialData.id && (
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      ID: {initialData.id}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : mode === "view" ? (
            /* READ / VIEW READ-ONLY STATE */
            <div className="space-y-4">
              {fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map((f) => {
                    const val = formData[f.name];
                    return (
                      <div
                        key={f.name}
                        className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-1"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                          {f.label}
                        </span>
                        <div className="text-xs font-semibold text-[var(--color-text-primary)] break-words">
                          {val !== undefined && val !== null && val !== ""
                            ? typeof val === "boolean"
                              ? val
                                ? "Yes"
                                : "No"
                              : String(val)
                            : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-xs space-y-2">
                  {Object.entries(initialData).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-[var(--color-border-subtle)]/40 pb-1.5 last:border-b-0">
                      <span className="text-[var(--color-text-muted)] capitalize">{k.replace(/_/g, " ")}:</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* CREATE & EDIT FORM INPUTS */
            <div className="space-y-4">
              {fields.map((field) => {
                const value = formData[field.name] ?? "";
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle">
                      {field.label}
                      {field.required && <span className="text-red-500 ms-1">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled || isBusy}
                        required={field.required}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)]/30 font-ui transition-all"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={field.disabled || isBusy}
                        required={field.required}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)]/30 font-ui transition-all"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          disabled={field.disabled || isBusy}
                          className="w-4 h-4 rounded text-[var(--color-primary-light)] bg-[var(--color-surface-elevated)] border-[var(--color-border)] focus:ring-0"
                        />
                        <span>{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={value}
                        onChange={(e) =>
                          handleInputChange(
                            field.name,
                            field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        disabled={field.disabled || isBusy}
                        required={field.required}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)]/30 font-ui transition-all"
                      />
                    )}

                    {field.helpText && (
                      <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── MODAL FOOTER ACTIONS ─── */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2 rounded-xl text-xs font-bold font-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all"
            >
              {mode === "view"
                ? isRtl
                  ? "إغلاق"
                  : "Close"
                : isRtl
                ? "إلغاء"
                : "Cancel"}
            </button>

            {mode === "delete" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl text-xs font-bold font-ui bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-md flex items-center gap-1.5"
              >
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? "تأكيد الحذف" : "Confirm Delete"}</span>
              </button>
            ) : mode === "view" ? null : (
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2 rounded-xl text-xs font-bold font-ui bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] hover:opacity-95 active:scale-95 text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : mode === "create" ? (
                  <PlusCircle className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>
                  {mode === "create"
                    ? isRtl
                      ? "إضافة السجل"
                      : "Create Record"
                    : isRtl
                    ? "حفظ التغييرات"
                    : "Save Changes"}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
