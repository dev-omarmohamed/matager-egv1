"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { SITE_CONFIG } from "@/config/site";

interface CustomerTransitionProps {
  onCancel?: () => void;
}

export const CustomerTransition: React.FC<CustomerTransitionProps> = ({
  onCancel,
}) => {
  useEffect(() => {
    // Navigate smoothly after the branded skeleton and iris animation
    const timer = setTimeout(() => {
      window.location.href = SITE_CONFIG.storefrontUrl;
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-surface)] text-white p-6"
      role="alert"
      aria-label="Directing to customer store"
    >
      {/* Subtle radial iris blur behind the logo */}
      <div className="absolute w-[480px] h-[480px] rounded-full bg-brand-blue/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated logo pulse */}
        <div className="mb-6">
          <MatagerLogo size="lg" animated={false} />
        </div>

        {/* Status text */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-sm font-medium text-slate-300 mb-6"
        >
          Connecting to storefront...
        </motion.p>

        {/* Branded Storefront Skeleton Preview (never flashes white) */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-md">
          {/* Header skeleton */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="h-3 w-20 bg-white/10 rounded-pill animate-pulse" />
            <div className="h-4 w-4 rounded-full bg-white/10 animate-pulse" />
          </div>

          {/* Banner skeleton */}
          <div className="h-24 w-full bg-gradient-to-r from-blue-950/40 via-sky-950/20 to-blue-950/40 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-xs text-brand-sky/60">
              MATAGER COMMERCE
            </span>
          </div>

          {/* Product cards grid skeleton */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="h-16 bg-white/[0.04] rounded-md animate-pulse" />
            <div className="h-16 bg-white/[0.04] rounded-md animate-pulse" />
          </div>
        </div>

        {/* Quick fallback button in case navigation takes longer or user wants to stay */}
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            Stay on landing page
          </button>
        )}
      </div>
    </motion.div>
  );
};
