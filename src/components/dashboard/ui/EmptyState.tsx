import React from "react";

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}> = ({ icon = "bi-inbox", title, desc, action }) => (
  <div className="py-8 px-4 flex flex-col items-center gap-1.5 text-center">
    <span className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
      <i className={`bi ${icon} text-base`} aria-hidden="true" />
    </span>
    <p className="text-xs font-bold text-[var(--color-text-primary)]">{title}</p>
    {desc && <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs font-subtitle">{desc}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
