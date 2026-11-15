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
import { signInWithEmailAndPassword } from "firebase/auth";
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
  {
    id: "tier_1",
    range: "5 - 20 products",
    rangeAr: "5 - 20 منتج",
    price: 170,
    mappedPlan: "starter",
  },
  {
    id: "tier_2",
    range: "20 - 50 products",
    rangeAr: "20 - 50 منتج",
    price: 270,
    mappedPlan: "starter",
  },
  {
    id: "tier_3",
    range: "50 - 100 products",
    rangeAr: "50 - 100 منتج",
    price: 570,
    mappedPlan: "pro",
  },
  {
    id: "tier_4",
    range: "100 - 300 products",
    rangeAr: "100 - 300 منتج",
    price: 970,
    mappedPlan: "pro",
  },
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

  // Screen 0: Role Chooser is bypassed for landing page per requirements (landing is strictly for Store Owners, Wholesaler CTA is for Wholesalers)
  const [screen, setScreen] = useState<"role_chooser" | "auth">("auth");
  const [selectedRole, setSelectedRole] = useState<"merchant" | "wholesaler">(
    initialRole === "wholesaler" ? "wholesaler" : "merchant"
  );
  const [roleError, setRoleError] = useState<string | null>(null);

  // Active flow: "signup" (6 steps, Store Owner only) or "signin" (4 steps)
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Smooth scroll controller & body lock
  const { stop: stopScroll, start: startScroll } = useSmoothScroll();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // ─── SIGN UP STATE (6 Steps - Starts with Volume & Pricing) ───
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Pricing configuration inside modal
  const [modalPricingMode, setModalPricingMode] = useState<"catalog" | "pos_only">("catalog");
  const [modalPosCount, setModalPosCount] = useState<number>(0);
  const [modalBilling, setModalBilling] = useState<"monthly" | "yearly">("monthly");

  // Step 1: Expected Volume & Pricing via 5-stop slider (0..4)
  const [activeSliderIndex, setActiveSliderIndex] = useState<number>(2);
  const [selectedVolumeTier, setSelectedVolumeTier] = useState<string>("tier_3");
  const [expectedVolume, setExpectedVolume] = useState<string>("50-100 products");
  const [tierPrice, setTierPrice] = useState<number>(570);
  const [salesChannel, setSalesChannel] = useState<"hybrid" | "online" | "pos">("hybrid");

  const modalSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingModalSliderRef = useRef<boolean>(false);

  const currentSelectedPlan: PlanDefinition = PRICING_PLANS[activeSliderIndex] || PRICING_PLANS[2];

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

  // Synchronize pre-checked plan from landing pricing calculator
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
        const price =
          billingCycle === "yearly" ? Math.round(plan.monthlyBasePrice * 0.9) : plan.monthlyBasePrice;
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

  // Step 2: Business details
  const [storeName, setStoreName] = useState("");
  const [legalName, setLegalName] = useState("");

  // Step 4: Category
  const [category, setCategory] = useState<StoreCategory>("clothing");

  // Step 5: Location & Currency (22 Arab Countries Only, default Egypt + EGP + Cairo)
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
            isAr
              ? `✓ تم تحديد إحداثيات موقعك بنجاح (${lat}, ${lng})`
              : `✓ Location detected (${lat}, ${lng})`
          );

          setAddress((prev) => {
            const clean = prev.trim();
            if (!clean) {
              return `${city || country} - ${gMapUrl}`;
            }
            if (clean.includes("google.com/maps")) {
              return clean;
            }
            return `${clean} - ${gMapUrl}`;
          });
        },
        (err) => {
          // Fallback to coordinates of the selected city from dataset
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
              if (!clean) {
                return `${city || country} - ${gMapUrl}`;
              }
              if (clean.includes("google.com/maps")) return clean;
              return `${clean} - ${gMapUrl}`;
            });
          } else {
            setLocationStatus(
              isAr
                ? "تعذر تحديد الإحداثيات آلياً. يرجى إدخال العنوان يدوياً."
                : "Unable to detect GPS. Please enter your address."
            );
          }
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    } else {
      const cityCoords = getCityCoordinates(country, city);
      if (cityCoords) {
        const gMapUrl = generateGoogleMapsUrl(cityCoords.lat, cityCoords.lng);
        setLocationUrl(gMapUrl);
        setLocationStatus(
          isAr
            ? `تم اعتماد إحداثيات مركز ${city || country} على خرائط جوجل`
            : `Using coordinates for ${city || country}`
        );
      }
      setIsLocating(false);
    }
  };

  const activeCountryObj =
    ARAB_COUNTRIES.find((c) => c.name === country || c.nameAr === country) || ARAB_COUNTRIES[0];
  const activeCurrencySymbol = isAr ? activeCountryObj.currencyAr : activeCountryObj.currency;

  // Step 6: Contact & Credentials
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+20");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [contactCode, setContactCode] = useState("");
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [contactVerifySent, setContactVerifySent] = useState(false);

  // Dynamic store slug helper for Step 2 hint (www.[storename].com)
  const formatStoreSlug = (name: string): string => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return "storename";
    const slug = trimmed
      .replace(/[^\w\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "storename";
  };

  // Strong password generator for Step 5:
  // Formula: "m" + half the email username + half phone number (last 5 digits) + symbol + "matager"
  const generateStrongPassword = () => {
    const emailUser = (email.split("@")[0] || "owner").replace(/[^a-zA-Z0-9]/g, "");
    const halfEmailLen = Math.max(2, Math.ceil(emailUser.length / 2));
    const emailPart = (emailUser.slice(0, halfEmailLen) || "adm").toLowerCase();

    const cleanPhoneDigits = phone.replace(/\D/g, "");
    const phonePart = cleanPhoneDigits.length >= 5 ? cleanPhoneDigits.slice(-5) : (cleanPhoneDigits || "12345");

    const symbol = "@";
    const generated = `m${emailPart}${phonePart}${symbol}matager`;

    setSignupPassword(generated);
    setShowSignupPassword(true);
    setPasswordNotice(
      isAr
        ? "✓ تم توليد كلمة مرور قوية وتطبيقها بنجاح!"
        : "✓ Strong password generated and applied!"
    );
    setTimeout(() => setPasswordNotice(null), 4000);
  };

  // Mapped plan tier for database schema compatibility
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro");

  // Step 7: Launching state
  const [isLaunching, setIsLaunching] = useState(false);

  // ─── SIGN IN STATE (S1 to S5) ───
  // S1 Identify -> S2 Verify (OTP) or S3 Password -> S3b Reset -> S4 Choose Store -> S5 Done
  const [signinStage, setSigninStage] = useState<
    "identify" | "verify" | "password" | "reset" | "choose_store" | "done"
  >("identify");
  const [identifier, setIdentifier] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("Apex Luxury Store");
  const [signinRole, setSigninRole] = useState<"owner" | "employee">(
    initialRole === "employee" ? "employee" : "owner"
  );
  const [rememberDevice, setRememberDevice] = useState(true);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync initialMode & initialRole on prop change
  useEffect(() => {
    setMode(initialMode);
    setSelectedRole(initialRole === "wholesaler" ? "wholesaler" : "merchant");
    setScreen("auth");
    resetAllFlows();
  }, [initialMode, initialRole]);

  // Lock body & smooth scroll while modal is opened
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

  // Capture trigger focus and handle Escape
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus modal on open
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  // Resend Countdown timer for OTP
  useEffect(() => {
    if (mode === "signin" && signinStage === "verify" && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, signinStage, resendCountdown]);

  // S5 Done auto-redirect after 1.5s to APP_ROUTES.dashboard
  useEffect(() => {
    if (mode === "signin" && signinStage === "done") {
      const redirectTimer = setTimeout(() => {
        window.location.href = APP_ROUTES.dashboard;
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [mode, signinStage]);

  const handleClose = () => {
    resetAllFlows();
    onClose();
  };

  const resetAllFlows = () => {
    setSignupStep(1);
    setSigninStage("identify");
    setOtpValues(["", "", "", "", "", ""]);
    setResendCountdown(30);
    setPassword("");
    setShowPassword(false);
    setSignupPassword("");
    setShowSignupPassword(false);
    setResetSent(false);
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

  // ─── STEP VALIDATION LOGIC (6 Steps) ───
  const isSignupStepValid = () => {
    switch (signupStep) {
      case 1:
        // Volume & Pricing step
        return modalPricingMode === "pos_only"
          ? modalPosCount >= 1
          : !!expectedVolume && tierPrice > 0;
      case 2:
        // Business details
        return storeName.trim().length > 0 && legalName.trim().length > 0;
      case 3:
        // Category
        return category.trim().length > 0;
      case 4:
        // Location & Currency (Egypt only active currently)
        return country.trim().length > 0 && city.trim().length > 0 && address.trim().length > 0;
      case 5:
        // Contact & Credentials
        // Egyptian phone number must be strictly 11 digits
        // Password must exceed 10 characters (>10)
        const cleanPhoneDigits = phone.replace(/\D/g, "");
        return (
          email.includes("@") &&
          email.includes(".") &&
          cleanPhoneDigits.length === 11 &&
          signupPassword.length > 10
        );
      case 6:
        // Review & Launch
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
      // Step 6: Launch & Setup in Firebase Cloud
      setIsLaunching(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("matager_user_role", "merchant");
      }

      const finalAddress =
        locationUrl && !address.includes("google.com/maps")
          ? `${address.trim()} (${locationUrl})`
          : address.trim();

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
        .then(({ store }) => {
          const sId = store?.id || `store_${Date.now()}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("matager_user_role", "merchant");
            localStorage.setItem("matager_current_store_id", sId);
            localStorage.setItem("matager_active_store_id", sId);
            localStorage.setItem("matager_active_store_name", storeName);

            // Redirect user directly to their dashboard: "it will redirect you to your dashboard and you are in"
            window.location.href = `/dashboard?storeId=${sId}`;
          }
          handleClose();
        })
        .catch((err) => {
          console.error("Firebase store setup error:", err);
          const fallbackStoreId = `store_${Date.now()}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("matager_user_role", "merchant");
            localStorage.setItem("matager_current_store_id", fallbackStoreId);
            localStorage.setItem("matager_active_store_id", fallbackStoreId);
            window.location.href = `/dashboard?storeId=${fallbackStoreId}`;
          }
          handleClose();
        });
    }
  };

  const handleSignupBack = () => {
    if (signupStep > 1) {
      setSignupStep((s) => (s - 1) as any);
    }
  };

  // Signin validation
  const isSigninIdentifyValid = () => {
    return identifier.trim().length >= 4;
  };

  const isOtpComplete = () => {
    return otpValues.every((digit) => digit.length === 1);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Handle single character or paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpValues];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setRoleError(null);
    if (
      identifier.toLowerCase().includes("wholesaler") ||
      identifier.toLowerCase().includes("nilegarments") ||
      identifier.toLowerCase().includes("delta-home")
    ) {
      setRoleError(t.auth.wholesalerSignup.wrongRoleError);
      return;
    }
    if (isOtpComplete()) {
      // Advance to choose store (S4)
      setSigninStage("choose_store");
    }
  };

  const handlePasswordSignIn = async () => {
    setRoleError(null);
    if (
      identifier.toLowerCase().includes("wholesaler") ||
      identifier.toLowerCase().includes("nilegarments") ||
      identifier.toLowerCase().includes("delta-home")
    ) {
      setRoleError(t.auth.wholesalerSignup.wrongRoleError);
      return;
    }
    // Attempt Firebase auth sign in if valid email
    if (identifier.includes("@") && password.trim().length >= 6) {
      try {
        const cred = await signInWithEmailAndPassword(auth, identifier.trim(), password);
        if (cred?.user?.uid) {
          const sId = `store_${cred.user.uid}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("matager_active_user_id", cred.user.uid);
            localStorage.setItem("matager_user_role", "merchant");
            localStorage.setItem("matager_current_store_id", sId);
            localStorage.setItem("matager_active_store_id", sId);
          }
        }
      } catch (err) {
        console.warn("Firebase sign in fallback:", err);
      }
    }
    if (password.trim().length >= 4) {
      setSigninStage("choose_store");
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
    const wid = identifier.toLowerCase().includes("home")
      ? "wholesaler_home_01"
      : "wholesaler_clothing_01";
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_user_role", "wholesaler");
      localStorage.setItem("matager_wholesaler_id", wid);
    }
    handleClose();
    window.location.href = `/wholesaler?wholesalerId=${wid}`;
  };

  const handleChooseStoreContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_user_role", "merchant");
    }
    setSigninStage("done");
  };

  // Compute Active Dots Position for Sign-In
  const getSigninActiveDot = () => {
    switch (signinStage) {
      case "identify":
        return 1;
      case "verify":
      case "password":
      case "reset":
        return 2;
      case "choose_store":
        return 3;
      case "done":
        return 4;
      default:
        return 1;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      {/* Frosted Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Main Dialog Modal Panel */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[500px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] p-6 sm:p-7 shadow-2xl text-[var(--color-text-primary)] z-10 overflow-hidden my-auto outline-none"
        style={{
          boxShadow:
            "0 30px 70px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px var(--color-border-subtle)",
        }}
      >
        {/* Atmospheric Radial Wash */}
        <div
          className="absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-80 h-36 pointer-events-none blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(4, 121, 232, 0.45) 0%, rgba(0, 131, 254, 0.2) 60%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Modal Header: Brand, Close Button & Non-Clickable Progress Dots */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-3">
              <MatagerLogo size="sm" showWordmark={true} animated={false} />
            </div>

            {/* Non-Clickable Progress Dots (6 dots for sign up, 4 dots for sign in) */}
            {screen === "auth" && selectedRole === "merchant" && (
              <div
                className="flex items-center gap-1.5"
                aria-label={
                  mode === "signup"
                    ? `Step ${signupStep} of 6`
                    : `Step ${getSigninActiveDot()} of 4`
                }
              >
                {mode === "signup"
                  ? [1, 2, 3, 4, 5, 6].map((dot) => (
                    <span
                      key={dot}
                      className={`msm-dot ${dot === signupStep
                        ? "is-active"
                        : dot < signupStep
                          ? "is-passed"
                          : ""
                        }`}
                    />
                  ))
                  : [1, 2, 3, 4].map((dot) => (
                    <span
                      key={dot}
                      className={`msm-dot ${dot === getSigninActiveDot()
                        ? "is-active"
                        : dot < getSigninActiveDot()
                          ? "is-passed"
                          : ""
                        }`}
                    />
                  ))}
              </div>
            )}

            {/* Close Button */}
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

        {/* Global Role Mismatch Warning Toast */}
        {roleError && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)] flex items-center gap-2">
            <StatusPill variant="danger">Access Refused</StatusPill>
            <span>{roleError}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 0: ROLE CHOOSER (Store Owner vs Wholesaler)
            ══════════════════════════════════════════════════════════════════ */}
        {screen === "role_chooser" && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                MATAGER ACCESS
              </span>
              <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                {t.auth.roleChooser.title}
              </h2>
              <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                {t.auth.roleChooser.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Merchant Option Card */}
              <div
                onClick={() => setSelectedRole("merchant")}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between ${selectedRole === "merchant"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
                  }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary)]">
                      <Store className="w-5 h-5" />
                    </div>
                    {selectedRole === "merchant" && (
                      <StatusPill variant="info">
                        {t.auth.roleChooser.selected}
                      </StatusPill>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                      {t.auth.roleChooser.merchantCard.title}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                      {t.auth.roleChooser.merchantCard.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wholesaler Option Card */}
              <div
                onClick={() => setSelectedRole("wholesaler")}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between ${selectedRole === "wholesaler"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
                  }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary)]">
                      <Layers className="w-5 h-5" />
                    </div>
                    {selectedRole === "wholesaler" && (
                      <StatusPill variant="info">
                        {t.auth.roleChooser.selected}
                      </StatusPill>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
                      {t.auth.roleChooser.wholesalerCard.title}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                      {t.auth.roleChooser.wholesalerCard.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setScreen("auth")}
                className="msm-next w-full py-3"
              >
                <span>{t.auth.roleChooser.continue}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 1: WHOLESALER FLOWS (Sign Up Wizard / Sign In Portal)
            ══════════════════════════════════════════════════════════════════ */}
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
                    <button
                      type="button"
                      data-switch="signin"
                      onClick={() => switchMode("signin")}
                      className="msm-switch"
                    >
                      {t.auth.wholesalerSignup.signinTab}
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
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
                    <button
                      type="button"
                      data-switch="signup"
                      onClick={() => switchMode("signup")}
                      className="msm-switch"
                    >
                      {t.auth.wholesalerSignup.signupTab}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 2: MERCHANT FLOWS (Flow A: Sign Up & Flow B: Sign In)
            ══════════════════════════════════════════════════════════════════ */}
        {screen === "auth" && selectedRole === "merchant" && mode === "signup" && (
          <div className="space-y-5">
            {/* ─── STEP 1: Plan & Volume Pricing ─── */}
            {signupStep === 1 && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 1: تحديد الباقة والأسعار" : "Step 1: Plan & Volume Pricing"}
                  </span>
                  <h2 className="font-heading text-lg sm:text-xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "كم عدد المنتجات المتوقع عرضها شهرياً؟" : "How many products do you expect to showcase?"}
                  </h2>
                </div>

                {/* Mode Selector & Billing Toggle Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-1.5 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                  {/* Mode: Unified Store vs POS Only */}
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs">
                    <button
                      type="button"
                      onClick={() => handleModalPricingModeChange("catalog")}
                      className={`px-3 py-1.5 rounded-[6px] font-semibold text-center transition-all ${modalPricingMode === "catalog"
                        ? "bg-[var(--color-primary-light)] text-white shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                      {isAr ? "متجر موحد (كتالوج)" : "Unified Store (Catalog)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalPricingModeChange("pos_only")}
                      className={`px-3 py-1.5 rounded-[6px] font-semibold text-center transition-all ${modalPricingMode === "pos_only"
                        ? "bg-[var(--color-primary-light)] text-white shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                      {isAr ? "نقاط بيع فقط (POS)" : "POS & Admin Only"}
                    </button>
                  </div>

                  {/* Billing Switch: Monthly vs Yearly */}
                  <div className="inline-flex items-center justify-center gap-1 p-1 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs">
                    <button
                      type="button"
                      onClick={() => handleModalBillingChange("monthly")}
                      className={`px-2.5 py-1 rounded-[6px] transition-all font-medium ${modalBilling === "monthly"
                        ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                    >
                      {isAr ? "شهري" : "Monthly"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalBillingChange("yearly")}
                      className={`px-2.5 py-1 rounded-[6px] transition-all font-medium flex items-center gap-1 ${modalBilling === "yearly"
                        ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        }`}
                    >
                      <span>{isAr ? "سنوي" : "Yearly"}</span>
                      <span className="text-[10px] font-bold text-emerald-500">-10%</span>
                    </button>
                  </div>
                </div>

                {/* Content: Catalog Mode (Slider + Single Selected Plan Card + Enterprise Callout) */}
                {modalPricingMode === "catalog" && (
                  <div className="space-y-3">
                    {/* ─── 5-STOP DRAGGABLE / CLICKABLE SLIDER ─── */}
                    <div className="p-3 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] font-ui">
                        <span>{isAr ? "اختر نطاق المنتجات:" : "Select product volume range:"}</span>
                        <span className="text-[var(--color-primary-light)] font-bold">
                          {isAr ? currentSelectedPlan.rangeAr : currentSelectedPlan.range} {isAr ? "منتج" : "products"}
                        </span>
                      </div>

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
                        {/* Rail */}
                        <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)]" />

                        {/* Active Track */}
                        <div
                          className="absolute h-2 rounded-full bg-[var(--color-primary-light)]"
                          style={{
                            [isAr ? "right" : "left"]: 0,
                            width: `${(activeSliderIndex / (PRICING_PLANS.length - 1)) * 100}%`,
                          }}
                        />

                        {/* 5 Stops Points */}
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

                        {/* Draggable Thumb */}
                        <div
                          className="absolute w-5 h-5 rounded-full bg-white dark:bg-zinc-100 border-2 border-[var(--color-primary-light)] shadow-md top-1/2 -translate-y-1/2 pointer-events-none transition-transform active:scale-110"
                          style={{
                            [isAr ? "right" : "left"]: `calc(${(activeSliderIndex / (PRICING_PLANS.length - 1)) * 100}% - 10px)`,
                          }}
                        />
                      </div>

                      {/* Stop Labels under rail */}
                      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
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

                    {/* ─── ONLY ONE PLAN CARD (Matches user slider selection) ─── */}
                    <div className="p-3.5 rounded-[12px] bg-[var(--color-surface)] border-2 border-[var(--color-primary-light)]/50 shadow-sm space-y-2.5 relative overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                              {isAr ? currentSelectedPlan.nameAr : currentSelectedPlan.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-primary-light)]/15 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/30">
                              {isAr ? `${currentSelectedPlan.rangeAr} منتج` : `${currentSelectedPlan.range} products`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
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
                              {isAr ? "مشمول خصم 10% السنوي" : "Includes 10% yearly discount"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Best Deal Banner if tier_5 */}
                      {currentSelectedPlan.id === "tier_5" && (
                        <div className="px-2.5 py-1 rounded-[8px] text-[11px] font-semibold flex items-center gap-1.5">
                          <span>
                            {isAr
                              ? "أفضل قيمة: يتضمن نقطتي بيع كاشير (2 POS Terminals) مجاناً بالكامل!"
                              : "Includes 2 POS Cashier Terminals 100% Free!"}
                          </span>
                        </div>
                      )}

                      {/* Capabilities Checkmarks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)]">
                        {(isAr ? currentSelectedPlan.capabilitiesAr : currentSelectedPlan.capabilities)
                          .slice(0, 4)
                          .map((cap, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{cap}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Enterprise Callout: Need more than 550 products? */}
                    <div className="p-2.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-dashed border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-[var(--color-text-primary)] text-[11px] sm:text-xs">
                          {isAr ? "هل تحتاج لعرض أكثر من 550 منتج؟" : "Need more than 550 products?"}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                          {isAr
                            ? "تواصل مع مهندسينا لحلول المؤسسات الكبرى والسعات غير المحدودة"
                            : "Contact our enterprise engineers for custom catalogs & scale"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onOpenEnterpriseContact?.();
                        }}
                        className="px-3 py-1.5 rounded-[8px] bg-[var(--color-primary-light)] text-white font-semibold text-[11px] hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 shadow-sm"
                      >
                        <span>{isAr ? "تواصل معنا" : "Contact Us"}</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content: POS & Admin Only Mode */}
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

                      {/* Stepper */}
                      <div className="inline-flex items-center gap-2 p-1 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={() => handleModalPosCountChange(-1)}
                          disabled={modalPosCount <= 1}
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 border border-[var(--color-border-subtle)] transition-colors"
                          aria-label="Decrease POS count"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-sm w-7 text-center text-[var(--color-text-primary)]">
                          {modalPosCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleModalPosCountChange(1)}
                          disabled={modalPosCount >= 20}
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 border border-[var(--color-border-subtle)] transition-colors"
                          aria-label="Increase POS count"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Calculated Price Box */}
                    <div className="p-3 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-light)]/20 flex items-center justify-between">
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
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{isAr ? "لوحة تحكم إدارية سحابية كاملة ومجانية" : "Full cloud admin management dashboard included"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{isAr ? "مزامنة سريعة مع طباعة فواتير حرارية" : "High-speed sync & thermal receipts printing"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2: Business details ─── */}
            {signupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
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
                    {/* Dynamic Store Name URL Hint */}
                    <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-primary-light)] font-bold">🌐</span>
                      <span className="text-[var(--color-text-muted)]">{isAr ? "رابط المتجر المقترح:" : "Suggested store URL:"}</span>
                      <span className="font-semibold text-[var(--color-primary-light)]" dir="ltr">
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

            {/* ─── STEP 3: Category ─── */}
            {signupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 3: التصنيف" : "Step 3: Category"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "اختر المجال الرئيسي لمتجرك" : "Select your primary category"}
                  </h2>
                </div>

                <div className="max-h-[260px] overflow-y-auto pe-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

            {/* ─── STEP 4: Location ─── */}
            {signupStep === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 4: الموقع الجغرافي" : "Step 4: Location"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "أين يقع متجرك الرئيسي؟" : "Where is your store located?"}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {isAr
                      ? "اختر الدولة والمدينة بدقة من القائمة المعتمدة لضبط العملة والتوصيل، واستخدم خرائط جوجل لتحديد موقعك."
                      : "Select your country and city from verified lists to configure currency and delivery, and link your Google Maps pin."}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Country Selection (Egypt active currently, others Coming Soon) */}
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
                    {/* Notice that other Arab countries are coming soon */}
                    <div className="mt-1.5 p-2 rounded-[8px] bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isAr
                          ? "الخدمة متاحة حالياً في جمهورية مصر العربية فقط، وباقي الدول العربية ستتاح قريباً."
                          : "Service is currently available in Egypt only. Other Arab countries are coming soon."}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between pt-1 font-ui">
                      <span>{isAr ? "العملة الافتراضية للنظام:" : "Default system currency:"}</span>
                      <span className="font-bold text-[var(--color-primary-light)]">
                        {activeCountryObj.currency} ({activeCountryObj.currencyAr}) • {isAr ? activeCountryObj.currencyNameAr : activeCountryObj.currencyNameEn}
                      </span>
                    </div>
                  </div>

                  {/* Strict City Selection */}
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
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between pt-1 font-ui">
                      <span>{isAr ? "المدن المتوفرة لهذه الدولة:" : "Available cities for this country:"}</span>
                      <span className="font-mono text-[var(--color-text-secondary)]">
                        {availableCities.length} {isAr ? "مدينة" : "cities"}
                      </span>
                    </div>
                  </div>

                  {/* Address & Google Maps Geolocation */}
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

                    {/* Location Status / Google Maps Pin URL Display */}
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

            {/* ─── STEP 5: Contact & Credentials ─── */}
            {signupStep === 5 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
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
                          className="input-theme-gradient w-full px-2 py-2.5 rounded-[10px] text-xs font-mono font-bold bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] cursor-pointer"
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
                    {/* Egyptian Phone 11-digit Validation */}
                    <div className="flex items-center justify-between text-[11px] mt-1 font-ui">
                      <span
                        className={
                          phone.replace(/\D/g, "").length === 11
                            ? "text-emerald-500 font-medium"
                            : "text-[var(--color-text-muted)]"
                        }
                      >
                        {phone.replace(/\D/g, "").length === 11
                          ? isAr
                            ? "✓ رقم هاتف مصري صحيح (11 رقماً)"
                            : "✓ Valid Egyptian phone (11 digits)"
                          : isAr
                            ? "يجب أن يتكون رقم الهاتف من 11 رقماً (مثال: 01012345678)"
                            : "Must be exactly 11 digits starting with 01"}
                      </span>
                      <span
                        className={`font-mono text-xs ${phone.replace(/\D/g, "").length === 11
                          ? "text-emerald-500 font-bold"
                          : "text-[var(--color-text-muted)]"
                          }`}
                      >
                        {phone.replace(/\D/g, "").length}/11
                      </span>
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
                        <span>{isAr ? "✨ توليد كلمة مرور قوية" : "✨ Generate Password"}</span>
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

                    {/* Real-time Password validation: must exceed 10 chars */}
                    <div className="flex items-center justify-between text-[11px] mt-1 font-ui">
                      <span
                        className={
                          signupPassword.length > 10
                            ? "text-emerald-500 font-medium"
                            : "text-amber-500 font-medium"
                        }
                      >
                        {signupPassword.length > 10
                          ? isAr
                            ? "✓ كلمة المرور مقبولة وتتجاوز 10 خانات"
                            : "✓ Password exceeds 10 characters"
                          : isAr
                            ? "كلمة المرور يجب أن تزيد عن 10 خانات"
                            : "Password must exceed 10 characters"}
                      </span>
                      <span
                        className={`font-mono text-xs ${signupPassword.length > 10
                          ? "text-emerald-500 font-bold"
                          : "text-amber-500 font-semibold"
                          }`}
                      >
                        {signupPassword.length} {isAr ? "حرف" : "chars"} {signupPassword.length <= 10 && "(>10)"}
                      </span>
                    </div>

                    {/* Notice when generated */}
                    {passwordNotice && (
                      <div className="mt-1.5 p-2 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Verification Snippet */}
                  <div className="pt-2">
                    {!contactVerifySent ? (
                      <button
                        type="button"
                        onClick={() => setContactVerifySent(true)}
                        disabled={!email.includes("@") || phone.trim().length < 7}
                        className="w-full py-2 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 transition-colors"
                      >
                        {isAr ? "إرسال رمز التحقق للاتصال" : "Send contact verification"}
                      </button>
                    ) : (
                      <div className="p-3 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-light)]/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--color-text-secondary)]">
                            {isAr ? "أدخل رمز التحقق (اختباري: 123456)" : "Enter verification code (Demo: 123456)"}
                          </span>
                          <span className="text-[var(--color-primary-light)] font-ui font-bold">
                            {isContactVerified ? "✓ Verified" : "Sent"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={contactCode}
                            onChange={(e) => {
                              setContactCode(e.target.value);
                              if (e.target.value.length >= 4) {
                                setIsContactVerified(true);
                              }
                            }}
                            placeholder="123456"
                            className="input-theme-gradient flex-1 px-3 py-1.5 rounded-[6px] text-xs font-ui text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setIsContactVerified(true)}
                            className="px-3 py-1.5 rounded-[6px] bg-[var(--color-primary-light)] text-white text-xs font-semibold"
                          >
                            {isAr ? "تحقق" : "Verify"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 6: Review & launch ─── */}
            {signupStep === 6 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 6: المراجعة والإطلاق" : "Step 6: Review & launch"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "جاهز لإطلاق مساحة العمل" : "Review & launch"}
                  </h2>
                </div>

                <div className="p-4 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
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
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">
                      {modalPricingMode === "pos_only"
                        ? isAr
                          ? "محطات الكاشير"
                          : "POS Terminals"
                        : isAr
                          ? "سعة المنتجات المتوقعة"
                          : "Expected Volume"}
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {expectedVolume}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "دورة الفوترة والسعر" : "Billing & Price"}</span>
                    <span className="font-bold text-[var(--color-primary-light)] font-ui">
                      {tierPrice} {activeCurrencySymbol} {isAr ? "/ شهرياً" : "/ mo"}{" "}
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                        ({modalBilling === "yearly" ? (isAr ? "فاتورة سنوية" : "billed yearly") : (isAr ? "فاتورة شهرية" : "billed monthly")})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "اسم المتجر" : "Store"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{storeName || "My Store"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "التصنيف" : "Category"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{CATEGORY_LABELS[category]?.[isAr ? "ar" : "en"] || category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "الموقع" : "Location"}</span>
                    <div className="text-end">
                      <span className="font-medium text-[var(--color-text-primary)] block">
                        {city || (isAr ? "القاهرة" : "Cairo")}, {isAr ? activeCountryObj.nameAr : activeCountryObj.name}
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

                {/* Pay & Launch Instant Redirect Callout */}
                <div className="p-3.5 rounded-[12px] bg-gradient-to-r from-emerald-500/10 via-[var(--color-primary-light)]/10 to-blue-500/10 border border-emerald-500/30 text-xs text-[var(--color-text-primary)] space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <Rocket className="w-4 h-4 shrink-0" />
                    <span>{isAr ? "تنبيه الإطلاق والدخول المباشر:" : "Launch & Instant Redirect Notice:"}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                    {isAr
                      ? "ملاحظة: بعد الدفع والضغط على زر 'ادفع وأطلق مساحة عملك'، سيتم تحويلك مباشرة وتلقائياً إلى لوحة التحكم الخاصة بك وتكون داخل مساحة عملك."
                      : "Note: After you pay and click on 'Pay & Launch your workspace', it will redirect you to your dashboard and you are in."}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Actions for Sign Up (Back / Next) */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              {signupStep > 1 ? (
                <button
                  type="button"
                  onClick={handleSignupBack}
                  className="msm-back"
                >
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

            {/* Footer Flow Switcher (.msm-switch flips to Sign In) */}
            <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isAr ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <button
                  type="button"
                  data-switch="signin"
                  onClick={() => switchMode("signin")}
                  className="msm-switch"
                >
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FLOW B: SIGN IN (Store Owner OR Staff/Cashier — 4 Dots)
            ══════════════════════════════════════════════════════════════════ */}
        {screen === "auth" && selectedRole === "merchant" && mode === "signin" && (
          <div className="space-y-5">
            {/* ─── S1. IDENTIFY & AUTH (Store Owner Clean Portal) ─── */}
            {signinStage === "identify" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    STORE OWNER ACCESS
                  </span>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "تسجيل الدخول إلى متاجر" : "Sign In to Matager"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "تسجيل دخول صاحب المتجر إلى مساحة العمل." : "Store Owner sign in to your store workspace."}
                  </p>
                </div>

                {/* Field 1: Email or Phone (2-Color Gradient Input) */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {isAr ? "البريد الإلكتروني أو الهاتف" : "Email or Phone"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      placeholder={isAr ? "owner@store.com أو رقم الهاتف" : "owner@store.com"}
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute end-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Field 2: Password (2-Color Gradient Input) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSigninStage("reset")}
                      className="text-xs text-gradient-primary font-medium hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Remember device checkbox & OTP alternative */}
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
                  <button
                    type="button"
                    onClick={() => setSigninStage("verify")}
                    className="text-xs text-gradient-primary font-medium hover:underline"
                  >
                    {isAr ? "رمز التحقق OTP" : "Use OTP instead"}
                  </button>
                </div>

                {/* Primary Button: Sign In to Workspace (UNTOUCHED Primary Button Style) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (password.trim().length >= 4) {
                        handlePasswordSignIn();
                      } else {
                        setSigninStage("verify");
                      }
                    }}
                    disabled={!isSigninIdentifyValid()}
                    className="msm-next w-full py-3"
                  >
                    <span>{isAr ? "تسجيل الدخول لمساحة العمل" : "Sign In to Workspace"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S2. VERIFY (OTP) ─── */}
            {signinStage === "verify" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "أدخل رمز التحقق" : "Enter your code"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${identifier}.`
                      : `We sent a 6-digit code to ${identifier}.`}
                  </p>
                </div>

                {/* 6 Digit Inputs (2-Color Gradient) */}
                <div className="flex items-center justify-between gap-2 py-2" dir="ltr">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="input-theme-gradient w-11 h-12 text-center text-lg font-bold font-ui rounded-[10px] transition-all"
                    />
                  ))}
                </div>

                {/* Resend & Password fallback */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={resendCountdown > 0}
                    onClick={() => setResendCountdown(30)}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                  >
                    {resendCountdown > 0
                      ? isAr
                        ? `إعادة الإرسال بعد (${resendCountdown}ث)`
                        : `Resend code (${resendCountdown}s)`
                      : isAr
                        ? "إعادة إرسال الرمز"
                        : "Resend code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="text-gradient-primary hover:underline font-medium"
                  >
                    {isAr ? "استخدام كلمة المرور بدلاً من ذلك" : "Use password instead"}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="msm-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!isOtpComplete()}
                    className="msm-next flex-1 py-3"
                  >
                    <span>{isAr ? "تحقق" : "Verify"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S3. PASSWORD FALLBACK ─── */}
            {signinStage === "password" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "مرحباً بعودتك" : "Welcome back"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "تسجيل الدخول إلى متجرك." : "Sign in to your store."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSigninStage("reset")}
                      className="text-xs text-gradient-primary hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="msm-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordSignIn}
                    disabled={password.trim().length < 4}
                    className="msm-next flex-1 py-3"
                  >
                    <span>{isAr ? "تسجيل الدخول" : "Sign in"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S3b. RESET PASSWORD BRANCH ─── */}
            {signinStage === "reset" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "إعادة تعيين كلمة المرور" : "Reset your password"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? "أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة."
                      : "Enter your email to receive recovery instructions."}
                  </p>
                </div>

                {!resetSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="owner@store.com"
                        dir="ltr"
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSigninStage("identify")}
                        className="msm-back"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>{isAr ? "السابق" : "Back"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetSent(true)}
                        disabled={!identifier.includes("@")}
                        className="msm-next flex-1 py-3"
                      >
                        <span>{isAr ? "إرسال رابط الاستعادة" : "Send reset link"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-light)]/40 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-light)] mx-auto" />
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {isAr
                        ? `تم إرسال تعليمات إعادة التعيين إلى ${identifier}.`
                        : `Password reset instructions sent to ${identifier}.`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setSigninStage("identify");
                      }}
                      className="msm-switch text-xs"
                    >
                      {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── S4. CHOOSE STORE ─── */}
            {signinStage === "choose_store" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "اختر المتجر" : "Choose store"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "حدد المتجر الذي ترغب بإدارته." : "Select your active store workspace."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: "Apex Luxury Store", role: isAr ? "صاحب المتجر (Owner)" : "Store Owner" },
                    { name: "Riyadh Central Flagship", role: isAr ? "صاحب المتجر (Owner)" : "Store Owner" },
                    { name: "Cairo Nile Boutique", role: isAr ? "صاحب المتجر (Owner)" : "Store Owner" },
                  ].map((st) => (
                    <div
                      key={st.name}
                      onClick={() => setSelectedStore(st.name)}
                      className={`msm-opt ${selectedStore === st.name ? "is-selected" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)]">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {st.name}
                          </div>
                          <div className="msm-sub text-xs text-[var(--color-text-secondary)]">
                            {st.role}
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selectedStore === st.name ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                        {selectedStore === st.name && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleChooseStoreContinue}
                    className="msm-next w-full py-3"
                  >
                    <span>{isAr ? "المتابعة" : "Continue"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S5. DONE ─── */}
            {signinStage === "done" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary-dark)]/20 border border-[var(--color-primary-light)]/40 flex items-center justify-center text-[var(--color-primary-light)] mx-auto shadow-lg shadow-[var(--color-primary-dark)]/20 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "تم تسجيل دخولك بنجاح" : "You're signed in"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? `جاري توجيهك إلى ${selectedStore}...`
                      : `Taking you to ${selectedStore}.`}
                  </p>
                </div>

                <div className="pt-3">
                  <a
                    href={APP_ROUTES.dashboard}
                    className="btn-primary-pill text-xs py-2.5 px-6 inline-flex"
                  >
                    <span>{isAr ? "الانتقال إلى لوحة التحكم" : "Go to dashboard"}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Footer Flow Switcher (.msm-switch flips to Sign Up) */}
            {signinStage !== "done" && (
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
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
