"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = "" }) => {
  const { locale, toggleLocale, isSwitching } = useLanguage();
  const [rotation, setRotation] = useState(0);

  const label = locale === "en" ? "التبديل إلى العربية" : "Switch to English";
  const displayLabel = locale === "en" ? "عربي" : "EN";

  const handleToggle = () => {
    setRotation((prev) => prev + 180);
    toggleLocale();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSwitching}
      aria-label={label}
      title={label}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-violet)]  ${className}`}
    >
      <motion.span
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center"
      >
        <Globe className="w-3.5 h-3.5" aria-hidden="true" />
      </motion.span>

      {/* <span className="font-medium tracking-tight">
        {displayLabel}
      </span> */}

      {/* Subtle indicator dot */}
      {/* <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mint)] opacity-70 group-hover:opacity-100 transition-opacity" /> */}
    </button>
  );
};
