"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n";
import {
  PRICING_PLANS,
  POS_ONLY_PLAN,
  calculatePlanTotal,
  BillingCycle,
  PricingMode,
  PlanDefinition,
  POS_ONLY_TERMINAL_PRICE,
} from "@/lib/pricing-calculator";
import { Check, Plus, Minus, ArrowRight, Monitor, Layers, Sparkles } from "lucide-react";
import { gsap, isReducedMotion } from "@/lib/motion";

export interface InitialPlanOptions {
  planId?: string;
  posCount?: number;
  billing?: BillingCycle;
  mode?: PricingMode;
  expectedVolume?: string;
  tierPrice?: number;
}

interface PricingCalculatorProps {
  onOpenAuth: (
    mode?: "signin" | "signup",
    role?: "owner" | "employee",
    options?: InitialPlanOptions
  ) => void;
  onOpenEnterpriseContact?: () => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  onOpenAuth,
  onOpenEnterpriseContact,
}) => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";
  const isRtl = dir === "rtl";

  const [pricingMode, setPricingMode] = useState<PricingMode>("catalog");
  const [activeIndex, setActiveIndex] = useState<number>(2); // Default to Commerce Pro (50-100)
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [posCount, setPosCount] = useState<number>(0);
  const [posOnlyCount, setPosOnlyCount] = useState<number>(1);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const priceDisplayRef = useRef<HTMLSpanElement>(null);

  const currentPlan: PlanDefinition = PRICING_PLANS[activeIndex] || PRICING_PLANS[0];

  const totals = calculatePlanTotal(
    pricingMode === "pos_only"
      ? { mode: "pos_only", billing, posCount: posOnlyCount }
      : { mode: "catalog", planId: currentPlan.id, billing, posCount }
  );

  // Animated number count tween
  useEffect(() => {
    if (!priceDisplayRef.current || isReducedMotion()) return;

    const currentVal = parseFloat(
      priceDisplayRef.current.textContent?.replace(/[^\d.]/g, "") || "0"
    );
    const targetVal = totals.netMonthlyTotal;

    const obj = { val: currentVal };
    gsap.to(obj, {
      val: targetVal,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: () => {
        if (priceDisplayRef.current) {
          priceDisplayRef.current.textContent = Math.round(obj.val).toLocaleString(
            isAr ? "ar-EG" : "en-US"
          );
        }
      },
    });
  }, [totals.netMonthlyTotal, isAr]);

  // Keyboard navigation for accessible slider
  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((prev) =>
        isRtl ? Math.max(0, prev - 1) : Math.min(PRICING_PLANS.length - 1, prev + 1)
      );
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((prev) =>
        isRtl ? Math.min(PRICING_PLANS.length - 1, prev + 1) : Math.max(0, prev - 1)
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(PRICING_PLANS.length - 1);
    }
  };

  // Slider click / drag positioning
  const updateIndexFromPointer = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    const normalizedRatio = isRtl ? 1 - ratio : ratio;
    const nearestIndex = Math.round(normalizedRatio * (PRICING_PLANS.length - 1));
    setActiveIndex(nearestIndex);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateIndexFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateIndexFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const thumbPercent = (activeIndex / (PRICING_PLANS.length - 1)) * 100;

  const handleChoosePlan = () => {
    if (pricingMode === "pos_only") {
      onOpenAuth("signup", "owner", {
        mode: "pos_only",
        planId: "pos_only",
        posCount: posOnlyCount,
        billing,
        expectedVolume: `${posOnlyCount} POS Cashier Stations`,
        tierPrice: totals.netMonthlyTotal,
      });
    } else {
      onOpenAuth("signup", "owner", {
        mode: "catalog",
        planId: currentPlan.id,
        posCount,
        billing,
        expectedVolume: `${currentPlan.range} products`,
        tierPrice: totals.netMonthlyTotal,
      });
    }
  };

  return (
    <section
      id="pricing"
      dir={dir}
      className="relative px-4 sm:px-6 py-20 sm:py-28 text-[var(--color-text-primary)] transition-colors overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-[760px] mx-auto mb-10 sm:mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
            {isAr
              ? "يتم احتساب باقتك وفقاً لاحتياجات تجارتك الفعلية"
              : "Flexible pricing built for your exact retail operations."}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            {isAr
              ? "اختر المتجر السحابي المتكامل وفقاً لعدد المنتجات، أو اختر منظومة نقاط البيع والإدارة فقط (POS) بحساب عدد الأجهزة."
              : "Choose full unified commerce based on catalog size, or select POS & Admin Dashboard only based on your hardware stations."}
          </p>
        </div>

        {/* ─── CONTROLS ROW: DUAL MODE SWITCH & BILLING TOGGLE ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
          {/* Channel Mode Toggle: Catalog vs POS Only */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm">
            <button
              type="button"
              onClick={() => setPricingMode("catalog")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                pricingMode === "catalog"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? "المتجر السحابي المتكامل" : "Unified Store (Catalog)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPricingMode("pos_only")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                pricingMode === "pos_only"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isAr ? "نقاط البيع والإدارة فقط" : "POS & Admin Only"}</span>
            </button>
          </div>

          {/* Billing Cycle Toggle: Monthly vs Yearly */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {isAr ? "الدفع الشهري" : "Monthly billing"}
            </button>

            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                billing === "yearly"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <span>{isAr ? "الدفع السنوي" : "Yearly billing"}</span>
              <span className="text-[11px] font-bold text-emerald-500">
                {isAr ? "خصم 10%" : "Save 10%"}
              </span>
            </button>
          </div>
        </div>

        {/* ─── IF CATALOG MODE: 5-STOP DRAGGABLE SNAPPING SLIDER ─── */}
        {pricingMode === "catalog" && (
          <div className="max-w-[820px] mx-auto mb-10 sm:mb-14 px-4">
            <div
              ref={sliderRef}
              role="slider"
              tabIndex={0}
              aria-label={isAr ? "محدد نطاق عدد المنتجات" : "Product volume range slider"}
              aria-valuemin={0}
              aria-valuemax={PRICING_PLANS.length - 1}
              aria-valuenow={activeIndex}
              aria-valuetext={`${currentPlan.name} (${currentPlan.range} products)`}
              onKeyDown={handleSliderKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative h-10 flex items-center cursor-pointer touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            >
              {/* Background Rail */}
              <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)]" />

              {/* Active Colored Track */}
              <div
                className="absolute h-2 rounded-full bg-[var(--color-accent-blue)]"
                style={{
                  [isRtl ? "right" : "left"]: 0,
                  width: `${thumbPercent}%`,
                }}
              />

              {/* 5 Stops Points */}
              <div className="absolute inset-x-0 flex items-center justify-between px-1 pointer-events-none">
                {PRICING_PLANS.map((plan, idx) => (
                  <div
                    key={plan.id}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      idx <= activeIndex
                        ? "bg-[var(--color-accent-blue)] border-white/60 shadow-sm"
                        : "bg-[var(--color-surface)] border-[var(--color-border)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 5 Stop Range Labels Under Track */}
            <div className="flex items-center justify-between mt-3 px-1 text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
              {PRICING_PLANS.map((plan, idx) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-colors py-1 px-1 focus-visible:outline-none ${
                    idx === activeIndex
                      ? "text-[var(--color-accent-blue)] font-bold scale-105"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <span>{isAr ? plan.rangeAr : plan.range}</span>
                  <span className="hidden sm:inline text-[11px] opacity-75 ms-1">
                    {isAr ? "منتج" : "items"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── INTERACTIVE PLAN DETAIL CARD ─── */}
        <div className="max-w-[820px] mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-10 shadow-xl transition-all">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[var(--color-border-subtle)]">
            {/* Plan Title & Subtitle */}
            <div>
              <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                {isAr ? "الباقة المختارة" : "Selected Operating Tier"}
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-text-primary)]">
                {pricingMode === "pos_only"
                  ? isAr
                    ? POS_ONLY_PLAN.nameAr
                    : POS_ONLY_PLAN.name
                  : isAr
                  ? currentPlan.nameAr
                  : currentPlan.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {pricingMode === "pos_only"
                  ? isAr
                    ? `منظومة كاشير مخصصة تشمل ${posOnlyCount} نقطة بيع مع لوحة الإدارة`
                    : `Dedicated POS setup configured for ${posOnlyCount} terminal station(s)`
                  : isAr
                  ? `مصممة للمتاجر التي تعرض ${currentPlan.rangeAr} صنفاً`
                  : `Architected for catalogs with ${currentPlan.range} active SKUs`}
              </p>
            </div>

            {/* Price Metric Callout */}
            <div className="text-start md:text-end">
              <div className="flex items-baseline gap-1">
                <span
                  ref={priceDisplayRef}
                  className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] font-body tabular-nums"
                >
                  {Math.round(totals.netMonthlyTotal).toLocaleString(isAr ? "ar-EG" : "en-US")}
                </span>
                <span className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                  {isAr ? "ج.م / شهرياً" : "EGP / mo"}
                </span>
              </div>

              {billing === "yearly" && (
                <div className="text-xs text-emerald-500 font-medium mt-1">
                  {isAr
                    ? `إجمالي سنوي ${Math.round(totals.yearlyNetTotal)} ج.م (وفرت ${Math.round(
                        totals.yearlySavings
                      )} ج.م)`
                    : `${Math.round(totals.yearlyNetTotal)} EGP billed yearly (You save ${Math.round(
                        totals.yearlySavings
                      )} EGP)`}
                </div>
              )}
            </div>
          </div>

          {/* ─── POS TERMINAL CONTROLS ─── */}
          {pricingMode === "pos_only" ? (
            /* POS Only Mode Hardware Stepper */
            <div className="py-6 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {isAr ? "عدد محطات وماكينات الكاشير المطلوبة" : "Number of POS Cashier Stations"}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {isAr
                    ? "200 ج.م شهرياً لكل ماكينة كاشير متصلة (خصم 10% عند اختيار الدفع السنوي)"
                    : "200 EGP per month per registered POS cashier terminal (10% off on yearly billing)"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPosOnlyCount((prev) => Math.max(1, prev - 1))}
                  disabled={posOnlyCount <= 1}
                  aria-label={isAr ? "إنقاص نقطة بيع" : "Decrease POS terminal count"}
                  className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-bold text-lg font-body tabular-nums text-[var(--color-text-primary)]">
                  {posOnlyCount}
                </span>

                <button
                  type="button"
                  onClick={() => setPosOnlyCount((prev) => Math.min(50, prev + 1))}
                  disabled={posOnlyCount >= 50}
                  aria-label={isAr ? "زيادة نقطة بيع" : "Increase POS terminal count"}
                  className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[#0479E8] dark:text-[#0083FE] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Catalog Mode Add-on POS Stepper */
            <div className="py-6 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {isAr ? "محطات نقاط البيع كاشير (POS Terminals)" : "POS Cashier Terminals"}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {currentPlan.freePosCount > 0
                    ? isAr
                      ? `تشمل الباقة نقطتي بيع مجاناً (كل نقطة إضافية 150 ج.م/شهر)`
                      : `Includes 2 free POS registers (150 EGP/mo each beyond 2)`
                    : isAr
                    ? `150 ج.م شهرياً لكل ماكينة كاشير متصلة`
                    : `150 EGP per month per registered hardware station`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPosCount((prev) => Math.max(0, prev - 1))}
                  disabled={posCount <= 0}
                  aria-label={isAr ? "إنقاص نقطة بيع" : "Decrease POS terminal count"}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-8 text-center font-bold text-base font-body tabular-nums text-[var(--color-text-primary)]">
                  {posCount}
                </span>

                <button
                  type="button"
                  onClick={() => setPosCount((prev) => Math.min(20, prev + 1))}
                  disabled={posCount >= 20}
                  aria-label={isAr ? "زيادة نقطة بيع" : "Increase POS terminal count"}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[#0479E8] dark:text-[#0083FE] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Capabilities Checklist */}
          <div className="py-6">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              {isAr ? "الميزات والقدرات المشمولة" : "Included Platform Capabilities"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(pricingMode === "pos_only"
                ? isAr
                  ? POS_ONLY_PLAN.capabilitiesAr
                  : POS_ONLY_PLAN.capabilities
                : isAr
                ? currentPlan.capabilitiesAr
                : currentPlan.capabilities
              ).map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[var(--color-text-muted)] text-center sm:text-start">
              {isAr
                ? "تشمل جميع الباقات استضافة سحابية فائقة السرعة، تشفير كامل، ودعم فني على مدار الساعة."
                : "All plans include high-velocity cloud hosting, automated SSL encryption, and 24/7 technical support."}
            </div>

            <button
              type="button"
              onClick={handleChoosePlan}
              className="btn-primary-pill text-[13px] sm:text-[14px] font-ui py-1.5 sm:py-2 px-3.5 sm:px-5 shrink-0"
            >
              <span>{isAr ? "اختيار هذه الباقة" : "Choose plan"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* ─── ENTERPRISE 550+ PRODUCTS CONTACT CALLOUT ─── */}
        {pricingMode === "catalog" && (
          <div className="max-w-[820px] mx-auto mt-6 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-start">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-primary-light)] shrink-0" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {isAr
                    ? "هل تحتاج إلى عرض أكثر من 550 منتج في متجرك؟"
                    : "Need to showcase more than 550 products?"}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {isAr
                  ? "نوفر بنية تحتية سحابية مخصصة وسعات ضخمة للشركات الكبرى وسلاسل الفروع. تواصل معنا للحصول على خطة مخصصة."
                  : "We provide dedicated cloud clusters, custom SLAs, and high-volume limits for large enterprise merchants."}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenEnterpriseContact}
              className="btn-ghost-action text-xs font-semibold py-2 px-4 whitespace-nowrap shrink-0 border border-[var(--color-border)] hover:border-[var(--color-primary-light)] text-[var(--color-primary-light)] flex items-center gap-1.5"
            >
              <span>{isAr ? "طلب تسعير خاص للمؤسسات" : "Contact Enterprise"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
