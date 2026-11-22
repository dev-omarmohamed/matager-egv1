"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/i18n";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import {
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  CheckCircle2,
  Store,
  Layers,
  Monitor,
  Building,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  Rocket,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  User,
  Plus,
  Minus,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { setupStoreOwnerAccount } from "@/lib/firestore-service";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { STORE_CATEGORIES, StoreCategory, CATEGORY_LABELS } from "@/lib/categories";
import { WholesalerSignupWizard } from "@/components/auth/WholesalerSignupWizard";
import type { InitialPlanOptions } from "@/components/landing/PricingCalculator";
import {
  ARAB_COUNTRIES,
  type ArabCountry,
  type ArabCity,
  getCitiesForCountry,
  getCityCoordinates,
  generateGoogleMapsUrl,
} from "@/lib/arab-countries";
import {
  PRICING_PLANS,
  POS_ONLY_PLAN,
  calculatePlanTotal,
  POS_ONLY_TERMINAL_PRICE,
  YEARLY_DISCOUNT,
  type PlanDefinition,
} from "@/lib/pricing-calculator";

export { ARAB_COUNTRIES, type ArabCountry, type ArabCity };

export interface VolumePricingOption {
  id: string;
  range: string;
  rangeAr: string;
  price: number;
  dealBadge?: string;
  dealBadgeAr?: string;
  mappedPlan: "starter" | "pro" | "enterprise";
}

export const VOLUME_PRICING_OPTIONS: VolumePricingOption[] = [
  { id: "tier_1", range: "5 - 20 products", rangeAr: "5 - 20 منتج", price: 170, mappedPlan: "starter" },
  { id: "tier_2", range: "20 - 50 products", rangeAr: "20 - 50 منتج", price: 270, mappedPlan: "starter" },
  { id: "tier_3", range: "50 - 100 products", rangeAr: "50 - 100 منتج", price: 570, mappedPlan: "pro" },
  { id: "tier_4", range: "100 - 300 products", rangeAr: "100 - 300 منتج", price: 970, mappedPlan: "pro" },
  {
    id: "tier_5",
    range: "300 - 550 products",
    rangeAr: "300 - 550 منتج (أقصى سعة)",
    price: 1500,
    dealBadge: "Best Deal: Includes 2 Free POS Terminals",
    dealBadgeAr: "أفضل صفقة: تتضمن نقطتي بيع (2 POS) مجاناً",
    mappedPlan: "enterprise",
  },
];

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  initialRole?: "owner" | "employee" | "wholesaler";
  initialPlanOptions?: InitialPlanOptions;
  onOpenEnterpriseContact?: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "signup",
  initialRole = "owner",
  initialPlanOptions,
  onOpenEnterpriseContact,
  onClose,
}) => {
  const { dir, locale } = useLanguage();
  const { t } = useDashboardLanguage();
  const isAr = locale === "ar";
  const prefersReducedMotion = useReducedMotion();

  const [screen, setScreen] = useState<"role_chooser" | "auth">("auth");
  const [selectedRole, setSelectedRole] = useState<"merchant" | "wholesaler">(
    initialRole === "wholesaler" ? "wholesaler" : "merchant"
  );
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  const { stop: stopScroll, start: startScroll } = useSmoothScroll();

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const [modalPricingMode, setModalPricingMode] = useState<"catalog" | "pos_only">("catalog");
  const [modalPosCount, setModalPosCount] = useState<number>(0);
  const [modalBilling, setModalBilling] = useState<"monthly" | "yearly">("monthly");

  const [activeSliderIndex, setActiveSliderIndex] = useState<number>(2);
  const [selectedVolumeTier, setSelectedVolumeTier] = useState<string>("tier_3");
  const [expectedVolume, setExpectedVolume] = useState<string>("50-100 products");
  const [tierPrice, setTierPrice] = useState<number>(570);
  const [salesChannel, setSalesChannel] = useState<"hybrid" | "online" | "pos">("hybrid");

  const modalSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingModalSliderRef = useRef<boolean>(false);

  const currentSelectedPlan: PlanDefinition = PRICING_PLANS[activeSliderIndex] || PRICING_PLANS[2];

  // Mapped plan tier for DB compatibility (moved up so it is available to all handlers)
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro");

  const handleSliderIndexChange = (newIndex: number) => {
    const bounded = Math.max(0, Math.min(PRICING_PLANS.length - 1, newIndex));
    setActiveSliderIndex(bounded);
    const plan = PRICING_PLANS[bounded];
    setSelectedVolumeTier(plan.id);
    setExpectedVolume(`${plan.range} products`);
    const isYearly = modalBilling === "yearly";
    const price = isYearly ? Math.round(plan.monthlyBasePrice * (1 - YEARLY_DISCOUNT)) : plan.monthlyBasePrice;
    setTierPrice(price);
    setSelectedPlan(plan.id === "tier_5" ? "enterprise" : plan.id === "tier_3" || plan.id === "tier_4" ? "pro" : "starter");
    if (plan.id === "tier_5") {
      setSalesChannel("hybrid");
    }
  };

  const updateModalSliderFromPointer = (clientX: number) => {
    if (!modalSliderRef.current) return;
    const rect = modalSliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    const normalizedRatio = isAr ? 1 - ratio : ratio;
    const nearestIndex = Math.round(normalizedRatio * (PRICING_PLANS.length - 1));
    handleSliderIndexChange(nearestIndex);
  };

  const handleModalSliderPointerDown = (e: React.PointerEvent) => {
    isDraggingModalSliderRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateModalSliderFromPointer(e.clientX);
  };

  const handleModalSliderPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingModalSliderRef.current) return;
    updateModalSliderFromPointer(e.clientX);
  };

  const handleModalSliderPointerUp = (e: React.PointerEvent) => {
    isDraggingModalSliderRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { }
  };

  const handleModalSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleSliderIndexChange(isAr ? activeSliderIndex - 1 : activeSliderIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleSliderIndexChange(isAr ? activeSliderIndex + 1 : activeSliderIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleSliderIndexChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      handleSliderIndexChange(PRICING_PLANS.length - 1);
    }
  };

  // Auto-collapse capabilities when the selected plan changes
  useEffect(() => {
    setShowCapabilities(false);
  }, [activeSliderIndex, modalPricingMode]);

  useEffect(() => {
    if (initialPlanOptions && isOpen) {
      if (initialPlanOptions.mode === "pos_only") {
        setModalPricingMode("pos_only");
        setSalesChannel("pos");
        const count = initialPlanOptions.posCount || 1;
        setModalPosCount(count);
        const billingCycle = initialPlanOptions.billing || "monthly";
        setModalBilling(billingCycle);
        const price = billingCycle === "yearly" ? Math.round(count * POS_ONLY_TERMINAL_PRICE * 0.9) : count * POS_ONLY_TERMINAL_PRICE;
        setTierPrice(price);
        setExpectedVolume(`${count} POS Cashier Terminals`);
        setSelectedPlan("starter");
      } else {
        setModalPricingMode("catalog");
        const planId = initialPlanOptions.planId || "tier_3";
        const foundIdx = PRICING_PLANS.findIndex((p) => p.id === planId);
        const resolvedIdx = foundIdx >= 0 ? foundIdx : 2;
        setActiveSliderIndex(resolvedIdx);
        const plan = PRICING_PLANS[resolvedIdx];
        setSelectedVolumeTier(plan.id);
        setExpectedVolume(`${plan.range} products`);
        const billingCycle = initialPlanOptions.billing || "monthly";
        setModalBilling(billingCycle);
        const price = billingCycle === "yearly" ? Math.round(plan.monthlyBasePrice * 0.9) : plan.monthlyBasePrice;
        setTierPrice(price);
        setSelectedPlan(plan.id === "tier_5" ? "enterprise" : plan.id === "tier_3" || plan.id === "tier_4" ? "pro" : "starter");
        const pos = initialPlanOptions.posCount || 0;
        setModalPosCount(pos);
        setSalesChannel(pos > 0 || plan.id === "tier_5" ? "hybrid" : "online");
      }
    }
  }, [initialPlanOptions, isOpen]);

  const handleModalPricingModeChange = (newMode: "catalog" | "pos_only") => {
    setModalPricingMode(newMode);
    if (newMode === "pos_only") {
      setSalesChannel("pos");
      const count = modalPosCount > 0 ? modalPosCount : 1;
      setModalPosCount(count);
      const isYearly = modalBilling === "yearly";
      const price = isYearly ? Math.round(count * POS_ONLY_TERMINAL_PRICE * 0.9) : count * POS_ONLY_TERMINAL_PRICE;
      setTierPrice(price);
      setExpectedVolume(`${count} POS Cashier Terminals`);
      setSelectedPlan("starter");
    } else {
      const plan = PRICING_PLANS[activeSliderIndex] || PRICING_PLANS[2];
      const isYearly = modalBilling === "yearly";
      const price = isYearly ? Math.round(plan.monthlyBasePrice * 0.9) : plan.monthlyBasePrice;
      setTierPrice(price);
      setExpectedVolume(`${plan.range} products`);
      setSelectedPlan(plan.id === "tier_5" ? "enterprise" : plan.id === "tier_3" || plan.id === "tier_4" ? "pro" : "starter");
      setSalesChannel(modalPosCount > 0 || plan.id === "tier_5" ? "hybrid" : "online");
    }
  };

  const handleModalBillingChange = (billing: "monthly" | "yearly") => {
    setModalBilling(billing);
    const isYearly = billing === "yearly";
    if (modalPricingMode === "pos_only") {
      const price = isYearly ? Math.round(modalPosCount * POS_ONLY_TERMINAL_PRICE * 0.9) : modalPosCount * POS_ONLY_TERMINAL_PRICE;
      setTierPrice(price);
    } else {
      const plan = PRICING_PLANS[activeSliderIndex] || PRICING_PLANS[2];
      const price = isYearly ? Math.round(plan.monthlyBasePrice * 0.9) : plan.monthlyBasePrice;
      setTierPrice(price);
    }
  };

  const handleModalPosCountChange = (delta: number) => {
    const next = Math.max(1, Math.min(20, modalPosCount + delta));
    setModalPosCount(next);
    const isYearly = modalBilling === "yearly";
    const price = isYearly ? Math.round(next * POS_ONLY_TERMINAL_PRICE * 0.9) : next * POS_ONLY_TERMINAL_PRICE;
    setTierPrice(price);
    setExpectedVolume(`${next} POS Cashier Terminals`);
  };

  const handleModalTierSelect = (tier: (typeof VOLUME_PRICING_OPTIONS)[number]) => {
    const foundIdx = PRICING_PLANS.findIndex((p) => p.id === tier.id);
    if (foundIdx >= 0) {
      handleSliderIndexChange(foundIdx);
    } else {
      setSelectedVolumeTier(tier.id);
      setExpectedVolume(tier.range);
      const isYearly = modalBilling === "yearly";
      const price = isYearly ? Math.round(tier.price * 0.9) : tier.price;
      setTierPrice(price);
      setSelectedPlan(tier.mappedPlan);
    }
  };

  const [storeName, setStoreName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [category, setCategory] = useState<StoreCategory>("clothing");
  const [country, setCountry] = useState("Egypt");
  const [currency, setCurrency] = useState("EGP");
  const [city, setCity] = useState("Cairo");
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const availableCities = useMemo(() => getCitiesForCountry(country), [country]);

  const handleCountryChange = (cName: string) => {
    setCountry(cName);
    const found = ARAB_COUNTRIES.find((c) => c.name === cName || c.nameAr === cName);
    if (found) {
      setCurrency(found.currency);
    }
    const newCities = getCitiesForCountry(cName);
    setCity(newCities.length > 0 ? newCities[0].name_en : "");
    setLocationUrl(null);
    setLocationStatus(null);
  };

  const handleLocateOnMap = () => {
    setIsLocating(true);
    setLocationStatus(null);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const gMapUrl = generateGoogleMapsUrl(lat, lng);
          setLocationUrl(gMapUrl);
          setIsLocating(false);
          setLocationStatus(
            isAr ? `✓ تم تحديد إحداثيات موقعك بنجاح (${lat}, ${lng})` : `✓ Location detected (${lat}, ${lng})`
          );
          setAddress((prev) => {
            const clean = prev.trim();
            if (!clean) return `${city || country} - ${gMapUrl}`;
            if (clean.includes("google.com/maps")) return clean;
            return `${clean} - ${gMapUrl}`;
          });
        },
        () => {
          const cityCoords = getCityCoordinates(country, city);
          if (cityCoords) {
            const gMapUrl = generateGoogleMapsUrl(cityCoords.lat, cityCoords.lng);
            setLocationUrl(gMapUrl);
            setLocationStatus(
              isAr
                ? `تم اعتماد إحداثيات مركز ${city || country} على خرائط جوجل`
                : `Using coordinates for ${city || country}`
            );
            setAddress((prev) => {
              const clean = prev.trim();
              if (!clean) return `${city || country} - ${gMapUrl}`;
              if (clean.includes("google.com/maps")) return clean;
              return `${clean} - ${gMapUrl}`;
            });
          } else {
            setLocationStatus(
              isAr ? "تعذر تحديد الإحداثيات آلياً. يرجى إدخال العنوان يدوياً." : "Unable to detect GPS. Please enter your address."
            );
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      const cityCoords = getCityCoordinates(country, city);
      if (cityCoords) {
        const gMapUrl = generateGoogleMapsUrl(cityCoords.lat, cityCoords.lng);
        setLocationUrl(gMapUrl);
        setLocationStatus(
          isAr ? `تم اعتماد إحداثيات مركز ${city || country} على خرائط جوجل` : `Using coordinates for ${city || country}`
        );
      }
      setIsLocating(false);
    }
  };

  const activeCountryObj =
    ARAB_COUNTRIES.find((c) => c.name === country || c.nameAr === country) || ARAB_COUNTRIES[0];
  const activeCurrencySymbol = isAr ? activeCountryObj.currencyAr : activeCountryObj.currency;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+20");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const formatStoreSlug = (name: string): string => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return "storename";
    const slug = trimmed.replace(/[^\w\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "");
    return slug || "storename";
  };

  const generateStrongPassword = () => {
    const emailUser = (email.split("@")[0] || "owner").replace(/[^a-zA-Z0-9]/g, "");
    const halfEmailLen = Math.max(2, Math.ceil(emailUser.length / 2));
    const emailPart = (emailUser.slice(0, halfEmailLen) || "adm").toLowerCase();
    const cleanPhoneDigits = phone.replace(/\D/g, "");
    const phonePart = cleanPhoneDigits.length >= 5 ? cleanPhoneDigits.slice(-5) : cleanPhoneDigits || "12345";
    const generated = `m${emailPart}${phonePart}@matager`;
    setSignupPassword(generated);
    setShowSignupPassword(true);
    setPasswordNotice(isAr ? "✓ تم توليد كلمة مرور قوية وتطبيقها بنجاح!" : "✓ Strong password generated and applied!");
    setTimeout(() => setPasswordNotice(null), 4000);
  };

  const [isLaunching, setIsLaunching] = useState(false);

  // Merchant Single-Step Sign-in & Forgot Password State
  const [signinForgotMode, setSigninForgotMode] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Signup Success & 5-Second Redirect Countdown State
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [signupSuccessData, setSignupSuccessData] = useState<{
    storeId: string;
    storeName: string;
    subdomain: string;
    email: string;
    plan: string;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleClose = () => {
    resetAllFlows();
    onClose();
  };

  useEffect(() => {
    setMode(initialMode);
    setSelectedRole(initialRole === "wholesaler" ? "wholesaler" : "merchant");
    setScreen("auth");
    resetAllFlows();
  }, [initialMode, initialRole]);

  useEffect(() => {
    if (isOpen) {
      stopScroll?.();
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        startScroll?.();
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen, stopScroll, startScroll]);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  // Live 5-second countdown timer on successful signup
  useEffect(() => {
    if (!isSignupSuccess) return;
    if (redirectCountdown <= 0) {
      const sId = signupSuccessData?.storeId || `store_${Date.now()}`;
      window.location.href = `/dashboard?storeId=${sId}`;
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSignupSuccess, redirectCountdown, signupSuccessData]);

  const resetAllFlows = () => {
    setSignupStep(1);
    setIsSignupSuccess(false);
    setSignupSuccessData(null);
    setRedirectCountdown(5);
    setSigninForgotMode(false);
    setSigninError(null);
    setResetError(null);
    setIsSigningIn(false);
    setIsSendingReset(false);
    setResetSent(false);
    setPassword("");
    setShowPassword(false);
    setSignupPassword("");
    setShowSignupPassword(false);
    setIsLaunching(false);
    setCountry("Egypt");
    setCurrency("EGP");
    setCity("Cairo");
    setAddress("");
    setIsLocating(false);
    setLocationUrl(null);
    setLocationStatus(null);
    setPhoneCountryCode("+20");
    setPasswordNotice(null);
    setShowCapabilities(false);
    if (!initialPlanOptions) {
      setModalPricingMode("catalog");
      setActiveSliderIndex(2);
      setSelectedVolumeTier("tier_3");
      setExpectedVolume("50-100 products");
      setTierPrice(570);
      setModalPosCount(0);
      setSalesChannel("hybrid");
    }
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    resetAllFlows();
  };

  const isSignupStepValid = () => {
    switch (signupStep) {
      case 1:
        return modalPricingMode === "pos_only" ? modalPosCount >= 1 : !!expectedVolume && tierPrice > 0;
      case 2:
        return storeName.trim().length > 0 && legalName.trim().length > 0;
      case 3:
        return category.trim().length > 0;
      case 4:
        return country.trim().length > 0 && city.trim().length > 0 && address.trim().length > 0;
      case 5: {
        const cleanPhoneDigits = phone.replace(/\D/g, "");
        return email.includes("@") && email.includes(".") && cleanPhoneDigits.length === 11 && signupPassword.length > 10;
      }
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleSignupNext = () => {
    if (!isSignupStepValid()) return;
    if (signupStep < 6) {
      setSignupStep((s) => (s + 1) as any);
    } else {
      setIsLaunching(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("matager_user_role", "merchant");
      }

      const finalAddress =
        locationUrl && !address.includes("google.com/maps") ? `${address.trim()} (${locationUrl})` : address.trim();

      const finalSalesChannel: "hybrid" | "online" | "pos" =
        modalPricingMode === "pos_only"
          ? "pos"
          : modalPosCount > 0 || selectedVolumeTier === "tier_5"
            ? "hybrid"
            : "online";

      const cleanPhoneDigits = phone.replace(/\D/g, "");
      const fullPhone = `${phoneCountryCode}${cleanPhoneDigits}`;

      setupStoreOwnerAccount({
        salesChannel: finalSalesChannel,
        expectedVolume,
        tierPrice,
        currency: activeCountryObj.currency,
        storeName,
        legalName,
        category,
        country,
        city,
        address: finalAddress,
        email,
        phone: fullPhone,
        password: signupPassword || "MatagerStore2026!",
        selectedPlan,
      })
        .then(({ store, user }) => {
          const sId = store?.id || `store_${Date.now()}`;
          const slug = storeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "store";

          if (typeof window !== "undefined") {
            localStorage.setItem("matager_user_role", "merchant");
            localStorage.setItem("matager_current_store_id", sId);
            localStorage.setItem("matager_active_store_id", sId);
            localStorage.setItem("matager_active_store_name", storeName);
            if (user?.id) {
              localStorage.setItem("matager_active_user_id", user.id);
            }
          }

          setIsLaunching(false);
          setSignupSuccessData({
            storeId: sId,
            storeName,
            subdomain: `${slug}.matager.com`,
            email,
            plan: selectedPlan,
          });
          setIsSignupSuccess(true);
          setRedirectCountdown(5);
        })
        .catch((err) => {
          console.error("Firebase store setup error:", err);
          const fallbackStoreId = `store_${Date.now()}`;
          const slug = storeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "store";

          if (typeof window !== "undefined") {
            localStorage.setItem("matager_user_role", "merchant");
            localStorage.setItem("matager_current_store_id", fallbackStoreId);
            localStorage.setItem("matager_active_store_id", fallbackStoreId);
            localStorage.setItem("matager_active_store_name", storeName);
            localStorage.setItem("matager_active_user_id", `owner_${Date.now()}`);
          }

          setIsLaunching(false);
          setSignupSuccessData({
            storeId: fallbackStoreId,
            storeName,
            subdomain: `${slug}.matager.com`,
            email,
            plan: selectedPlan,
          });
          setIsSignupSuccess(true);
          setRedirectCountdown(5);
        });
    }
  };

  const handleSignupBack = () => {
    if (signupStep > 1) setSignupStep((s) => (s - 1) as any);
  };

  const handleSingleStepSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRoleError(null);
    setSigninError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setSigninError(isAr ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    if (
      cleanIdentifier.toLowerCase().includes("wholesaler") ||
      cleanIdentifier.toLowerCase().includes("nilegarments") ||
      cleanIdentifier.toLowerCase().includes("delta-home")
    ) {
      setRoleError(t.auth.wholesalerSignup.wrongRoleError);
      return;
    }

    if (!password || password.length < 4) {
      setSigninError(isAr ? "يرجى إدخال كلمة المرور" : "Please enter your password");
      return;
    }

    setIsSigningIn(true);
    let uid = "";
    let sId = "";
    let storeNameFound = "";

    try {
      if (cleanIdentifier.includes("@")) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanIdentifier, password);
          uid = userCred.user.uid;
          sId = `store_${uid}`;
          storeNameFound = userCred.user.displayName || "";
        } catch (authErr: any) {
          if (
            authErr?.code === "auth/invalid-credential" ||
            authErr?.code === "auth/wrong-password" ||
            authErr?.code === "auth/user-not-found"
          ) {
            setSigninError(
              isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password"
            );
            setIsSigningIn(false);
            return;
          }
          console.warn("Firebase Auth signIn fallback:", authErr);
        }
      }

      // If Firebase Auth offline or fallback mode, lookup local platform stores
      if (!uid && typeof window !== "undefined") {
        const storedStores = JSON.parse(localStorage.getItem("matager_platform_stores") || "[]");
        const match = storedStores.find(
          (s: any) =>
            s.ownerEmail?.toLowerCase() === cleanIdentifier.toLowerCase() ||
            s.id?.toLowerCase() === cleanIdentifier.toLowerCase()
        );
        if (match) {
          sId = match.id;
          uid = match.id.replace("store_", "");
          storeNameFound = match.name;
        } else {
          uid = localStorage.getItem("matager_active_user_id") || `owner_${Date.now()}`;
          sId = localStorage.getItem("matager_active_store_id") || `store_${uid}`;
          storeNameFound = localStorage.getItem("matager_active_store_name") || "My Store";
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("matager_active_user_id", uid);
        localStorage.setItem("matager_user_role", "merchant");
        localStorage.setItem("matager_current_store_id", sId);
        localStorage.setItem("matager_active_store_id", sId);
        if (storeNameFound) {
          localStorage.setItem("matager_active_store_name", storeNameFound);
        }
        window.location.href = `/dashboard?storeId=${sId}`;
      }
      handleClose();
    } catch (err: any) {
      console.error("Sign in error:", err);
      setSigninError(
        isAr
          ? "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً"
          : "An error occurred during sign in. Please try again."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSendPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResetError(null);
    const cleanEmail = identifier.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setResetError(isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address");
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSent(true);
    } catch (err: any) {
      console.warn("sendPasswordResetEmail fallback:", err);
      setResetSent(true);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleWholesalerSignIn = () => {
    setRoleError(null);
    if (
      identifier.toLowerCase().includes("peacock") ||
      identifier.toLowerCase().includes("urban") ||
      identifier.toLowerCase().includes("owner") ||
      identifier.toLowerCase().includes("mohamed@")
    ) {
      setRoleError(t.auth.wholesalerSignup.wrongRoleError);
      return;
    }
    const wid = identifier.toLowerCase().includes("home") ? "wholesaler_home_01" : "wholesaler_clothing_01";
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_user_role", "wholesaler");
      localStorage.setItem("matager_wholesaler_id", wid);
    }
    handleClose();
    window.location.href = `/wholesaler?wholesalerId=${wid}`;
  };

  if (!isOpen) return null;

  const capabilitiesCount = (isAr ? currentSelectedPlan.capabilitiesAr : currentSelectedPlan.capabilities).length;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[500px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] p-6 sm:p-7 shadow-2xl text-[var(--color-text-primary)] z-10 overflow-hidden my-auto outline-none"
        style={{
          boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px var(--color-border-subtle)",
        }}
      >
        <div
          className="absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-80 h-36 pointer-events-none blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(4, 121, 232, 0.45) 0%, rgba(0, 131, 254, 0.2) 60%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-3">
              <MatagerLogo size="sm" showWordmark={true} animated={false} />
            </div>

            {screen === "auth" && selectedRole === "merchant" && mode === "signup" && !isSignupSuccess && (
              <div
                className="flex items-center gap-1.5"
                aria-label={`Step ${signupStep} of 6`}
              >
                {[1, 2, 3, 4, 5, 6].map((dot) => (
                  <span
                    key={dot}
                    className={`msm-dot ${dot === signupStep ? "is-active" : dot < signupStep ? "is-passed" : ""}`}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {roleError && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)] flex items-center gap-2">
            <StatusPill variant="danger">Access Refused</StatusPill>
            <span>{roleError}</span>
          </div>
        )}

        {/* Role chooser (kept as future path) */}
        {screen === "role_chooser" && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                MATAGER ACCESS
              </span>
              <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                {t.auth.roleChooser.title}
              </h2>
              <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                {t.auth.roleChooser.subtitle}
              </p>
            </div>
            <div className="pt-2">
              <button type="button" onClick={() => setScreen("auth")} className="msm-next w-full py-3">
                <span>{t.auth.roleChooser.continue}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Wholesaler flows */}
        {screen === "auth" && selectedRole === "wholesaler" && (
          <div className="space-y-5">
            {mode === "signup" ? (
              <>
                <WholesalerSignupWizard
                  onClose={handleClose}
                  onSuccess={(wid) => {
                    handleClose();
                    window.location.href = `/wholesaler?wholesalerId=${wid}`;
                  }}
                />
                <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {isAr ? "هل لديك حساب مورد بالفعل؟" : "Already have a wholesaler account?"}{" "}
                    <button type="button" data-switch="signin" onClick={() => switchMode("signin")} className="msm-switch">
                      {t.auth.wholesalerSignup.signinTab}
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    WHOLESALER ACCESS PORTAL
                  </span>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {t.auth.wholesalerSignup.signinTab}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? "تسجيل الدخول إلى لوحة إدارة الكتالوج وشرائح الأسعار."
                      : "Sign in to manage your wholesale catalog, volume tiers, and merchant inquiries."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {isAr ? "البريد الإلكتروني أو رمز المورد" : "Email or Wholesaler ID"}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setRoleError(null);
                    }}
                    placeholder="wholesale@nilegarments.eg"
                    dir="ltr"
                    className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {isAr ? "كلمة المرور" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      dir="ltr"
                      className="input-theme-gradient w-full ps-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleWholesalerSignIn}
                    disabled={!identifier.trim()}
                    className="msm-next w-full py-3"
                  >
                    <span>{t.auth.wholesalerSignup.signinTab}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>

                <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {isAr ? "ليس لديك حساب مورد؟" : "Don't have a wholesaler account?"}{" "}
                    <button type="button" data-switch="signup" onClick={() => switchMode("signup")} className="msm-switch">
                      {t.auth.wholesalerSignup.signupTab}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signup Success View with 5-Second Countdown */}
        {isSignupSuccess && signupSuccessData && (
          <div className="py-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--color-primary-light)]/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] border border-white/20 flex items-center justify-center text-white shadow-xl shadow-[var(--color-primary-dark)]/30">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-light)]/10 border border-[var(--color-primary-light)]/30 text-xs font-semibold text-[var(--color-primary-light)] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "تم إطلاق مساحة العمل بنجاح" : "Workspace Successfully Launched"}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)]">
                {isAr ? "مرحباً بك في متجرك الجديد!" : "Welcome to Your New Store!"}
              </h2>
              <p className="msm-sub text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
                {isAr
                  ? `تم تجهيز متجر "${signupSuccessData.storeName}" بنجاح وتفعيل بياناتك في السحاب.`
                  : `Store "${signupSuccessData.storeName}" is provisioned and ready on Matager OS.`}
              </p>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-start space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">{isAr ? "رابط المتجر:" : "Store URL:"}</span>
                <a
                  href={`https://${signupSuccessData.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary-light)] font-mono font-medium hover:underline flex items-center gap-1"
                >
                  <span>www.{signupSuccessData.subdomain.replace(/^www\./, "")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{isAr ? "الخطة المختارة:" : "Selected Plan:"}</span>
                <span className="font-medium text-[var(--color-text-primary)] uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-[var(--color-primary-dark)]/15 border border-[var(--color-primary-light)]/30">
                  {signupSuccessData.plan}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{isAr ? "حالة المتجر:" : "Store Status:"}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isAr ? "مفعل وجاهز" : "Active & Live"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[12px] bg-gradient-to-r from-[var(--color-primary-dark)]/10 via-[var(--color-primary-light)]/10 to-[var(--color-primary-dark)]/10 border border-[var(--color-primary-light)]/20">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                <Clock className="w-4 h-4 text-[var(--color-primary-light)] shrink-0" />
                <span>
                  {isAr
                    ? `سيتم تحويلك إلى مساحة عملك تلقائياً خلال `
                    : `You will be redirected to your workspace in `}
                  <span className="font-bold text-[var(--color-primary-light)] font-mono text-base px-1">
                    {redirectCountdown}
                  </span>
                  {isAr ? ` ثوانٍ...` : ` seconds...`}
                </span>
              </div>
              <div className="w-full bg-[var(--color-border-subtle)] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(redirectCountdown / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const sId = signupSuccessData.storeId;
                  window.location.href = `/dashboard?storeId=${sId}`;
                }}
                className="msm-next w-full py-3.5 text-sm font-semibold shadow-lg shadow-[var(--color-primary-dark)]/25"
              >
                <span>{isAr ? "الدخول إلى مساحة العمل الآن" : "Go to Workspace Now"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Merchant signup */}
        {screen === "auth" && selectedRole === "merchant" && mode === "signup" && !isSignupSuccess && (
          <div className="space-y-5">
            {/* STEP 1 */}
            {signupStep === 1 && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 1: تحديد الباقة والأسعار" : "Step 1: Plan & Volume Pricing"}
                  </span>
                  <h2 className="font-heading text-lg sm:text-xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "كم عدد المنتجات المتوقع عرضها شهرياً؟" : "How many products do you expect to showcase?"}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-1.5">
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[9px]">
                    <button
                      type="button"
                      onClick={() => handleModalPricingModeChange("catalog")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-center transition-all ${modalPricingMode === "catalog"
                        ? "bg-[var(--color-surface-hover)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                      {isAr ? "متجر موحد (كتالوج)" : "Unified Store (Catalog)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalPricingModeChange("pos_only")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-center transition-all ${modalPricingMode === "pos_only"
                        ? "bg-[var(--color-surface-hover)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                      {isAr ? "نقاط بيع فقط (POS)" : "POS & Admin Only"}
                    </button>
                  </div>

                  <div className="inline-flex items-center justify-center gap-1 p-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[9px]">
                    <button
                      type="button"
                      onClick={() => handleModalBillingChange("monthly")}
                      className={`px-2.5 py-1 rounded-lg transition-all font-medium ${modalBilling === "monthly"
                        ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                    >
                      {isAr ? "شهري" : "Monthly"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalBillingChange("yearly")}
                      className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${modalBilling === "yearly"
                        ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                    >
                      <span>{isAr ? "سنوي" : "Yearly"}</span>
                      <span className="text-[10px] font-bold text-emerald-500">-10%</span>
                    </button>
                  </div>
                </div>

                {modalPricingMode === "catalog" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                      {/* Slider section */}
                      <div className="space-y-2">
                        <div
                          ref={modalSliderRef}
                          role="slider"
                          tabIndex={0}
                          aria-label={isAr ? "محدد باقة المنتجات" : "Product volume range slider"}
                          aria-valuemin={0}
                          aria-valuemax={PRICING_PLANS.length - 1}
                          aria-valuenow={activeSliderIndex}
                          aria-valuetext={`${currentSelectedPlan.name} (${currentSelectedPlan.range} products)`}
                          onKeyDown={handleModalSliderKeyDown}
                          onPointerDown={handleModalSliderPointerDown}
                          onPointerMove={handleModalSliderPointerMove}
                          onPointerUp={handleModalSliderPointerUp}
                          className="relative h-8 flex items-center cursor-pointer touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)] rounded-full"
                        >
                          <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)]" />
                          <div
                            className="absolute h-2 rounded-full bg-[var(--color-primary-light)]"
                            style={{
                              [isAr ? "right" : "left"]: 0,
                              width: `${(activeSliderIndex / (PRICING_PLANS.length - 1)) * 100}%`,
                            }}
                          />
                          <div className="absolute inset-x-0 flex items-center justify-between px-1 pointer-events-none">
                            {PRICING_PLANS.map((plan, idx) => (
                              <div
                                key={plan.id}
                                className={`w-3 h-3 rounded-full border transition-all ${idx <= activeSliderIndex
                                  ? "bg-[var(--color-primary-light)] border-white/70 shadow-xs"
                                  : "bg-[var(--color-surface)] border-[var(--color-border)]"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                          {PRICING_PLANS.map((plan, idx) => (
                            <button
                              type="button"
                              key={plan.id}
                              onClick={() => handleSliderIndexChange(idx)}
                              className={`hover:text-[var(--color-text-primary)] transition-colors px-1 py-0.5 rounded ${idx === activeSliderIndex
                                ? "font-bold text-[var(--color-primary-light)] bg-[var(--color-surface-elevated)]"
                                : ""
                                }`}
                            >
                              {isAr ? plan.rangeAr : plan.range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plan + price */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                              {isAr ? currentSelectedPlan.nameAr : currentSelectedPlan.name}
                            </span>
                            <span className="px-3 py-0.5 text-[12px] rounded-lg bg-[var(--color-surface-hover)] shadow-sm">
                              {isAr ? `${currentSelectedPlan.rangeAr} منتج` : `${currentSelectedPlan.range} products`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
                            {currentSelectedPlan.id === "tier_5"
                              ? isAr
                                ? "أعلى سعة للكتالوج مع نقطتي بيع (2 POS) مجاناً"
                                : "Maximum catalog capacity + 2 free POS registers"
                              : isAr
                                ? "متجر موحد مع مزامنة سحابية وحماية تلقائية"
                                : "Unified storefront with cloud inventory & automated sync"}
                          </p>
                        </div>

                        <div className="text-right rtl:text-left shrink-0">
                          <div className="text-base sm:text-lg font-bold font-ui text-[var(--color-primary-light)]">
                            {tierPrice}
                            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1">
                              {activeCurrencySymbol} / {isAr ? "شهر" : "mo"}
                            </span>
                          </div>
                          {modalBilling === "yearly" && (
                            <span className="text-[10px] text-emerald-500 font-semibold block">
                              {isAr ? "شامل خصم 10% للسنوي" : "Includes 10% yearly discount"}
                            </span>
                          )}
                        </div>
                      </div>



                      {/* ── Capabilities Toggle (always visible) ── */}
                      <button
                        type="button"
                        onClick={() => setShowCapabilities((v) => !v)}
                        aria-expanded={showCapabilities}
                        aria-controls="plan-capabilities"
                        className="w-full flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-subtle)] text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${showCapabilities ? "rotate-180" : ""
                              }`}
                          />
                          {isAr ? "عرض إمكانيات الباقة" : "View plan capabilities"}
                          <span className="text-[var(--color-text-muted)] font-normal">({capabilitiesCount})</span>
                        </span>
                      </button>

                      {/* ── Capabilities Grid (hidden by default) ── */}
                      <div
                        id="plan-capabilities"
                        className={
                          showCapabilities
                            ? "grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[var(--color-text-secondary)]"
                            : "hidden"
                        }
                      >
                        {(isAr ? currentSelectedPlan.capabilitiesAr : currentSelectedPlan.capabilities)
                          .slice(0, 4)
                          .map((cap, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="truncate">{cap}</span>
                            </div>
                          ))}
                      </div>

                      {/* Enterprise Callout */}
                      <div className="p-2.5 flex items-center justify-end gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            handleClose();
                            onOpenEnterpriseContact?.();
                          }}
                          className="font-semibold text-[var(--color-primary-light)] hover:opacity-90 hover:underline underline-offset-2 transition-opacity text-[11px] sm:text-xs cursor-pointer bg-transparent border-0 p-0"
                        >
                          {isAr ? "هل تحتاج لعرض أكثر من 550 منتج؟" : "Need more than 550 products?"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalPricingMode === "pos_only" && (
                  <div className="space-y-3 p-3.5 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          {isAr ? "عدد محطات الكاشير (POS):" : "Number of POS Registers:"}
                        </label>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          {isAr
                            ? "200 ج.م لكل نقطة بيع شهرياً (خصم 10% على السنوي)"
                            : "200 EGP / register / mo (10% discount on yearly)"}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1 p-1 rounded-[10px]">
                        <button
                          type="button"
                          onClick={() => handleModalPosCountChange(-1)}
                          disabled={modalPosCount <= 1}
                          className="w-5 h-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[#0479E8] dark:text-[#0083FE] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease POS count"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-7 text-center text-[var(--color-text-primary)]">
                          {modalPosCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleModalPosCountChange(1)}
                          disabled={modalPosCount >= 20}
                          className="w-5 h-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-[#0479E8] dark:text-[#0083FE] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Increase POS count"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-[10px] border border-[var(--color-border)] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {isAr ? "تكلفة نظام الكاشير ولوحة الإدارة" : "Total POS & Admin System"}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                          {modalBilling === "yearly"
                            ? isAr
                              ? "سعر سنوي مخفض (180 ج.م × عدد الأجهزة)"
                              : "Yearly rate (180 EGP × registers)"
                            : isAr
                              ? "سعر شهري اعتيادي (200 ج.م × عدد الأجهزة)"
                              : "Standard monthly rate (200 EGP × registers)"}
                        </div>
                      </div>
                      <div className="text-right rtl:text-left">
                        <span className="text-base sm:text-lg font-bold font-ui text-[var(--color-primary-light)]">
                          {tierPrice}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] ms-1">
                          {activeCurrencySymbol} / {isAr ? "شهرياً" : "mo"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>
                          {isAr ? "لوحة تحكم إدارية سحابية كاملة ومجانية" : "Full cloud admin management dashboard included"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>
                          {isAr ? "مزامنة سريعة مع طباعة فواتير حرارية" : "High-speed sync & thermal receipts printing"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {signupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 2: بيانات النشاط" : "Step 2: Business details"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "ما اسم متجرك ونشاطك؟" : "What is your store name?"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "اسم المتجر" : "Store name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={isAr ? "متجر الأناقة" : "Store name"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-[11px]">
                      <span className="text-[var(--color-text-muted)] text-[11px]">
                        {isAr ? "رابط المتجر المقترح:" : "Suggested store URL:"}
                      </span>
                      <span className="font-semibold text-[11px] text-[var(--color-primary-light)]" dir="ltr">
                        www.{formatStoreSlug(storeName)}.com
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "الاسم القانوني للشركة" : "Legal name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder={isAr ? "شركة الأناقة للتجارة ذ.م.م" : "Legal company name"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {signupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 3: التصنيف" : "Step 3: Category"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "اختر المجال الرئيسي لمتجرك" : "Select your primary category"}
                  </h2>
                </div>

                <div className="max-h-[260px] overflow-y-auto pe-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                    {STORE_CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`msm-opt text-xs py-2.5 px-3 ${category === cat ? "is-selected" : ""}`}
                      >
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {CATEGORY_LABELS[cat]?.[isAr ? "ar" : "en"] || cat}
                        </span>
                        {category === cat && (
                          <Check className="w-3.5 h-3.5 text-[var(--color-primary-light)] shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {signupStep === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 4: الموقع الجغرافي" : "Step 4: Location"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "أين يقع متجرك الرئيسي؟" : "Where is your store located?"}
                  </h2>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "الدولة (مصر فقط حالياً)" : "Country (Egypt Only Currently)"}
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] appearance-none cursor-pointer pr-10 rtl:pr-3.5 rtl:pl-10"
                      >
                        {ARAB_COUNTRIES.map((c) => {
                          const isEgypt = c.name === "Egypt";
                          return (
                            <option
                              key={c.id}
                              value={c.name}
                              disabled={!isEgypt}
                              className={
                                !isEgypt
                                  ? "text-gray-400 bg-[var(--color-surface)]"
                                  : "bg-[var(--color-surface)] text-[var(--color-text-primary)] font-bold"
                              }
                            >
                              {isAr
                                ? `${c.nameAr} (${c.currencyAr}) ${!isEgypt ? "— قريباً" : ""}`
                                : `${c.name} (${c.currency}) ${!isEgypt ? "— Coming Soon" : ""}`}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-[var(--color-text-muted)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-end pt-1 font-ui">
                      <span className="font-bold text-[var(--color-primary-light)]">
                        {activeCountryObj.currency} ({activeCountryObj.currencyAr}) •{" "}
                        {isAr ? activeCountryObj.currencyNameAr : activeCountryObj.currencyNameEn}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "المدينة (اختيار إلزامي من المدن المعتمدة)" : "City (Strict Selection)"}
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] appearance-none cursor-pointer pr-10 rtl:pr-3.5 rtl:pl-10"
                      >
                        <option value="" disabled className="text-[var(--color-text-muted)]">
                          {isAr ? "── اختر المدينة من القائمة ──" : "── Select city from list ──"}
                        </option>
                        {availableCities.map((c) => {
                          const displayName = isAr
                            ? c.name_ar && c.name_ar !== c.name_en
                              ? `${c.name_ar} (${c.name_en})`
                              : c.name_ar || c.name_en
                            : c.name_en;
                          return (
                            <option
                              key={c.id}
                              value={c.name_en}
                              className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                            >
                              {displayName}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-[var(--color-text-muted)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-end pt-1 font-ui">
                      <span className="text-[var(--color-text-secondary)]">
                        {availableCities.length} {isAr ? "مدينة" : "cities"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
                        {isAr ? "العنوان أو الحي وتحديد الخريطة" : "Address & Map Location"}
                      </label>
                      <button
                        type="button"
                        onClick={handleLocateOnMap}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/20 border border-[var(--color-primary-light)]/30 transition-colors disabled:opacity-50"
                        title={isAr ? "تحديد موقعي الجغرافي عبر خرائط جوجل" : "Locate using Google Maps"}
                      >
                        {isLocating ? (
                          <>
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>{isAr ? "جاري التحديد..." : "Locating..."}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>{isAr ? "تحديد عبر خرائط جوجل" : "Locate on Google Maps"}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={
                          isAr
                            ? "شارع التحرير، الدقي، أو رابط خريطة جوجل"
                            : "Street address, building, or Google Maps URL"
                        }
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm text-[var(--color-text-primary)]"
                      />
                    </div>

                    {(locationUrl || locationStatus) && (
                      <div className="mt-2 p-2.5 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[11px] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[var(--color-text-secondary)] truncate">
                            {locationStatus || (isAr ? "تم إرفاق إحداثيات خرائط جوجل" : "Google Maps attached")}
                          </span>
                        </div>
                        {locationUrl && (
                          <a
                            href={locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary-light)] hover:underline shrink-0"
                          >
                            <span>{isAr ? "عرض على الخريطة" : "View Map"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {signupStep === 5 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 5: بيانات الاتصال والحساب" : "Step 5: Contact & Credentials"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "بيانات المالك وتسجيل الدخول" : "Owner Details & Password"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "البريد الإلكتروني للعمل" : "Business Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@store.com"
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "رقم الهاتف المحمول (مصر +20)" : "Mobile Phone (Egypt +20)"}
                    </label>
                    <div className="flex gap-2">
                      <div className="w-28 sm:w-32 shrink-0">
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          className="input-theme-gradient w-full px-2 py-2.5 rounded-[10px] text-xs font-bold bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] cursor-pointer"
                        >
                          {ARAB_COUNTRIES.map((c) => {
                            const isEgypt = c.dialCode === "+20";
                            return (
                              <option
                                key={c.id}
                                value={c.dialCode}
                                disabled={!isEgypt}
                                className={
                                  !isEgypt
                                    ? "text-gray-400 bg-[var(--color-surface)]"
                                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] font-bold"
                                }
                              >
                                {c.dialCode} ({isAr ? c.nameAr : c.name}) {!isEgypt ? (isAr ? "- قريباً" : "- Soon") : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                            setPhone(val);
                          }}
                          placeholder="01012345678"
                          dir="ltr"
                          className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
                        {isAr ? "كلمة المرور لحساب صاحب المتجر" : "Store Owner Password"}
                      </label>
                      <button
                        type="button"
                        onClick={generateStrongPassword}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary-light)] hover:underline"
                        title={isAr ? "توليد كلمة مرور قوية تلقائياً" : "Generate strong password automatically"}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isAr ? "توليد كلمة مرور قوية" : "Generate Password"}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder={isAr ? "أدخل كلمة مرور تتجاوز 10 خانات" : "Enter password exceeding 10 characters"}
                        dir="ltr"
                        className="input-theme-gradient w-full ps-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute end-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {passwordNotice && (
                      <div className="mt-1.5 p-2 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordNotice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {signupStep === 6 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    {isAr ? "الخطوة 6: المراجعة والإطلاق" : "Step 6: Review & launch"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "جاهز لإطلاق مساحة العمل" : "Review & launch"}
                  </h2>
                </div>

                <div className="p-4 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "نوع الباقة" : "Plan Type"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {modalPricingMode === "pos_only"
                        ? isAr
                          ? "نقاط بيع ولوحة تحكم فقط"
                          : "POS & Admin Only"
                        : isAr
                          ? "متجر موحد (كتالوج)"
                          : "Unified Store (Catalog)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">
                      {modalPricingMode === "pos_only"
                        ? isAr
                          ? "محطات الكاشير"
                          : "POS Terminals"
                        : isAr
                          ? "سعة المنتجات المتوقعة"
                          : "Expected Volume"}
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">{expectedVolume}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">
                      {isAr ? "دورة الفوترة والسعر" : "Billing & Price"}
                    </span>
                    <span className="font-bold text-[var(--color-primary-light)] font-ui">
                      {tierPrice} {activeCurrencySymbol} {isAr ? "/ شهرياً" : "/ mo"}{" "}
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                        (
                        {modalBilling === "yearly"
                          ? isAr
                            ? "فاتورة سنوية"
                            : "billed yearly"
                          : isAr
                            ? "فاتورة شهرية"
                            : "billed monthly"}
                        )
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "اسم المتجر" : "Store"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{storeName || "My Store"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "التصنيف" : "Category"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {CATEGORY_LABELS[category]?.[isAr ? "ar" : "en"] || category}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "الموقع" : "Location"}</span>
                    <div className="text-end">
                      <span className="font-medium text-[var(--color-text-primary)] block">
                        {city || (isAr ? "القاهرة" : "Cairo")},{" "}
                        {isAr ? activeCountryObj.nameAr : activeCountryObj.name}
                      </span>
                      {locationUrl && (
                        <a
                          href={locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary-light)] hover:underline mt-0.5"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{isAr ? "خريطة جوجل" : "Google Maps"}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              {signupStep > 1 ? (
                <button type="button" onClick={handleSignupBack} className="msm-back">
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isAr ? "السابق" : "Back"}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleSignupNext}
                disabled={!isSignupStepValid() || isLaunching}
                className="msm-next"
              >
                {isLaunching ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {signupStep === 6
                        ? isAr
                          ? "ادفع وأطلق مساحة عملك"
                          : "Pay & Launch your workspace"
                        : isAr
                          ? "المتابعة"
                          : "Continue"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isAr ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <button type="button" data-switch="signin" onClick={() => switchMode("signin")} className="msm-switch">
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Merchant signin - ONE STEP ONLY */}
        {screen === "auth" && selectedRole === "merchant" && mode === "signin" && !isSignupSuccess && (
          <div className="space-y-5">
            {signinForgotMode ? (
              /* Forgot password sub-view */
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    ACCOUNT RECOVERY
                  </span>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "إعادة تعيين كلمة المرور" : "Reset your password"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? "أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة وتعيين كلمة المرور."
                      : "Enter your registered store email to receive a password reset link."}
                  </p>
                </div>

                {resetError && (
                  <div className="p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)]">
                    {resetError}
                  </div>
                )}

                {!resetSent ? (
                  <form onSubmit={handleSendPasswordReset} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setResetError(null);
                        }}
                        placeholder="owner@store.com"
                        dir="ltr"
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSigninForgotMode(false);
                          setResetError(null);
                        }}
                        className="msm-back"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>{isAr ? "العودة" : "Back"}</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingReset || !identifier.includes("@")}
                        className="msm-next flex-1 py-3"
                      >
                        <span>
                          {isSendingReset
                            ? isAr
                              ? "جاري الإرسال..."
                              : "Sending..."
                            : isAr
                            ? "إرسال رابط الاستعادة"
                            : "Send reset link"}
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-light)]/40 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-light)] mx-auto" />
                    <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {isAr
                        ? `تم إرسال رابط إعادة التعيين بنجاح إلى ${identifier}. يرجى فحص بريدك الإلكتروني.`
                        : `Password reset link sent to ${identifier}. Please check your inbox.`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setSigninForgotMode(false);
                      }}
                      className="msm-switch text-xs"
                    >
                      {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Single Step Sign In Form */
              <form onSubmit={handleSingleStepSignIn} className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui text-[var(--color-text-muted)] tracking-wider font-bold block mb-1">
                    STORE OWNER ACCESS
                  </span>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "تسجيل الدخول إلى متاجر" : "Sign In to Matager"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? "تسجيل دخول صاحب المتجر إلى مساحة العمل."
                      : "Store Owner sign in to your store workspace."}
                  </p>
                </div>

                {signinError && (
                  <div className="p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)]">
                    {signinError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setSigninError(null);
                    }}
                    autoComplete="username"
                    placeholder="owner@store.com"
                    dir="ltr"
                    className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSigninForgotMode(true);
                        setSigninError(null);
                      }}
                      className="text-xs text-gradient-primary font-medium hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSigninError(null);
                      }}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      dir="ltr"
                      className="input-theme-gradient w-full ps-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary-dark)] cursor-pointer"
                    />
                    <span>{isAr ? "تذكر هذا الجهاز لمدة 30 يوماً" : "Remember device for 30 days"}</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSigningIn || !identifier.includes("@") || password.trim().length < 4}
                    className="msm-next w-full py-3"
                  >
                    <span>
                      {isSigningIn
                        ? isAr
                          ? "جاري الدخول..."
                          : "Signing in..."
                        : isAr
                        ? "تسجيل الدخول لمساحة العمل"
                        : "Sign In to Workspace"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}

            <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isAr ? "ليس لديك حساب متجر؟" : "Don't have a store account?"}{" "}
                <button
                  type="button"
                  data-switch="signup"
                  onClick={() => switchMode("signup")}
                  className="msm-switch"
                >
                  {isAr ? "إنشاء حساب" : "Create account"}
                </button>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};