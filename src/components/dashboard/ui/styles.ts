/* Shared class tokens. Colours come only from CSS variables, so light/dark just works.
   No hover styles on purpose: touch-first, press feedback via :active only. */

export const surface =
  "glass-panel rounded-[18px] sm:rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)]";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]/60";

export const divider = "border-[var(--color-border-subtle)]";

export const eyebrow =
  "text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle";

const btnBase = `inline-flex items-center justify-center gap-1.5 rounded-lg font-ui font-bold whitespace-nowrap select-none transition-[transform,opacity] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${focusRing}`;

export const btnPrimary = `${btnBase} px-3 py-1.5 text-[11px] text-white bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] shadow-sm`;

export const btnGhost = `${btnBase} px-3 py-1.5 text-[11px] text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]`;

export const btnIcon = `${btnBase} w-8 h-8 sm:w-7 sm:h-7 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]`;

export const btnIconDanger = `${btnBase} w-8 h-8 sm:w-7 sm:h-7 text-xs text-[var(--color-status-red)] bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)]`;

export const inputCls = `w-full rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-3 py-2 text-[16px] sm:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-ui transition-colors focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)]/30 disabled:opacity-60`;

export const scrollNone =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
