"use client";

import React from "react";
import { TONES, Tone } from "./tones";
import { focusRing } from "./styles";

interface StatProps {
  tone?: Tone;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: string;
  pulse?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Compact tinted tile. Becomes a button when `onClick` is passed (used for filters). */
export const Stat: React.FC<StatProps> = ({
  tone = "neutral",
  label,
  value,
  hint,
  icon,
  pulse,
  active,
  onClick,
  className = "",
}) => {
  const body = (
    <>
      <span className="flex items-center justify-between gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-wide truncate font-subtitle ${TONES[tone].text}`}>
          {label}
        </span>
        {icon && <i className={`bi ${icon} text-xs shrink-0 ${TONES[tone].text}`} aria-hidden="true" />}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-base sm:text-lg font-bold font-heading leading-none text-[var(--color-text-primary)]">
        <span className="truncate">{value}</span>
        {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${TONES[tone].bg}`} />}
      </span>
      {hint && <span className="mt-1 block text-[10px] text-[var(--color-text-muted)] truncate">{hint}</span>}
    </>
  );

  const cls = `block min-w-0 text-start rounded-xl border px-2.5 py-2 transition-shadow duration-200 ${TONES[tone].box} ${
    active ? "ring-2 ring-[var(--color-primary-light)]/60" : ""
  } ${className}`;

  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active} className={`${cls} ${focusRing} active:scale-[0.98]`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
};
