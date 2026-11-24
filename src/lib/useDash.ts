"use client";

import { useCallback } from "react";
import { useDashboardLanguage } from "@/lib/i18n";

/**
 * One hook for everything language related.
 *
 *   const { t, isRtl, tr } = useDash();
 *   tr("New order", "طلب جديد")   // picks the right string, no ternaries
 *
 * Layout never needs `isRtl`: components use logical utilities
 * (ps-/pe-/ms-/me-/start-/end-/text-start/text-end/border-s) which flip by themselves.
 */
export function useDash() {
  const lang = useDashboardLanguage();
  const isRtl = lang.dir === "rtl" || lang.locale === "ar";
  const tr = useCallback((en: string, ar: string) => (isRtl ? ar : en), [isRtl]);
  return { ...lang, isRtl, tr };
}
