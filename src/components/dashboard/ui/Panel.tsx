"use client";

import React, { useId, useState } from "react";
import { Collapse } from "./Collapse";
import { surface, divider, focusRing, scrollNone } from "./styles";

/* ───────────────────────── Panel ───────────────────────── */

interface PanelProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** bootstrap-icons class, e.g. "bi-bag-check" */
  icon?: string;
  badge?: React.ReactNode;
  /** small inline element next to the title (status pill, etc.) */
  meta?: React.ReactNode;
  /** buttons shown on the header's trailing side */
  actions?: React.ReactNode;
  /** text next to the chevron on >= sm screens */
  toggleLabel?: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  icon,
  badge,
  meta,
  actions,
  toggleLabel,
  defaultOpen = true,
  collapsible = true,
  className = "",
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const isOpen = collapsible ? open : true;

  const titleBlock = (
    <>
      {icon && (
        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]">
          <i className={`bi ${icon} text-sm sm:text-base`} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)] truncate">
            {title}
          </span>
          {badge !== undefined && badge !== null && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
              {badge}
            </span>
          )}
          {meta}
        </span>
        {subtitle && (
          <span className="block text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5 truncate">
            {subtitle}
          </span>
        )}
      </span>
    </>
  );

  return (
    <section className={`${surface} overflow-hidden ${className}`}>
      <header className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={bodyId}
            className={`flex-1 min-w-0 flex items-center gap-2.5 text-start rounded-lg ${focusRing}`}
          >
            {titleBlock}
          </button>
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-2.5">{titleBlock}</div>
        )}

        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}

        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={toggleLabel || "Toggle"}
            aria-expanded={open}
            aria-controls={bodyId}
            className={`shrink-0 h-8 px-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-secondary)] ${focusRing}`}
          >
            {toggleLabel && <span className="hidden sm:inline">{toggleLabel}</span>}
            <i
              className={`bi bi-chevron-down text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </header>

      <Collapse open={isOpen} id={bodyId}>
        <div className={`border-t ${divider}`}>{children}</div>
      </Collapse>
    </section>
  );
};

/* ───────────────────────── Tabs ───────────────────────── */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: string;
  badge?: React.ReactNode;
}

interface PanelTabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

/** Underline tabs that scroll sideways on small screens instead of wrapping. */
export function PanelTabs<T extends string>({ tabs, active, onChange, className = "" }: PanelTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 overflow-x-auto px-2 sm:px-3 border-b ${divider} ${scrollNone} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-3 py-2.5 flex items-center gap-1.5 text-xs font-bold font-ui transition-colors rounded-t-lg ${focusRing} ${
              isActive ? "text-[var(--color-primary-light)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            {tab.icon && <i className={`bi ${tab.icon} text-[13px]`} aria-hidden="true" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span className="text-[9px] px-1.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                {tab.badge}
              </span>
            )}
            <span
              className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--color-primary-light)] origin-center transition-transform duration-200 ${
                isActive ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Wrap tab content so switching fades in softly. */
export const TabPane: React.FC<{ id: string; className?: string; children: React.ReactNode }> = ({
  id,
  className = "",
  children,
}) => (
  <div key={id} role="tabpanel" className={`animate-in fade-in duration-200 ${className}`}>
    {children}
  </div>
);
