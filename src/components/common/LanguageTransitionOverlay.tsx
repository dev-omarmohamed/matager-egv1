"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n";
import { Globe, ArrowRightLeft } from "lucide-react";

export const LanguageTransitionOverlay: React.FC = () => {
  const { isSwitching, locale, dir } = useLanguage();

  const targetName = locale === "en" ? "العربية" : "English";
  const label =
    locale === "en"
      ? "Switching language to Arabic..."
      : "جاري تغيير اللغة إلى الإنجليزية...";

  return (
    <AnimatePresence>
      {isSwitching && (
        <motion.div
          key="lang-transition-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-[var(--color-canvas)]/40 backdrop-blur-[6px]"
          aria-hidden="true"
        >
          {/* Subtle Ambient Radial Pulse */}
          <div
            className="absolute w-[400px] h-[300px] rounded-full blur-[80px] opacity-70 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(153, 132, 216, 0.4) 0%, rgba(63, 203, 127, 0.2) 50%, transparent 80%)",
            }}
          />

          {/* Floating High-End Transition Pill */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-5 py-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl flex items-center gap-3 select-none text-[var(--color-text-primary)]"
            style={{
              boxShadow:
                "0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--color-border-subtle)",
            }}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-accent-violet)]/15 border border-[var(--color-accent-violet)]/30 flex items-center justify-center text-[var(--color-accent-violet)] animate-spin" style={{ animationDuration: "1.8s" }}>
              <Globe className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2 text-xs font-medium tracking-tight">
              <span className="text-[var(--color-text-muted)]">
                {locale === "en" ? "EN" : "AR"}
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--color-accent-mint)]" />
              <span className="font-heading font-medium text-[var(--color-text-primary)] text-sm">
                {targetName}
              </span>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mint)] animate-ping" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
