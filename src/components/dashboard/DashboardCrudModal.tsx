"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDash } from "@/lib/useDash";
import { inputCls, btnPrimary, btnGhost, focusRing } from "./ui/styles";

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
  hideFooter?: boolean;
  loading?: boolean;
  error?: string | null;
}

const ENTITY_ICONS: Record<string, string> = {
  product: "bi-box-seam",
  order: "bi-bag-check",
  discount: "bi-percent",
  pos_node: "bi-pc-display",
  team_member: "bi-people",
  customer: "bi-person",
  custom: "bi-info-circle",
};

const ENTITY_LABELS: Record<string, { en: string; ar: string }> = {
  product: { en: "Product", ar: "منتج" },
  order: { en: "Order", ar: "طلب" },
  discount: { en: "Discount Code", ar: "كوبون خصم" },
  pos_node: { en: "POS Terminal", ar: "نقطة بيع POS" },
  team_member: { en: "Team Member", ar: "عضو فريق" },
  customer: { en: "Customer", ar: "عميل" },
  custom: { en: "Record", ar: "سجل" },
};

const EXIT_MS = 280;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

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
  hideFooter = false,
  loading: externalLoading = false,
  error: externalError = null,
}) => {
  const { dir, isRtl, tr } = useDash();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  /* Two-phase mount: `mounted` keeps the DOM alive while `shown` drives the CSS transition,
     so the sheet slides OUT as smoothly as it slides in. */
  const [mounted, setMounted] = useState(isOpen);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => {
      setMounted(false);
      returnFocusRef.current?.focus?.();
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  /* Seed the form once per opening (not on every parent re-render, which would wipe typing). */
  useEffect(() => {
    if (!isOpen) return;
    const seed: Record<string, any> = { ...initialData };
    fields.forEach((f) => {
      if (seed[f.name] === undefined && f.defaultValue !== undefined) seed[f.name] = f.defaultValue;
    });
    setFormData(seed);
    setInternalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* Move focus into the sheet when it opens. */
  useEffect(() => {
    if (!shown) return;
    const first = panelRef.current?.querySelector<HTMLElement>("input,select,textarea");
    (first ?? panelRef.current)?.focus({ preventScroll: true });
  }, [shown]);

  /* Escape closes, Tab stays inside the sheet. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* Lock page and dashboard scroll while any part of the modal is on screen. */
  useEffect(() => {
    if (!mounted) return;

    // 1. Prevent background smooth scroll via Lenis if active
    const lenis = (typeof window !== "undefined" && (window as any).__lenis) || null;
    lenis?.stop?.();

    // 2. Lock html and body scroll
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyPaddingRight = document.body.style.paddingRight;
    const origBodyTouchAction = document.body.style.touchAction;

    // Compensate for scrollbar width to prevent background layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // 3. Fallback: prevent touchmove on non-scrollable backdrop from scrolling background
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (panelRef.current && panelRef.current.contains(target)) {
        return; // allow modal inner scrolling
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.paddingRight = origBodyPaddingRight;
      document.body.style.touchAction = origBodyTouchAction;
      document.removeEventListener("touchmove", handleTouchMove);
      lenis?.start?.();
    };
  }, [mounted]);

  const setField = useCallback((name: string, value: any) => {
    setFormData((p) => ({ ...p, [name]: value }));
  }, []);

  if (!mounted) return null;

  const isBusy = externalLoading || busy;
  const currentError = externalError || internalError;
  const isDelete = mode === "delete";

  const label = ENTITY_LABELS[entity] || { en: String(entity), ar: String(entity) };
  const defaultTitle = {
    create: tr(`Add New ${label.en}`, `إضافة ${label.ar} جديد`),
    edit: tr(`Edit ${label.en}`, `تعديل ${label.ar}`),
    delete: tr(`Delete ${label.en}`, `تأكيد حذف ${label.ar}`),
    view: tr(`${label.en} Details`, `تفاصيل ${label.ar}`),
  }[mode];
  const defaultDesc = {
    create: tr("Fill in the required fields to create this entry.", "أدخل البيانات المطلوبة لإنشاء السجل."),
    edit: tr("Update the fields and save to apply changes immediately.", "حدّث الحقول واضغط حفظ لتطبيق التغييرات فوراً."),
    delete: tr(
      "Are you sure you want to delete this item? This action cannot be undone.",
      "هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء."
    ),
    view: tr("Full view of this record.", "عرض كامل لبيانات السجل."),
  }[mode];

  const run = async (fn?: () => Promise<void> | void, fallback = "Something went wrong.") => {
    if (!fn) return onClose();
    try {
      setBusy(true);
      setInternalError(null);
      await fn();
      onClose();
    } catch (err: any) {
      setInternalError(err?.message || fallback);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (mode === "view") return onClose();
    if (isDelete) return run(onDelete, tr("Failed to delete record.", "تعذّر حذف السجل."));
    if (onSubmit) return run(() => onSubmit(formData), tr("Failed to save record.", "تعذّر حفظ السجل."));
    onClose();
  };

  const iconTone = isDelete
    ? "bg-[var(--color-status-red-bg)] border-[var(--color-status-red-border)] text-[var(--color-status-red)]"
    : "bg-[var(--color-primary-light)]/10 border-[var(--color-primary-light)]/25 text-[var(--color-primary-light)]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      dir={dir}
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none touch-none overscroll-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet: bottom sheet on phones, side drawer from >= md (flips automatically in RTL) */}
      <div
        ref={panelRef}
        tabIndex={-1}
        data-lenis-prevent
        className={`absolute inset-x-0 bottom-0 max-h-[92dvh] md:inset-x-auto md:end-0 md:top-0 md:bottom-0 md:max-h-none md:w-[min(540px,50vw)]
          h-[92dvh] md:h-full flex flex-col overflow-hidden outline-none
          bg-[var(--color-surface)] border-t border-[var(--color-border)] md:border-t-0 md:border-s
          rounded-t-[24px] md:rounded-none shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none will-change-transform
          ${shown ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full md:rtl:-translate-x-full"}`}
      >
        {/* Grab handle (phones) */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center shrink-0 bg-[var(--color-surface)]" aria-hidden="true">
          <span className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* 1. Header: Static docked to top */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between gap-3 shrink-0 bg-[var(--color-surface)] sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconTone}`}>
              <i className={`bi ${isDelete ? "bi-exclamation-triangle" : ENTITY_ICONS[entity] || "bi-info-circle"} text-base`} />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-bold font-heading text-[var(--color-text-primary)] truncate">
                {title || defaultTitle}
              </h2>
              <p id={descId} className="text-[11px] text-[var(--color-text-muted)] font-subtitle truncate mt-0.5">
                {description || defaultDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr("Close", "إغلاق")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors ${focusRing}`}
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {currentError && (
          <div
            role="alert"
            className="px-4 py-2.5 flex items-center gap-2 text-xs border-b bg-[var(--color-status-red-bg)] border-[var(--color-status-red-border)] text-[var(--color-status-red)] shrink-0 z-10"
          >
            <i className="bi bi-exclamation-circle shrink-0" />
            <span className="flex-1 font-medium">{currentError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* 2. Inner Body: Scrollable */}
          {children ? (
            hideFooter ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {children}
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 space-y-4 custom-scrollbar">
                {children}
              </div>
            )
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 space-y-4 custom-scrollbar">
              {isDelete ? (
              <div className="p-4 rounded-2xl space-y-2.5 bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-status-red)]">
                  <i className="bi bi-exclamation-triangle" />
                  <span>{tr("Warning: This action is permanent", "تحذير: هذا الإجراء دائم")}</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{defaultDesc}</p>
                {Object.keys(initialData).length > 0 && (
                  <div className="p-3 rounded-xl text-xs bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="font-semibold text-[var(--color-text-primary)] break-words">
                      {initialData.name || initialData.title || initialData.code || initialData.id}
                    </div>
                    {initialData.id && (
                      <div dir="ltr" className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 text-start">
                        ID: {initialData.id}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : mode === "view" ? (
              fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fields.map((f) => {
                    const val = formData[f.name];
                    return (
                      <div
                        key={f.name}
                        className="p-3 rounded-xl space-y-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
                          {f.label}
                        </span>
                        <div className="text-xs font-semibold text-[var(--color-text-primary)] break-words">
                          {val === undefined || val === null || val === ""
                            ? "—"
                            : typeof val === "boolean"
                            ? val
                              ? tr("Yes", "نعم")
                              : tr("No", "لا")
                            : String(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl text-xs space-y-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                  {Object.entries(initialData).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 pb-1.5 border-b border-[var(--color-border-subtle)] last:border-0">
                      <span className="text-[var(--color-text-muted)] capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-[var(--color-text-primary)] text-end break-words">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              fields.map((field) => {
                const value = formData[field.name] ?? "";
                const disabled = field.disabled || isBusy;
                return (
                  <div key={field.name} className="space-y-1.5">
                    {field.type !== "checkbox" && (
                      <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle">
                        {field.label}
                        {field.required && <span className="text-[var(--color-status-red)] ms-1">*</span>}
                      </label>
                    )}

                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={value}
                        onChange={(e) => setField(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        required={field.required}
                        className={`${inputCls} resize-none`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={value}
                        onChange={(e) => setField(field.name, e.target.value)}
                        disabled={disabled}
                        required={field.required}
                        className={inputCls}
                      >
                        {field.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => setField(field.name, e.target.checked)}
                          disabled={disabled}
                          className="w-4 h-4 rounded accent-[var(--color-primary-light)]"
                        />
                        <span>{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type || "text"}
                        inputMode={field.type === "number" ? "decimal" : undefined}
                        dir={field.type === "email" || field.type === "tel" ? "ltr" : undefined}
                        value={value}
                        onChange={(e) =>
                          setField(
                            field.name,
                            field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        disabled={disabled}
                        required={field.required}
                        className={`${inputCls} ${field.type === "email" || field.type === "tel" ? "text-start" : ""}`}
                      />
                    )}

                    {field.helpText && (
                      <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">{field.helpText}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
          )}

          {/* 3. Footer: Static docked to bottom */}
          {!hideFooter && (
            <div className="px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center gap-2 shrink-0 sticky bottom-0 z-20">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className={`${btnGhost} flex-1 md:flex-none !px-4 !py-2.5 md:!py-2 !text-xs md:ms-auto`}
              >
                {mode === "view" ? tr("Close", "إغلاق") : tr("Cancel", "إلغاء")}
              </button>

              {mode !== "view" && (
                <button
                  type="submit"
                  disabled={isBusy}
                  className={`${btnPrimary} flex-1 md:flex-none !px-5 !py-2.5 md:!py-2 !text-xs ${
                    isDelete ? "!bg-none !bg-[var(--color-status-red)]" : ""
                  }`}
                >
                  {isBusy ? (
                    <i className="bi bi-arrow-repeat animate-spin" />
                  ) : (
                    <i className={`bi ${isDelete ? "bi-trash3" : mode === "create" ? "bi-plus-circle" : "bi-check2"}`} />
                  )}
                  <span>
                    {isDelete
                      ? tr("Confirm Delete", "تأكيد الحذف")
                      : mode === "create"
                      ? tr("Create Record", "إضافة السجل")
                      : tr("Save Changes", "حفظ التغييرات")}
                  </span>
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
