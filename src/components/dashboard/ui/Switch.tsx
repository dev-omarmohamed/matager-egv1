"use client";

import React from "react";
import { focusRing } from "./styles";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full shrink-0 border transition-colors duration-200 ${focusRing} ${
      checked
        ? "bg-[var(--color-status-green)] border-transparent"
        : "bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
    }`}
  >
    <span
      className={`absolute top-0.5 start-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-4 rtl:-translate-x-4" : ""
      }`}
    />
  </button>
);

/** Title + description on the start side, switch on the end side. */
export const SettingRow: React.FC<{
  title: React.ReactNode;
  desc?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}> = ({ title, desc, checked, onChange, children }) => (
  <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[var(--color-text-primary)]">{title}</p>
        {desc && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-snug">{desc}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={String(title)} />
    </div>
    {children}
  </div>
);
