/* Shared class tokens. Colours come only from CSS variables, so light/dark just works.
   Anti-gravity weightless elevation with spring transitions. */

export const surface =
  "glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-card-hover)]";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60";

export const divider = "border-[var(--color-border-subtle)]";

export const eyebrow =
  "text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle";

const btnBase = `inline-flex items-center justify-center gap-1.5 rounded-lg font-ui font-bold whitespace-nowrap select-none transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${focusRing}`;

export const btnPrimary = `${btnBase} px-3.5 py-2 text-xs text-white bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-dark)] hover:-translate-y-[1px] shadow-sm hover:shadow-[0_4px_12px_rgba(0,82,255,0.25)]`;

export const btnGhost = `${btnBase} px-3 py-1.5 text-[11px] text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:-translate-y-[1px]`;

export const btnIcon = `${btnBase} w-8 h-8 sm:w-7 sm:h-7 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)] hover:-translate-y-[1px]`;

export const btnIconDanger = `${btnBase} w-8 h-8 sm:w-7 sm:h-7 text-xs text-[var(--color-status-red)] bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] hover:-translate-y-[1px]`;

export const inputCls = `w-full rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-3.5 py-2.5 text-[16px] sm:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-ui transition-all focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-[var(--color-primary-light)]/20 disabled:opacity-60`;

export const scrollNone =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
