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

  // Step 1: Expected Volume & Pricing
  const [selectedVolumeTier, setSelectedVolumeTier] = useState<string>("tier_3");
  const [expectedVolume, setExpectedVolume] = useState<string>("50 - 100 products");
  const [tierPrice, setTierPrice] = useState<number>(570);
  const [salesChannel, setSalesChannel] = useState<"hybrid" | "online" | "pos">("hybrid");

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
        const price = billingCycle === "yearly" ? Math.round(count * 200 * 0.9) : count * 200;
        setTierPrice(price);
        setExpectedVolume(`${count} POS Cashier Terminals`);
        setSelectedPlan("starter");
      } else {
        setModalPricingMode("catalog");
        const planId = initialPlanOptions.planId || "tier_3";
        setSelectedVolumeTier(planId);
        const found =
          VOLUME_PRICING_OPTIONS.find((p) => p.id === planId) || VOLUME_PRICING_OPTIONS[2];
        setExpectedVolume(found.range);
        const billingCycle = initialPlanOptions.billing || "monthly";
        setModalBilling(billingCycle);
        const price =
          billingCycle === "yearly" ? Math.round(found.price * 0.9) : found.price;
        setTierPrice(price);
        setSelectedPlan(found.mappedPlan);
        const pos = initialPlanOptions.posCount || 0;
        setModalPosCount(pos);
        setSalesChannel(pos > 0 || planId === "tier_5" ? "hybrid" : "online");
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
      const price = isYearly ? Math.round(count * 200 * 0.9) : count * 200;
      setTierPrice(price);
      setExpectedVolume(`${count} POS Cashier Terminals`);
      setSelectedPlan("starter");
    } else {
      const found =
        VOLUME_PRICING_OPTIONS.find((p) => p.id === selectedVolumeTier) || VOLUME_PRICING_OPTIONS[2];
      const isYearly = modalBilling === "yearly";
      const price = isYearly ? Math.round(found.price * 0.9) : found.price;
      setTierPrice(price);
      setExpectedVolume(found.range);
      setSelectedPlan(found.mappedPlan);
      setSalesChannel(modalPosCount > 0 || found.id === "tier_5" ? "hybrid" : "online");
    }
  };

  const handleModalBillingChange = (billing: "monthly" | "yearly") => {
    setModalBilling(billing);
    const isYearly = billing === "yearly";
    if (modalPricingMode === "pos_only") {
      const price = isYearly ? Math.round(modalPosCount * 200 * 0.9) : modalPosCount * 200;
      setTierPrice(price);
    } else {
      const found =
        VOLUME_PRICING_OPTIONS.find((p) => p.id === selectedVolumeTier) || VOLUME_PRICING_OPTIONS[2];
      const price = isYearly ? Math.round(found.price * 0.9) : found.price;
      setTierPrice(price);
    }
  };

  const handleModalPosCountChange = (delta: number) => {
    const next = Math.max(1, Math.min(20, modalPosCount + delta));
    setModalPosCount(next);
    const isYearly = modalBilling === "yearly";
    const price = isYearly ? Math.round(next * 200 * 0.9) : next * 200;
    setTierPrice(price);
    setExpectedVolume(`${next} POS Cashier Terminals`);
  };

  const handleModalTierSelect = (tier: (typeof VOLUME_PRICING_OPTIONS)[number]) => {
    setSelectedVolumeTier(tier.id);
    setExpectedVolume(tier.range);
    const isYearly = modalBilling === "yearly";
    const price = isYearly ? Math.round(tier.price * 0.9) : tier.price;
    setTierPrice(price);
    setSelectedPlan(tier.mappedPlan);
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
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [contactCode, setContactCode] = useState("");
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [contactVerifySent, setContactVerifySent] = useState(false);

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
    if (!initialPlanOptions) {
      setModalPricingMode("catalog");
      setSelectedVolumeTier("tier_3");
      setExpectedVolume("50 - 100 products");
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
        // Location & Currency
        return country.trim().length > 0 && city.trim().length > 0 && address.trim().length > 0;
      case 5:
        // Contact & Credentials
        return email.includes("@") && phone.trim().length >= 7;
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
        phone,
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

            // Automatically open two new tabs in the browser:
            // Tab 1: Storefront URL (/storefront?storeId=${storeId})
            // Tab 2: Dashboard URL (/dashboard?storeId=${storeId})
            window.open(`/storefront?storeId=${sId}`, "_blank");
            window.open(`/dashboard?storeId=${sId}`, "_blank");
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
            window.open(`/storefront?storeId=${fallbackStoreId}`, "_blank");
            window.open(`/dashboard?storeId=${fallbackStoreId}`, "_blank");
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
                      className={`px-3 py-1.5 rounded-[6px] font-semibold text-center transition-all ${
                        modalPricingMode === "catalog"
                          ? "bg-[var(--color-primary-light)] text-white shadow-sm"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {isAr ? "متجر موحد (كتالوج)" : "Unified Store (Catalog)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalPricingModeChange("pos_only")}
                      className={`px-3 py-1.5 rounded-[6px] font-semibold text-center transition-all ${
                        modalPricingMode === "pos_only"
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
                      className={`px-2.5 py-1 rounded-[6px] transition-all font-medium ${
                        modalBilling === "monthly"
                          ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {isAr ? "شهري" : "Monthly"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModalBillingChange("yearly")}
                      className={`px-2.5 py-1 rounded-[6px] transition-all font-medium flex items-center gap-1 ${
                        modalBilling === "yearly"
                          ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <span>{isAr ? "سنوي" : "Yearly"}</span>
                      <span className="text-[10px] font-bold text-emerald-500">-10%</span>
                    </button>
                  </div>
                </div>

                {/* Content: Catalog Mode (5 tiers + Enterprise Callout) */}
                {modalPricingMode === "catalog" && (
                  <div className="space-y-2">
                    <div className="max-h-[220px] overflow-y-auto space-y-1.5 pe-1">
                      {VOLUME_PRICING_OPTIONS.map((tier) => {
                        const isSelected = selectedVolumeTier === tier.id;
                        const displayPrice =
                          modalBilling === "yearly" ? Math.round(tier.price * 0.9) : tier.price;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => handleModalTierSelect(tier)}
                            className={`msm-opt transition-all py-2 px-3 rounded-[10px] border cursor-pointer ${
                              isSelected ? "is-selected" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2.5 w-full">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`p-1.5 rounded-[6px] shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-[var(--color-primary-dark)]/20 text-[var(--color-primary-light)]"
                                      : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                                  }`}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                      {isAr ? tier.rangeAr : tier.range}
                                    </span>
                                    {tier.dealBadge && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold font-ui bg-[var(--color-primary-dark)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/40 shadow-sm animate-pulse">
                                        ★ {isAr ? tier.dealBadgeAr : tier.dealBadge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="msm-sub text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                                    {tier.id === "tier_5"
                                      ? isAr
                                        ? "يشمل واجهة متجر + 2 كاشير POS مجاناً"
                                        : "Includes storefront + 2 free POS registers"
                                      : isAr
                                        ? "متجر موحد مع مزامنة سحابية"
                                        : "Unified storefront with cloud inventory"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                <div className="text-right rtl:text-left">
                                  <span className="text-sm sm:text-base font-bold font-ui text-[var(--color-primary-light)]">
                                    {displayPrice}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-text-muted)] ms-1">
                                    {activeCurrencySymbol} / {isAr ? "شهر" : "mo"}
                                  </span>
                                </div>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40"
                                      : "border-[var(--color-border)]"
                                  }`}
                                >
                                  {isSelected && <Check className="w-2 h-2 text-white stroke-[3]" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STORE_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`msm-opt text-xs py-2.5 px-3 ${category === cat ? "is-selected" : ""}`}
                    >
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {CATEGORY_LABELS[cat][isAr ? "ar" : "en"]}
                      </span>
                      {category === cat && (
                        <Check className="w-3.5 h-3.5 text-[var(--color-primary-light)] shrink-0" />
                      )}
                    </div>
                  ))}
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
                  {/* Country Selection (22 Arab Countries) */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "الدولة (22 دولة عربية)" : "Country (22 Arab Countries)"}
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] appearance-none cursor-pointer pr-10 rtl:pr-3.5 rtl:pl-10"
                      >
                        {ARAB_COUNTRIES.map((c) => (
                          <option
                            key={c.id}
                            value={c.name}
                            className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                          >
                            {isAr ? `${c.nameAr} (${c.currencyAr})` : `${c.name} (${c.currency})`}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-[var(--color-text-muted)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
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
                      {isAr ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={`${activeCountryObj.dialCode} 10 1234 5678`}
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "كلمة المرور لحساب صاحب المتجر" : "Store Owner Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••••••"
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
                          ? "إطلاق مساحة العمل"
                          : "Launch Workspace"
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
