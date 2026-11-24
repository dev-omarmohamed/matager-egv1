/* Full class names written out so Tailwind's scanner can see them.
   (Template strings like `bg-[var(--color-status-${x}-bg)]` are NOT detected and silently break.) */

export const TONES = {
  neutral: {
    box: "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)]",
    text: "text-[var(--color-text-muted)]",
    bg: "bg-[var(--color-text-muted)]",
  },
  amber: {
    box: "bg-[var(--color-status-amber-bg)] border-[var(--color-status-amber-border)]",
    text: "text-[var(--color-status-amber)]",
    bg: "bg-[var(--color-status-amber)]",
  },
  blue: {
    box: "bg-[var(--color-status-blue-bg)] border-[var(--color-status-blue-border)]",
    text: "text-[var(--color-status-blue)]",
    bg: "bg-[var(--color-status-blue)]",
  },
  red: {
    box: "bg-[var(--color-status-red-bg)] border-[var(--color-status-red-border)]",
    text: "text-[var(--color-status-red)]",
    bg: "bg-[var(--color-status-red)]",
  },
  green: {
    box: "bg-[var(--color-status-green-bg)] border-[var(--color-status-green-border)]",
    text: "text-[var(--color-status-green)]",
    bg: "bg-[var(--color-status-green)]",
  },
  purple: {
    box: "bg-[var(--color-status-purple-bg)] border-[var(--color-status-purple-border)]",
    text: "text-[var(--color-status-purple)]",
    bg: "bg-[var(--color-status-purple)]",
  },
} as const;

export type Tone = keyof typeof TONES;
