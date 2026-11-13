"use client";

import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LanguageProvider, useLanguage } from "@/i18n";

interface MatagerLogoProps {
  animated?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  text?: string;
  as?: "div" | "span";
  onAnimationComplete?: () => void;
}

export const MatagerLogo: React.FC<MatagerLogoProps> = ({
  animated = false,
  size = "md",
  showWordmark = true,
  className = "",
  text,
  as = "span",
  onAnimationComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Gracefully retrieve language without throwing if outside LanguageProvider
  let activeLocale = "en";
  let brandText = "Matager";
  try {
    const lang = useLanguage();
    if (lang) {
      activeLocale = lang.locale;
      brandText = lang.locale === "ar" ? "متاجر" : "Matager";
    }
  } catch {
    // Rendered outside of LanguageProvider, keep default "Matager"
  }

  // Allow explicit text override if supplied
  if (text) {
    brandText = text;
  }

  const isArabic = activeLocale === "ar";

  const sizeDimensions = {
    sm: { icon: 28, font: isArabic ? "text-[18px]" : "text-[17px] tracking-tight" },
    md: { icon: 36, font: isArabic ? "text-[22px]" : "text-[20px] tracking-tight" },
    lg: { icon: 48, font: isArabic ? "text-[28px]" : "text-[26px] tracking-tight" },
    xl: { icon: 68, font: isArabic ? "text-[42px]" : "text-[38px] md:text-[44px] tracking-tight" },
  };

  const currentSize = sizeDimensions[size];

  // Motion variants
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const wordmarkVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const RootTag = as;

  return (
    <RootTag
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}
      aria-label={brandText}
    >
      {/* ─── APP ICON (Isometric Cube with Arrow Tip) ─── */}
      <span
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        {shouldAnimate ? (
          <motion.span
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={onAnimationComplete}
            className="w-full h-full inline-flex items-center justify-center"
          >
            <img
              src="/app-icon.png"
              alt={brandText}
              width={currentSize.icon}
              height={currentSize.icon}
              className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
            />
          </motion.span>
        ) : (
          <img
            src="/app-icon.png"
            alt={brandText}
            width={currentSize.icon}
            height={currentSize.icon}
            className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
          />
        )}
      </span>

      {/* ─── SYSTEM FONT WORDMARK (Josefin Sans in EN / El Messiri in AR) ─── */}
      {showWordmark && (
        <span className="inline-flex flex-col justify-center leading-none">
          {shouldAnimate ? (
            <motion.span
              variants={wordmarkVariants}
              initial="hidden"
              animate="visible"
              className={`font-heading font-medium text-[var(--color-text-primary)] ${currentSize.font}`}
            >
              {brandText}
            </motion.span>
          ) : (
            <span
              className={`font-heading font-medium text-[var(--color-text-primary)] ${currentSize.font}`}
            >
              {brandText}
            </span>
          )}
        </span>
      )}
    </RootTag>
  );
};
